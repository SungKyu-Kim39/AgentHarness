/** Fixed diagnostic categories only. Never return upstream text, paths or credentials. */
const knownCodes = /^OV_(?:AUTH|FORBIDDEN|TIMEOUT|TLS|EMBEDDING_DIMENSION|EMBEDDING|TOKENIZER|PERMISSION|PATH_LENGTH|PATH|CONNECTION|NOT_FOUND|CONFLICT|RESPONSE_FORMAT|SERVER_ERROR|REQUEST)$/;

export function vikingErrorCode(text: string, status?: number): string {
  const trimmed = text.trim();
  if (knownCodes.test(trimmed)) return trimmed;
  const embedded = trimmed.match(/\[(OV_[A-Z_]+)\]/);
  if (embedded && knownCodes.test(embedded[1])) return embedded[1];
  if (status === 401 || /invalid.*(?:api.?key|token)|unauthorized|authentication/i.test(text)) return 'OV_AUTH';
  if (status === 403 || /\b403\b|forbidden|insufficient.*permission|access.*forbidden/i.test(text)) return 'OV_FORBIDDEN';
  if (status === 504 || status === 408 || /timed?\s*out|timeout|ETIMEDOUT|ESOCKETTIMEDOUT|\b504\b/i.test(text)) return 'OV_TIMEOUT';
  if (/certificate|CERT_|UNABLE_TO_VERIFY|SELF_SIGNED|ERR_TLS|\bssl\b|\btls\b|x509/i.test(text)) return 'OV_TLS';
  if (/dimension|vector.*(?:size|length)/i.test(text)) return 'OV_EMBEDDING_DIMENSION';
  if (/embedding|\bembed\b|model.*not.*found|no.*such.*model|OV_MODEL_HTTP|사내\s*임베딩/i.test(text)) return 'OV_EMBEDDING';
  if (/cl100k|tiktoken|tokenizer/i.test(text)) return 'OV_TOKENIZER';
  if (/WinError 5|PermissionError|Access is denied|permission denied/i.test(text)) return 'OV_PERMISSION';
  if (/WinError 206|filename.*too long|path.*too long/i.test(text)) return 'OV_PATH_LENGTH';
  if (/invalid.*(?:path|uri)|not.*valid.*uri|unsupported.*scheme/i.test(text)) return 'OV_PATH';
  if (/connection|ECONNRESET|ECONNREFUSED|ENOTFOUND|network|DNS/i.test(text)) return 'OV_CONNECTION';
  if (status === 404 || /not found|NOT_FOUND/i.test(text)) return 'OV_NOT_FOUND';
  if (status === 409 || /conflict|already exists|ALREADY_EXISTS/i.test(text)) return 'OV_CONFLICT';
  if (/json|validation|INVALID_ARGUMENT/i.test(text)) return 'OV_RESPONSE_FORMAT';
  if ((status !== undefined && status >= 500 && status <= 599) || /\b(?:500|502|503)\b|internal\s*server\s*error|internal\s*error|bad\s*gateway|service\s*unavailable/i.test(text)) return 'OV_SERVER_ERROR';
  return 'OV_REQUEST';
}

export function sanitizeVikingDiagnostic(text: string, secrets: readonly string[] = [], maxChars = 500): string {
  let output = text;
  for (const secret of [...secrets].filter(Boolean).sort((a, b) => b.length - a.length)) {
    output = output.split(secret).join('[REDACTED]');
  }
  return output
    .replace(/Bearer\s+[A-Za-z0-9_.~+/=-]+/gi, 'Bearer [REDACTED]')
    .replace(/Basic\s+[A-Za-z0-9+/=]+/gi, 'Basic [REDACTED]')
    .replace(/(?:api[_-]?key|x-api-key|token|password|secret)\s*[:=]\s*["']?[^\s"',;}]+/gi, '[REDACTED]')
    .replace(/[A-Za-z]:\\Users\\[^\\\s"',;]+/gi, 'C:\\Users\\<redacted>')
    .replace(/\/(?:home|Users)\/[^/\s"',;]+/g, '/<redacted>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxChars);
}
