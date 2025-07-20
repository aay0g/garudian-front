import { IPublicClientApplication, AuthenticationResult } from '@azure/msal-browser';
import { Client } from '@microsoft/microsoft-graph-client';
import { loginRequest } from './msal';

// This function is now private to the module and requires the instance
async function getAccessToken(instance: IPublicClientApplication): Promise<string> {
  const account = instance.getActiveAccount();
  if (!account) {
    throw new Error('No active account! Please sign in to call Microsoft Graph.');
  }

  const response: AuthenticationResult = await instance.acquireTokenSilent({
    ...loginRequest,
    account: account,
  });

  return response.accessToken;
}

// The Graph client is now created on-demand using the provided MSAL instance
function getGraphClient(instance: IPublicClientApplication): Client {
  return Client.init({
    authProvider: async (done) => {
      try {
        const accessToken = await getAccessToken(instance);
        done(null, accessToken);
      } catch (err: any) {
        done(err, null);
      }
    },
  });
}

export async function getMyEmails(instance: IPublicClientApplication) {
    console.log("Attempting to fetch emails from Graph API...");
    const client = getGraphClient(instance);
    const messages = await client
        .api('/me/messages')
        .select('subject,from,receivedDateTime,isRead,bodyPreview')
        .top(25)
        .orderby('receivedDateTime DESC')
        .get();
    console.log("Raw response from Graph API:", messages);
    return messages.value;
}

export async function getSentItems(instance: IPublicClientApplication) {
    console.log('Fetching sent items...');
    const client = getGraphClient(instance);
    const messages = await client
        .api('/me/mailFolders/sentitems/messages')
        .select('subject,toRecipients,sentDateTime,isRead,bodyPreview,id')
        .top(25)
        .get();
    console.log("Raw response from Graph API (Sent Items):", messages);
    return messages.value;
}

export async function getEmailById(instance: IPublicClientApplication, emailId: string) {
    console.log(`Fetching email with ID: ${emailId}`);
    const client = getGraphClient(instance);
    const email = await client
        .api(`/me/messages/${emailId}`)
        // Request the full body, not just the preview
        .select('subject,from,toRecipients,receivedDateTime,sentDateTime,body')
        .get();
    console.log("Raw response for single email:", email);
    return email;
}

export async function sendEmail(instance: IPublicClientApplication, to: string, subject: string, content: string) {
    const client = getGraphClient(instance);

    const message = {
        subject: subject,
        body: {
            contentType: 'HTML',
            content: content,
        },
        toRecipients: [
            {
                emailAddress: {
                    address: to,
                },
            },
        ],
    };

    await client.api('/me/sendMail').post({ message });
}
