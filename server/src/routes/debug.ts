import { Router } from 'express';

const router = Router();

router.get('/groq-models', async (_req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GROQ_API_KEY is not configured on the server.',
      });
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/models',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Groq model request failed.',
        groqStatus: response.status,
        details: text.slice(0, 1000),
      });
    }

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: 'Groq returned an invalid JSON response.',
      });
    }

    return res.json(data);
  } catch (error) {
    console.error('[debug/groq-models] error:', error);

    return res.status(500).json({
      error: 'Failed to contact Groq.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;