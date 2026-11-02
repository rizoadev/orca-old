export const MAX_INTEGRATION_ERROR_MESSAGE_CHARS = 16 * 1024

export function boundedIntegrationErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (message.length <= MAX_INTEGRATION_ERROR_MESSAGE_CHARS) {
    return message
  }
  return `${message.slice(0, MAX_INTEGRATION_ERROR_MESSAGE_CHARS - 1)}…`
}
