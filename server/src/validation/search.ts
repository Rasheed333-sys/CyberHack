import { config } from '../config';

export interface ValidationError {
  code: string;
  message: string;
}

export type SearchValidationResult = { query: string; maxResults: number } | { error: ValidationError };

export function validateSearchBody(body: unknown): SearchValidationResult {
  if (!body || typeof body !== 'object') {
    return { error: { code: 'INVALID_BODY', message: 'Request body must be a JSON object.' } };
  }

  const { query, maxResults } = body as { query?: unknown; maxResults?: unknown };

  if (typeof query !== 'string' || query.trim().length === 0) {
    return { error: { code: 'INVALID_QUERY', message: '"query" must be a non-empty string.' } };
  }
  if (query.length > config.searchRequest.maxQueryLength) {
    return {
      error: {
        code: 'QUERY_TOO_LONG',
        message: `"query" exceeds the ${config.searchRequest.maxQueryLength} character limit.`,
      },
    };
  }

  let resolvedMaxResults = config.search.maxResults;
  if (maxResults !== undefined) {
    if (typeof maxResults !== 'number' || !Number.isInteger(maxResults) || maxResults < 1) {
      return { error: { code: 'INVALID_MAX_RESULTS', message: '"maxResults" must be a positive integer.' } };
    }
    if (maxResults > config.searchRequest.maxResultsCeiling) {
      return {
        error: {
          code: 'MAX_RESULTS_TOO_HIGH',
          message: `"maxResults" cannot exceed ${config.searchRequest.maxResultsCeiling}.`,
        },
      };
    }
    resolvedMaxResults = maxResults;
  }

  return { query: query.trim(), maxResults: resolvedMaxResults };
}