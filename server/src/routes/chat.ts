import { Router } from 'express';
import { validateChatBody } from '../validation/chat';
import { runChat } from '../services/ai/aiService';
import { shouldAutoSearch } from '../services/search/searchDecision';
import { gatherSources } from '../services/search/sourceGatherer';
import { toPublicSource } from '../services/search/types';

export const chatRouter = Router();

const REQUEST_TIMEOUT_MS = 45_000;

chatRouter.post('/chat', async (req, res) => {
  const validation = validateChatBody(req.body);
  if ('error' in validation) {
    res.status(400).json({ error: validation.error });
    return;
  }
  const { messages, mode } = validation;

  // Server-Sent Events response. Chosen over WebSockets because this is a
  // one-shot request → progressive-response stream, which SSE handles with
  // far less complexity, and it works over plain HTTP through Render.
  res.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  req.on('close', () => controller.abort());

  const send = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const lastUserMessage = messages[messages.length - 1].content;

    // Decide whether to search: explicit mode wins; AUTO falls back to the
    // simple heuristic. "chat" never searches.
    const shouldSearch = mode === 'web' ? true : mode === 'chat' ? false : shouldAutoSearch(lastUserMessage);

    let sources: Awaited<ReturnType<typeof gatherSources>>['sources'] = [];
    let searched = false;

    if (shouldSearch) {
      send({ step: { id: 'search', label: 'Searching the web', status: 'active' } });
      const gathered = await gatherSources(lastUserMessage);
      sources = gathered.sources;
      searched = gathered.searched;

      if (searched) {
        send({ step: { id: 'search', label: 'Searching the web', status: 'done' } });
        send({ step: { id: 'sources', label: 'Reading sources', status: 'done' } });
        send({ sources: sources.map(toPublicSource) });
      } else {
        // Explicit, honest status instead of silently pretending nothing
        // was requested — matches the required graceful-fallback behavior.
        send({ step: { id: 'search', label: 'Web search unavailable — answering from general knowledge', status: 'error' } });
      }
    }

    send({ step: { id: 'synthesize', label: 'Synthesizing', status: 'active' } });
    await runChat(messages, (token) => send({ token }), controller.signal, sources);
    send({ step: { id: 'synthesize', label: 'Synthesizing', status: 'done' } });
    send({ done: true, searched });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('[chat] error:', detail);
    send({
      error: {
        code: 'AI_REQUEST_FAILED',
        message: "CyberHack couldn't complete this request. Please try again.",
      },
    });
  } finally {
    clearTimeout(timeout);
    res.end();
  }
});