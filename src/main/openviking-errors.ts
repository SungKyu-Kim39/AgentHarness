/** Fixed diagnostic categories only. Never return upstream text, paths or credentials. */
export function vikingErrorCode(text: string): string {
  if (/^OV_(?:AUTH|EMBEDDING_DIMENSION|TOKENIZER|PERMISSION|PATH_LENGTH|PATH|CONNECTION|NOT_FOUND|CONFLICT|RESPONSE_FORMAT|REQUEST)$/.test(text)) return text;
  if (/invalid.*(?:api.?key|token)|unauthorized|authentication/i.test(text)) return 'OV_AUTH';
  if (/dimension|vector.*(?:size|length)/i.test(text)) return 'OV_EMBEDDING_DIMENSION';
  if (/cl100k|tiktoken|tokenizer/i.test(text)) return 'OV_TOKENIZER';
  if (/WinError 5|PermissionError|Access is denied|permission denied/i.test(text)) return 'OV_PERMISSION';
  if (/WinError 206|filename.*too long|path.*too long/i.test(text)) return 'OV_PATH_LENGTH';
  if (/invalid.*(?:path|uri)|not.*valid.*uri|unsupported.*scheme/i.test(text)) return 'OV_PATH';
  if (/connection|ECONNRESET|ECONNREFUSED|ENOTFOUND|network|DNS/i.test(text)) return 'OV_CONNECTION';
  if (/not found|NOT_FOUND/i.test(text)) return 'OV_NOT_FOUND';
  if (/conflict|already exists|ALREADY_EXISTS/i.test(text)) return 'OV_CONFLICT';
  if (/json|validation|INVALID_ARGUMENT/i.test(text)) return 'OV_RESPONSE_FORMAT';
  return 'OV_REQUEST';
}
