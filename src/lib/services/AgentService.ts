import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AgentMessage, NewAgentMessage } from '../../types/case';

export class AgentService {
  private static getChatCollection(caseId: string) {
    return collection(db, `cases/${caseId}/agent_chats`);
  }

  static async getChatHistory(caseId: string): Promise<AgentMessage[]> {
    const chatCollection = this.getChatCollection(caseId);
    const q = query(chatCollection, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgentMessage));
  }

  static async addMessage(caseId: string, message: NewAgentMessage, userId: string): Promise<string> {
    const chatCollection = this.getChatCollection(caseId);
    const newMessage = {
      ...message,
      case: doc(db, 'cases', caseId),
      user: doc(db, 'users', userId),
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(chatCollection, newMessage);
    return docRef.id;
  }

  static async getGeminiResponse(prompt: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    // In a real app, you would make an API call to your backend, which then calls Gemini.
    // For this example, we'll simulate a delay and a canned response.
    // This avoids exposing the API key on the client side.
    console.log('Sending prompt to Gemini (simulation):', prompt);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const simulatedResponse = `This is a simulated Gemini response to: "${prompt}". In a real application, this would be a dynamic response from the AI.`;
    
    return simulatedResponse;
  }
}
