import { HocuspocusProvider } from '@hocuspocus/provider'
import type { Awareness } from 'y-protocols/awareness'
import type * as Y from 'yjs'

import { SimpleEmitter } from '../utils/emitter'
import type { CollabTransport, CollabTransportConfig, TransportStatus } from '../types'

export interface HocuspocusTransportOptions {
	serverUrl: string
	room: string
	doc: Y.Doc
	awareness: Awareness
	token?: string
}

const statusMap: Record<string, TransportStatus> = {
	connecting: 'connecting',
	connected: 'connected',
	disconnected: 'disconnected',
}

export class HocuspocusTransport implements CollabTransport {
	readonly kind = 'hocuspocus' as const

	private provider: HocuspocusProvider
	private status: TransportStatus = 'idle'
	private statusEmitter = new SimpleEmitter<TransportStatus>()
	private syncedEmitter = new SimpleEmitter<void>()

	private statusHandler = (event: { status: string }) => {
		const next = statusMap[event.status] ?? 'error'
		this.setStatus(next)
	}

	private syncedHandler = () => {
		this.syncedEmitter.emit()
	}

	constructor(options: HocuspocusTransportOptions) {
		this.provider = new HocuspocusProvider({
			url: options.serverUrl,
			name: options.room,
			document: options.doc,
			awareness: options.awareness,
			token: options.token,
		})

			// Ensure we start in a disconnected state so the consumer controls the lifecycle.
			this.provider.disconnect()
				this.setStatus('disconnected')

		this.provider.on('status', this.statusHandler)
		this.provider.on('synced', this.syncedHandler)
	}

	static create(options: Omit<HocuspocusTransportOptions, keyof CollabTransportConfig>): (config: CollabTransportConfig) => HocuspocusTransport {
		return (config) =>
			new HocuspocusTransport({
				serverUrl: options.serverUrl,
				token: options.token,
				room: config.room,
				doc: config.doc,
				awareness: config.awareness,
			})
	}

	connect(): void {
		if (this.status === 'connected' || this.status === 'connecting') {
			return
		}
		this.setStatus('connecting')
		this.provider.connect()
	}

	disconnect(): void {
		if (this.status === 'disconnected' || this.status === 'idle') {
			return
		}
		this.provider.disconnect()
		this.setStatus('disconnected')
	}

	destroy(): void {
		this.provider.off('status', this.statusHandler)
		this.provider.off('synced', this.syncedHandler)
		this.provider.destroy()
		this.statusEmitter.clear()
		this.syncedEmitter.clear()
		this.status = 'disconnected'
	}

	getStatus(): TransportStatus {
		return this.status
	}

	subscribeStatus(listener: (status: TransportStatus) => void): () => void {
		return this.statusEmitter.subscribe(listener)
	}

	subscribeSynced(listener: () => void): () => void {
		return this.syncedEmitter.subscribe(listener)
	}

	private setStatus(status: TransportStatus) {
		if (status === this.status) {
			return
		}
		this.status = status
		this.statusEmitter.emit(this.status)
	}

	getProvider(): HocuspocusProvider {
		return this.provider
	}
}
