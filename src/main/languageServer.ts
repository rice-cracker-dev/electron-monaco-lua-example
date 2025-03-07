import type { SpawnOptions } from 'node:child_process'
import { IWebSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc'
import { createConnection, createServerProcess, forward } from 'vscode-ws-jsonrpc/server'
import { InitializeRequest, Message, InitializeParams } from 'vscode-languageserver-protocol'

export interface StartLanguageServerOption {
  serverName: string
  command: string
  commandArgs?: string[]
  spawnOptions?: SpawnOptions
}

export const startLanguageServer = (
  socket: IWebSocket,
  options: StartLanguageServerOption
): void => {
  const reader = new WebSocketMessageReader(socket)
  const writer = new WebSocketMessageWriter(socket)

  const connection = createConnection(reader, writer, () => socket.dispose())
  const server = createServerProcess(
    options.serverName,
    options.command,
    options.commandArgs,
    options.spawnOptions
  )

  if (server) {
    forward(connection, server, (message) => {
      if (Message.isRequest(message) && message.method === InitializeRequest.type.method) {
        ;(message.params as InitializeParams).processId = process.pid
      }

      return message
    })
  } else {
    throw new Error('failed to launch language server')
  }
}
