import { WebrtcProvider } from 'y-webrtc'
import type { Awareness } from 'y-protocols/awareness'
import type * as Y from 'yjs'

import { SimpleEmitter } from '../utils/emitter'
import type { CollabTransport, CollabTransportConfig, TransportStatus } from '../types'

export interface WebRTCTransportOptions {
	room: string
	doc: Y.Doc
	awareness: Awareness
	signaling?: string[]
	password?: string
	maxConns?: number
}

const statusMap: Record<string, TransportStatus> = {
	connecting: 'connecting',
	connected: 'connected',
	disconnected: 'disconnected',
}

export class WebRTCTransport implements CollabTransport {
	readonly kind = 'webrtc' as const

	private provider: WebrtcProvider
	private status: TransportStatus = 'idle'
	private statusEmitter = new SimpleEmitter<TransportStatus>()

	private statusHandler = (status: string | { status: string }) => {
		const nextStatus = typeof status === 'string' ? status : status.status
		const next = statusMap[nextStatus] ?? 'error'
		this.setStatus(next)
	}

	constructor(options: WebRTCTransportOptions) {
		this.provider = new WebrtcProvider(options.room, options.doc, {
			awareness: options.awareness,
			signaling: options.signaling ?? ['wss://signaling.yjs.dev'],
			password: options.password,
			maxConns: options.maxConns,
			connect: false,
		} as any)

		// Ensure lifecycle stays caller-controlled.
		this.provider.disconnect()
		this.setStatus('disconnected')

		this.provider.on('status', this.statusHandler as any)
	}

	static create(options: Omit<WebRTCTransportOptions, keyof CollabTransportConfig>): (config: CollabTransportConfig) => WebRTCTransport {
		return (config) =>
			new WebRTCTransport({
				room: config.room,
				doc: config.doc,
				awareness: config.awareness,
				signaling: options.signaling,
				password: options.password,
				maxConns: options.maxConns,
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
		this.provider.off('status', this.statusHandler as any)
		this.provider.destroy()
		this.statusEmitter.clear()
		this.status = 'disconnected'
	}

	getStatus(): TransportStatus {
		return this.status
	}

	subscribeStatus(listener: (status: TransportStatus) => void): () => void {
		return this.statusEmitter.subscribe(listener)
	}

	private setStatus(status: TransportStatus) {
		if (status === this.status) {
			return
		}
		this.status = status
		this.statusEmitter.emit(this.status)
	}
}
