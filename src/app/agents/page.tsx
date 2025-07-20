"use client";

import { useState, useEffect } from 'react';
import { Send, Bot, User, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CaseService } from '@/lib/services/CaseService';
import { AgentService } from '@/lib/services/AgentService';
import type { Case } from '@/types/case';
import type { AgentMessage } from '@/types/case';
import { useAuth } from '@/context/AuthContext';



export default function AgentsPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [input, setInput] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const caseData = await CaseService.getAllCases();
        setCases(caseData);
      } catch (err) {
        setError('Failed to fetch cases.');
        console.error(err);
      }
    };
    fetchCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      const fetchChatHistory = async () => {
        setLoading(true);
        setError(null);
        try {
          const chatHistory = await AgentService.getChatHistory(selectedCaseId);
          setMessages(chatHistory);
        } catch (err) {
          setError('Failed to fetch chat history.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchChatHistory();
    }
  }, [selectedCaseId]);

    const handleSendMessage = async () => {
        if (input.trim() && selectedCaseId && user) {
      const userMessage: Omit<AgentMessage, 'id' | 'case' | 'user' | 'createdAt'> = { sender: 'user', text: input.trim() };
      setInput('');
      setLoading(true);

      try {
        // Add user message to Firestore and UI
        const userMessageId = await AgentService.addMessage(selectedCaseId, userMessage, user.uid);
        const fullUserMessage = { ...userMessage, id: userMessageId, createdAt: new Date() } as any; // Simplified for UI
        setMessages(prev => [...prev, fullUserMessage]);

        // Get response from Gemini
        const agentResponseText = await AgentService.getGeminiResponse(input.trim());
        const agentMessage: Omit<AgentMessage, 'id' | 'case' | 'user' | 'createdAt'> = { sender: 'agent', text: agentResponseText };

        // Add agent message to Firestore and UI
        const agentMessageId = await AgentService.addMessage(selectedCaseId, agentMessage, user.uid);
        const fullAgentMessage = { ...agentMessage, id: agentMessageId, createdAt: new Date() } as any; // Simplified for UI
        setMessages(prev => [...prev, fullAgentMessage]);

      } catch (err) {
        setError('Failed to send message.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-card border-b p-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Agent Chat
          </h1>
          <Select onValueChange={setSelectedCaseId} value={selectedCaseId || ''}>
            <SelectTrigger className="w-[320px]">
              <SelectValue placeholder="Select a case to begin..." />
            </SelectTrigger>
            <SelectContent>
              {cases.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.caseNumber} - {c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {!selectedCaseId && (
            <div className='text-center text-muted-foreground pt-20'>
              <Bot className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg">Please select a case to start the chat.</p>
            </div>
          )}
          {loading && messages.length === 0 && (
            <div className='text-center text-muted-foreground pt-20'>
              <p>Loading chat history...</p>
            </div>
          )}
          {error && (
            <div className='text-center text-red-500 pt-20'>
              <p>{error}</p>
              <p className="text-sm text-muted-foreground mt-2">This might be due to missing Firestore security rules for agent chats.</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
              {message.sender === 'agent' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
              <div className={`rounded-lg px-4 py-2 max-w-[75%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
              {message.sender === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
        </div>
      </main>

      <footer className="p-4 border-t bg-card flex-shrink-0">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            placeholder={selectedCaseId ? "Type your message here..." : "Please select a case first"}
            className="pr-12"
            disabled={!selectedCaseId || loading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleSendMessage}
            disabled={loading || !selectedCaseId || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          Press <CornerDownLeft className="h-3 w-3" /> to send.
        </p>
      </footer>
    </div>
  );
}
