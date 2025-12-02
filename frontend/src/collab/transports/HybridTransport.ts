import { SimpleEmitter } from '../utils/emitter'
import type { CollabTransport, CollabTransportConfig, CollabTransportFactory, TransportStatus } from '../types'
import { HocuspocusTransport } from './HocuspocusTransport'
import { WebRTCTransport } from './WebRTCTransport'

export interface HybridTransportOptions {
	serverUrl: string
	enableWebRTC?: boolean
	signaling?: string[]
	token?: string
	maxConns?: number
}

export class HybridTransport implements CollabTransport {
	readonly kind = 'hybrid' as const

	private hocuspocus: HocuspocusTransport
	private webrtc?: WebRTCTransport
	private status: TransportStatus = 'idle'
	private statusEmitter = new SimpleEmitter<TransportStatus>()
	private syncedEmitter = new SimpleEmitter<void>()
	private unsubscribers: Array<() => void> = []

	constructor(config: CollabTransportConfig, options: HybridTransportOptions) {
		this.hocuspocus = new HocuspocusTransport({
			serverUrl: options.serverUrl,
			room: config.room,
			doc: config.doc,
			awareness: config.awareness,
			token: options.token,
		})

		this.unsubscribers.push(this.hocuspocus.subscribeStatus(() => this.updateStatus()))
		this.unsubscribers.push(this.hocuspocus.subscribeSynced(() => this.syncedEmitter.emit()))

		if (options.enableWebRTC !== false) {
			this.webrtc = new WebRTCTransport({
				room: config.room,
				doc: config.doc,
				awareness: config.awareness,
				signaling: options.signaling,
				maxConns: options.maxConns,
			})
			this.unsubscribers.push(this.webrtc.subscribeStatus(() => this.updateStatus()))
		}

		this.updateStatus()
	}

	static createFactory(options: HybridTransportOptions): CollabTransportFactory {
		return (config) => new HybridTransport(config, options)
	}

	connect(): void {
		this.hocuspocus.connect()
		this.webrtc?.connect()
		this.updateStatus()
	}

	disconnect(): void {
		this.hocuspocus.disconnect()
		this.webrtc?.disconnect()
		this.updateStatus()
	}

	destroy(): void {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe()
		}
		this.unsubscribers = []
		this.hocuspocus.destroy()
		this.webrtc?.destroy()
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

	private updateStatus() {
			const statuses: TransportStatus[] = [this.hocuspocus.getStatus()]
			if (this.webrtc) {
				statuses.push(this.webrtc.getStatus())
			}

			let next: TransportStatus = this.status

			if (statuses.some((status) => status === 'error')) {
			next = 'error'
		} else if (statuses.some((status) => status === 'connected')) {
			next = 'connected'
			} else if (statuses.some((status) => status === 'connecting' || status === 'idle')) {
			next = 'connecting'
		} else if (statuses.every((status) => status === 'disconnected')) {
			next = 'disconnected'
		} else {
			next = 'idle'
		}

		if (next !== this.status) {
			this.status = next
			this.statusEmitter.emit(this.status)
		}
	}
}
