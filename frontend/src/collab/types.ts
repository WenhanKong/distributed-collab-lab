import type { Awareness } from 'y-protocols/awareness'
import type * as Y from 'yjs'

export type TransportKind = 'hocuspocus' | 'webrtc' | 'hybrid'
export type TransportStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export interface CollabTransport {
  readonly kind: TransportKind
  connect(): void
  disconnect(): void
  destroy(): void
  getStatus(): TransportStatus
  subscribeStatus(listener: (status: TransportStatus) => void): () => void
  subscribeSynced?(listener: () => void): () => void
}

export interface CollabTransportConfig {
  room: string
  doc: Y.Doc
  awareness: Awareness
}

export type CollabTransportFactory = (config: CollabTransportConfig) => CollabTransport
