import { Router } from 'express';
import { validateChatBody } from '../validation/chat';
import { runChat } from '../services/ai/aiService';

export const chatRouter = Router();

const REQUEST_TIMEOUT_MS = 45_000;

chatRouter.post('/chat', async (req, res) => {
  const validation = validateChatBody(req.body);
  if ('error' in validation) {
    res.status(400).json({ error: validation.error });
    return;
  }

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
    await runChat(validation.messages, (token) => send({ token }), controller.signal);
    send({ done: true });
  } catch (err) {
    // The real error is logged server-side only; the client gets a clean,
    // generic message — never a stack trace or provider error detail.
    const detail = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('[chat] provider error:', detail);
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