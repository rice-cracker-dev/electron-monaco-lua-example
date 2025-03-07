// lsp-client.ts
import { WebSocketMessageReader } from 'vscode-ws-jsonrpc'
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient/browser.js'
import { WebSocketMessageWriter } from 'vscode-ws-jsonrpc'
import { toSocket } from 'vscode-ws-jsonrpc'
import { MonacoLanguageClient } from 'monaco-languageclient'

export const initWebSocketAndStartClient = (url: string): WebSocket => {
  const webSocket = new WebSocket(url)
  webSocket.onopen = (): void => {
    // creating messageTransport
    const socket = toSocket(webSocket)
    const reader = new WebSocketMessageReader(socket)
    const writer = new WebSocketMessageWriter(socket)
    // creating language client
    const languageClient = createLanguageClient({
      reader,
      writer
    })
    languageClient.start()
    reader.onClose(() => languageClient.stop())
  }
  return webSocket
}
const createLanguageClient = (messageTransports: MessageTransports): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: 'Lua Language Client',
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['lua'],
      // disable the default error handler
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart })
      }
    },
    // create a language client connection from the JSON RPC connection on demand
    messageTransports
  })
}
