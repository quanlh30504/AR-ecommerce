import { normalizeStr } from './normalize';

export function escapeRegex(s: string): string {
  // Escape regex special chars, safely handling backslash and closing bracket inside class
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizedQuery(q: string): string {
  return normalizeStr(q || '').trim();
}

export function prefixRegexNormalized(q: string): RegExp {
  const escaped = escapeRegex(normalizedQuery(q));
  return new RegExp('^' + escaped);
}

export function substringRegexNormalized(q: string): RegExp {
  const escaped = escapeRegex(normalizedQuery(q));
  return new RegExp(escaped);
}

export function rawCaseInsensitiveRegex(q: string): RegExp {
  return new RegExp(escapeRegex(q), 'i');
}

export default {
  escapeRegex,
  normalizedQuery,
  prefixRegexNormalized,
  substringRegexNormalized,
  rawCaseInsensitiveRegex,
};
