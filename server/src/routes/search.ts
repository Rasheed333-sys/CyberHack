import { Router } from 'express';
import { validateSearchBody } from '../validation/search';
import { search, currentSearchProviderName } from '../services/search/searchService';

export const searchRouter = Router();

searchRouter.post('/search', async (req, res) => {
  const validation = validateSearchBody(req.body);
  if ('error' in validation) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const results = await search(validation.query, validation.maxResults);
    res.json({ results });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error(`[search] provider (${currentSearchProviderName()}) error:`, detail);
    res.status(502).json({
      error: {
        code: 'SEARCH_UNAVAILABLE',
        message: "CyberHack couldn't reach live search results right now. Please try again shortly.",
      },
    });
  }
});