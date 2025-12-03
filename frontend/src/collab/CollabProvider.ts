import { Awareness } from 'y-protocols/awareness'
import * as Y from 'yjs'

import { SimpleEmitter } from './utils/emitter'
import type {
	CollabTransport,
	CollabTransportFactory,
	CollabTransportConfig,
	TransportKind,
	TransportStatus,
} from './types'
import { HybridTransport, type HybridTransportOptions } from './transports/HybridTransport'

export type ProviderStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export interface TransportState {
	kind: TransportKind
	status: TransportStatus
}

export interface CollabProviderSnapshot {
	status: ProviderStatus
	synced: boolean
	transports: TransportState[]
	lastSyncedAt?: number
}

export interface CollabUser {
	id: string
	name: string
	color: string
	avatarUrl?: string
}

export interface CollabProviderOptions {
	room: string
	user: CollabUser
	doc?: Y.Doc
	awareness?: Awareness
	serverUrl?: string
	signalingUrls?: string[]
	enableWebRTC?: boolean
	transportFactories?: CollabTransportFactory[]
	token?: string
	ownsDoc?: boolean
	ownsAwareness?: boolean
}

export class CollabProvider {
	readonly room: string
	readonly doc: Y.Doc
	readonly awareness: Awareness

	private transports: CollabTransport[]
	private snapshot: CollabProviderSnapshot
	private emitter = new SimpleEmitter<CollabProviderSnapshot>()
	private unsubscribers: Array<() => void> = []
	private ownsDoc: boolean
	private ownsAwareness: boolean
	private destroyed = false

	constructor(options: CollabProviderOptions) {
		this.room = options.room
		this.doc = options.doc ?? new Y.Doc()
		this.awareness = options.awareness ?? new Awareness(this.doc)
		this.ownsDoc = options.ownsDoc ?? !options.doc
		this.ownsAwareness = options.ownsAwareness ?? !options.awareness

		const transportConfig: CollabTransportConfig = {
			room: options.room,
			doc: this.doc,
			awareness: this.awareness,
		}

		const transportFactories = options.transportFactories ?? [
			HybridTransport.createFactory({
				serverUrl: options.serverUrl ?? 'ws://localhost:3000',
				enableWebRTC: options.enableWebRTC,
				signaling: options.signalingUrls,
				token: options.token,
			} satisfies HybridTransportOptions),
		]

		this.transports = transportFactories.map((factory) => factory(transportConfig))

		this.snapshot = {
			status: 'idle',
			synced: false,
			transports: this.transports.map((transport) => ({
				kind: transport.kind,
				status: transport.getStatus(),
			})),
		}

		for (const transport of this.transports) {
			this.unsubscribers.push(
				transport.subscribeStatus(() => {
					this.refreshSnapshot()
				}),
			)

			if (transport.subscribeSynced) {
				this.unsubscribers.push(
					transport.subscribeSynced(() => {
						this.setSynced()
					}),
				)
			}
		}

		this.setUser(options.user)
		this.refreshSnapshot()
	}

	connect() {
			this.updateSnapshot({
				...this.snapshot,
				synced: false,
			})
		for (const transport of this.transports) {
			transport.connect()
		}
		this.refreshSnapshot()
	}

	disconnect() {
		for (const transport of this.transports) {
			transport.disconnect()
		}
			this.updateSnapshot({
				...this.snapshot,
				synced: false,
			})
		this.refreshSnapshot()
	}

	destroy() {
		if (this.destroyed) {
			return
		}
		this.destroyed = true

		this.disconnect()

		for (const unsubscribe of this.unsubscribers) {
			unsubscribe()
		}
		this.unsubscribers = []

		for (const transport of this.transports) {
			transport.destroy()
		}
		this.transports = []

		if (this.ownsAwareness) {
			this.awareness.destroy()
		}
		if (this.ownsDoc) {
			this.doc.destroy()
		}

		this.emitter.clear()
	}

	getSnapshot(): CollabProviderSnapshot {
		return this.snapshot
	}

	subscribe(listener: () => void): () => void {
		return this.emitter.subscribe(() => listener())
	}

	getStatus(): ProviderStatus {
		return this.snapshot.status
	}

	getTransports(): CollabTransport[] {
		return this.transports
	}

	setUser(user: CollabUser) {
		const current = this.awareness.getLocalState() ?? {}
		this.awareness.setLocalState({
			...current,
			user,
			updatedAt: Date.now(),
		})
	}

	updatePresence(partial: Record<string, unknown>) {
		const current = this.awareness.getLocalState() ?? {}
		this.awareness.setLocalState({
			...current,
			...partial,
			updatedAt: Date.now(),
		})
	}

	private setSynced() {
		const nextSnapshot: CollabProviderSnapshot = {
			...this.snapshot,
			synced: true,
			lastSyncedAt: Date.now(),
		}
		this.updateSnapshot(nextSnapshot)
	}

	private refreshSnapshot() {
		const transportStates: TransportState[] = this.transports.flatMap((transport) => {
			const hybridStatuses =
				(transport as unknown as { getChildStatuses?: () => TransportState[] }).getChildStatuses?.() ?? []
			if (hybridStatuses.length > 0) {
				return hybridStatuses
			}
			return [
				{
					kind: transport.kind,
					status: transport.getStatus(),
				},
			]
		})

		const statuses = transportStates.map((state) => state.status)

		let providerStatus: ProviderStatus = this.snapshot.status

		if (statuses.some((status) => status === 'error')) {
			providerStatus = 'error'
		} else if (statuses.some((status) => status === 'connected')) {
			providerStatus = 'connected'
		} else if (statuses.some((status) => status === 'connecting' || status === 'idle')) {
			providerStatus = 'connecting'
		} else if (statuses.every((status) => status === 'disconnected')) {
			providerStatus = 'disconnected'
		} else {
			providerStatus = 'idle'
		}

			const keepSynced = providerStatus === 'connected' ? this.snapshot.synced : false

			const nextSnapshot: CollabProviderSnapshot = {
				...this.snapshot,
				status: providerStatus,
				transports: transportStates,
				synced: keepSynced,
			}

		this.updateSnapshot(nextSnapshot)
	}

	private updateSnapshot(snapshot: CollabProviderSnapshot) {
		if (this.destroyed) {
			return
		}

			const transportsChanged =
				snapshot.transports.length !== this.snapshot.transports.length ||
				snapshot.transports.some((state, index) => state.status !== this.snapshot.transports[index]?.status)

			const hasChanged =
				snapshot.status !== this.snapshot.status ||
				snapshot.synced !== this.snapshot.synced ||
				transportsChanged

		if (!hasChanged) {
			return
		}

		this.snapshot = snapshot
		this.emitter.emit(this.snapshot)
	}
}
