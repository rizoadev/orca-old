/**
 * IPC handlers for Gemini Live / OpenAI Realtime API key management.
 * Registered on main process startup. Key storage uses safeStorage.
 */
import { ipcMain } from 'electron'
import { hasGeminiApiKey, saveGeminiApiKey, clearGeminiApiKey } from './voice/gemini-api-key-store'
import { hasOpenAiApiKey, saveOpenAiApiKey, clearOpenAiApiKey } from './voice/openai-api-key-store'

export function registerVoiceKeyHandlers(): void {
  ipcMain.removeHandler('voiceCall:getGeminiKeyStatus')
  ipcMain.removeHandler('voiceCall:saveGeminiApiKey')
  ipcMain.removeHandler('voiceCall:clearGeminiApiKey')
  ipcMain.removeHandler('voiceCall:getOpenAiKeyStatus')
  ipcMain.removeHandler('voiceCall:saveOpenAiApiKey')
  ipcMain.removeHandler('voiceCall:clearOpenAiApiKey')
  ipcMain.removeHandler('voiceCall:getKeyStatus')

  ipcMain.handle('voiceCall:getGeminiKeyStatus', () => ({ configured: hasGeminiApiKey() }))
  ipcMain.handle('voiceCall:saveGeminiApiKey', (_e, apiKey: string) => {
    saveGeminiApiKey(String(apiKey ?? ''))
    return { configured: true }
  })
  ipcMain.handle('voiceCall:clearGeminiApiKey', () => {
    clearGeminiApiKey()
    return { configured: false }
  })

  ipcMain.handle('voiceCall:getOpenAiKeyStatus', () => ({ configured: hasOpenAiApiKey() }))
  ipcMain.handle('voiceCall:saveOpenAiApiKey', (_e, apiKey: string) => {
    saveOpenAiApiKey(String(apiKey ?? ''))
    return { configured: true }
  })
  ipcMain.handle('voiceCall:clearOpenAiApiKey', () => {
    clearOpenAiApiKey()
    return { configured: false }
  })

  ipcMain.handle('voiceCall:getKeyStatus', () => ({
    gemini: hasGeminiApiKey(),
    openai: hasOpenAiApiKey()
  }))
}
