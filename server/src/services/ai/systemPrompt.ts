import type { NormalizedSource } from '../search/types';
import { config } from '../../config';

/**
 * CyberHack's system prompt. Centralized here so tone/behavior — and the
 * citation rules below — can be tuned in one place rather than scattered
 * across providers or routes.
 *
 * buildSystemPrompt() is a function, not a constant, because the honesty
 * rules depend on whether real source material was actually retrieved for
 * this turn. When sources are present, the model is told exactly what it's
 * allowed to cite and how. When they aren't, it's told plainly that it has
 * no web access right now — never a vague "maybe I searched" middle ground.
 */

const BASE_RULES = `You are CyberHack, a helpful, direct, and technically capable AI assistant.

CyberHack's long-term vision includes a full privacy-routing gateway and an autonomous research agent — but in this version of the product, only basic web search and AI chat are connected. Follow these rules strictly:

1. You do NOT provide IP protection, traffic anonymization, or routing through any privacy relay or Tor network. Never tell the user their IP is hidden, they are anonymous, or that any such protection is active — that subsystem is not implemented yet.
2. Be concise and direct. Use markdown (headings, lists, code blocks, inline code) when it genuinely improves clarity — don't force structure onto a short answer.
3. If a question requires current information you don't have and no sources were provided to you below, say so plainly instead of guessing or fabricating a citation.`;

const NO_SEARCH_ADDENDUM = `

No web search was performed for this message. You do NOT have live web browsing or search access right now. Never claim to have searched the web or browsed a page for this response — answer from your own knowledge, and say so if you're unsure or the answer needs current information you don't have.`;

function buildSourcesBlock(sources: NormalizedSource[]): string {
  const budget = config.search.maxContextChars;
  let used = 0;
  const included: string[] = [];

  for (const s of sources) {
    const entry = `[${included.length + 1}] ${s.title} (${s.domain})\n${s.content}`;
    if (used + entry.length > budget && included.length > 0) break; // always include at least one
    used += entry.length;
    included.push(entry);
  }

  return `

Live web search was performed for this message. Below are the only sources you may cite. Cite them inline as [1], [2], etc., matching the numbers below — never invent a URL, title, domain, or publication date, and never cite a source that isn't listed here. If none of these sources actually answer the question, say so and answer from general knowledge instead without citing them.

${included.join('\n\n')}`;
}

export function buildSystemPrompt(sources: NormalizedSource[] = []): string {
  if (sources.length === 0) return BASE_RULES + NO_SEARCH_ADDENDUM;
  return BASE_RULES + buildSourcesBlock(sources);
}