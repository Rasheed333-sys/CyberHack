import { config } from '../../../config';
import type { AIProvider, ChatMessage } from '../types';

/**
 * Groq's API is OpenAI-compatible (POST /chat/completions, SSE streaming
 * identical to OpenAI's format), so this is implemented with plain fetch
 * rather than an SDK dependency. Swapping to another OpenAI-compatible
 * provider later mostly means changing baseUrl/apiKey/model in config.ts.
 */
export function createGroqProvider(): AIProvider {
  return {
    name: 'groq',

    async stream(messages: ChatMessage[], onToken, signal) {
      if (!config.groq.apiKey) {
        throw new Error('AI provider is not configured on the server (missing GROQ_API_KEY).');
      }

      const res = await fetch(`${config.groq.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.groq.apiKey}`,
        },
        body: JSON.stringify({
          model: config.groq.model,
          messages,
          stream: true,
          temperature: 0.6,
        }),
        signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '');
        throw new Error(`Provider request failed (${res.status}): ${text.slice(0, 300)}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;

          let json: unknown;
          try {
            json = JSON.parse(payload);
          } catch {
            continue; // ignore malformed/partial SSE chunks
          }

          const token = (json as { choices?: { delta?: { content?: string } }[] })?.choices?.[0]?.delta?.content;
          if (token) {
            full += token;
            onToken(token);
          }
        }
      }

      return full;
    },
  };
}