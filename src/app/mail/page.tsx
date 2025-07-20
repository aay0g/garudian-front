"use client";

import { useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest } from '@/lib/msal';
import { getMyEmails, getEmailById, sendEmail, getSentItems } from '@/lib/graph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail as MailIcon, LogIn, ArrowLeft, Send, Inbox } from 'lucide-react';

interface EmailListItem {
  id: string;
  subject: string;
  isRead: boolean;
  bodyPreview: string;
  // For Inbox
  from?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime?: string;
  // For Sent Items
  toRecipients?: {
    emailAddress: {
      name: string;
      address: string;
    };
  }[];
  sentDateTime?: string;
}

interface Email extends EmailListItem {
    body: {
        contentType: string;
        content: string;
    }
}

const MailPage = () => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [emails, setEmails] = useState<EmailListItem[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [currentView, setCurrentView] = useState<'inbox' | 'sent'>('inbox');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.error(e);
      setError('Failed to sign in. Please try again.');
    });
  };

    useEffect(() => {
    // Clear emails when the view changes to prevent showing stale data.
    setEmails([]);

    // Diagnostic log to trace MSAL state
    console.log('MailPage useEffect triggered. MSAL state:', {
      isAuthenticated,
      inProgress,
      accountsCount: accounts.length,
      hasActiveAccount: !!instance.getActiveAccount(),
    });

    // If an account is present but not active, set it as active.
    if (inProgress === 'none' && accounts.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(accounts[0]);
    }

    const fetchEmails = async () => {
      // Ensure we have an authenticated user before fetching.
      if (isAuthenticated && inProgress === 'none' && accounts.length > 0 && instance.getActiveAccount()) {
        setLoading(true);
        setError(null);
        try {
          const mailData = currentView === 'inbox'
            ? await getMyEmails(instance)
            : await getSentItems(instance);
          setEmails(mailData);
        } catch (e: any) {
          console.error(e);
          if (e.message.includes('No active account')) {
            setError('Your session might have expired. Please sign in again.');
          } else {
             setError(`Failed to fetch ${currentView}. Please check your permissions and try again.`);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEmails();
  }, [isAuthenticated, accounts, instance, inProgress, currentView]);

  useEffect(() => {
    const fetchEmailDetails = async () => {
      if (selectedEmailId && instance) {
        setLoading(true);
        setError(null);
        try {
          const emailData = await getEmailById(instance, selectedEmailId);
          setSelectedEmail(emailData);
        } catch (e: any) {
          console.error(e);
          setError('Failed to fetch email details.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEmailDetails();
  }, [selectedEmailId, instance]);

  const handleSendEmail = async () => {
    if (!instance || !composeTo || !composeSubject || !composeBody) {
      setError('Please fill out all fields to send the email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendEmail(instance, composeTo, composeSubject, composeBody);
      setIsComposing(false);
      // Reset fields after sending
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
    } catch (e: any) {
      console.error('Failed to send email:', e);
      setError(`Failed to send email. ${e.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToInbox = () => {
    setSelectedEmailId(null);
    setSelectedEmail(null);
  };

  if (selectedEmail) {
    // Prepare display data for the detailed view to handle both sent and received items.
    const displayDate = selectedEmail.sentDateTime || selectedEmail.receivedDateTime;
    const dateLabel = selectedEmail.sentDateTime ? 'Sent' : 'Received';

    return (
      <div className="p-4">
        <Button onClick={handleBackToInbox} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inbox
        </Button>
        <div className="border rounded-lg p-4">
            <h2 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h2>
            <div className="text-sm text-muted-foreground mb-4">
                {selectedEmail.from && (
                    <p><strong>From:</strong> {selectedEmail.from.emailAddress.name} ({selectedEmail.from.emailAddress.address})</p>
                )}
                {selectedEmail.toRecipients && selectedEmail.toRecipients.length > 0 && (
                    <p><strong>To:</strong> {selectedEmail.toRecipients.map(r => r.emailAddress.name).join(', ')}</p>
                )}
                {displayDate && (
                    <p><strong>{dateLabel}:</strong> {new Date(displayDate).toLocaleString()}</p>
                )}
            </div>
            <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body.content }}
            />
        </div>
      </div>
    );
  }

  if (isComposing) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Compose Email</h2>
        <div className="space-y-4">
          <Input 
            placeholder="To: recipient@example.com"
            value={composeTo}
            onChange={(e) => setComposeTo(e.target.value)}
            disabled={loading}
          />
          <Input 
            placeholder="Subject"
            value={composeSubject}
            onChange={(e) => setComposeSubject(e.target.value)}
            disabled={loading}
          />
          <Textarea 
            placeholder="Email body..."
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value)}
            rows={10}
            disabled={loading}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsComposing(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed shadow-sm h-[80vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <MailIcon className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">Microsoft Mail</h1>
          <p className="text-lg text-muted-foreground">
            Connect your Microsoft account to read and send emails.
          </p>
          <Button onClick={handleLogin} size="lg">
            <LogIn className="mr-2 h-5 w-5" />
            Sign in with Microsoft
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button variant={currentView === 'inbox' ? 'secondary' : 'ghost'} onClick={() => setCurrentView('inbox')}>
            <Inbox className="mr-2 h-4 w-4"/> Inbox
          </Button>
          <Button variant={currentView === 'sent' ? 'secondary' : 'ghost'} onClick={() => setCurrentView('sent')}>
            <Send className="mr-2 h-4 w-4"/> Sent
          </Button>
        </div>
        <Button onClick={() => setIsComposing(true)}>
          <Send className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-4 capitalize">{currentView === 'sent' ? 'Sent Items' : 'Inbox'}</h1>
      {error && (
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={handleLogin}>
            <LogIn className="mr-2 h-4 w-4" /> Sign in again
          </Button>
        </div>
      )}
      {loading && (
        <div className="text-center p-4">
          <p className="text-muted-foreground">Loading emails...</p>
        </div>
      )}

      {!loading && !error && emails.length === 0 && (
        <div className="text-center p-4">
          <p className="text-muted-foreground">No emails found.</p>
        </div>
      )}

      {!loading && emails.length > 0 && (
        <ul className="space-y-2">
          {emails.map((email) => {
            const displayName = currentView === 'sent' && email.toRecipients && email.toRecipients.length > 0
              ? `To: ${email.toRecipients.map(r => r.emailAddress.name).join(', ')}`
              : email.from?.emailAddress.name || 'Unknown Sender';
            
            const displayDate = email.sentDateTime || email.receivedDateTime;

            return (
              <li key={email.id} 
                  onClick={() => setSelectedEmailId(email.id)}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/80 ${email.isRead ? 'bg-card' : 'bg-muted'}`}>
                <div className="font-semibold">{displayName}</div>
                <div className="text-sm font-medium">{email.subject}</div>
                <p className="text-xs text-muted-foreground truncate">{email.bodyPreview}</p>
                <div className="text-xs text-muted-foreground text-right mt-1">
                  {displayDate ? new Date(displayDate).toLocaleString() : ''}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MailPage;
