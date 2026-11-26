export const userMcpToolName = 'user_mcp_call';
export const userMcpModelToolName = 'ned_host_' + userMcpToolName;
export const userMcpCommandPattern = /^\s*\/mcp-([a-z0-9]+(?:-[a-z0-9]+)*)(?=\s|$)/;
const ticketLabel = 'NED_USER_MCP_TICKET:';
export const userMcpTicketPattern = /^NED_USER_MCP_TICKET:([a-f0-9]{48})\r?\n/;
export function mcpPromptWithTicket(ticket: string, text: string) { return `${ticketLabel}${ticket}\n${text}`; }
