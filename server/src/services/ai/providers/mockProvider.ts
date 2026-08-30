import type { AIProvider } from '../types';

export function createMockProvider(): AIProvider {
  return {
    name: 'mock',

    async stream(messages, onToken) {
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      const text =
        `This is a mock response from the CyberHack backend (USE_MOCK_AI=true) — no real AI ` +
        `provider was called. You said: "${lastUser?.content ?? ''}". Set USE_MOCK_AI=false and ` +
        `provide GROQ_API_KEY on the server to get real responses.`;

      const words = text.split(' ');
      let full = '';
      for (const word of words) {
        const token = word + ' ';
        full += token;
        onToken(token);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      return full;
    },
  };
}