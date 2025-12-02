import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Awareness } from 'y-protocols/awareness'
import * as Y from 'yjs'

import {
	CollabProvider,
	type CollabProviderOptions,
	type CollabProviderSnapshot,
} from './CollabProvider'

const EMPTY_SNAPSHOT: CollabProviderSnapshot = {
	status: 'idle',
	synced: false,
	transports: [],
}

export interface UseCollabProviderOptions extends CollabProviderOptions {
	autoConnect?: boolean
}

export function useCollabProvider(options: UseCollabProviderOptions) {
	const {
		room,
		user,
		serverUrl,
		signalingUrls,
		enableWebRTC,
		transportFactories,
		token,
		doc,
		awareness,
		autoConnect = true,
	} = options

	const signalingKey = signalingUrls?.join('|') ?? ''

	const resolvedDoc = useMemo(() => doc ?? new Y.Doc(), [doc, room])
	const resolvedAwareness = useMemo(
		() => awareness ?? new Awareness(resolvedDoc),
		[awareness, resolvedDoc],
	)

	const [provider, setProvider] = useState<CollabProvider | null>(null)

	useEffect(() => {
		const nextProvider = new CollabProvider({
			room,
			user,
			serverUrl,
			signalingUrls,
			enableWebRTC,
			transportFactories,
			token,
			doc: resolvedDoc,
			awareness: resolvedAwareness,
			ownsDoc: !doc,
			ownsAwareness: !awareness,
		})
		setProvider(nextProvider)

		return () => {
			setProvider((current) => (current === nextProvider ? null : current))
			nextProvider.destroy()
		}
	}, [
		room,
		user.id,
		serverUrl,
		signalingKey,
		enableWebRTC,
		transportFactories,
		token,
		resolvedDoc,
		resolvedAwareness,
		doc,
		awareness,
	])

	useEffect(() => {
		if (!provider || !autoConnect) {
			return undefined
		}
		provider.connect()
		return () => {
			provider.disconnect()
		}
	}, [provider, autoConnect])

	useEffect(() => {
		if (!provider) {
			return
		}
		provider.setUser(user)
	}, [provider, user])

	const subscribe = useCallback(
		(listener: () => void) => {
			if (!provider) {
				return () => {}
			}
			return provider.subscribe(listener)
		},
		[provider],
	)

	const getSnapshot = useCallback(() => provider?.getSnapshot() ?? EMPTY_SNAPSHOT, [provider])

	const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

	return {
		provider,
		doc: provider?.doc ?? resolvedDoc,
		awareness: provider?.awareness ?? resolvedAwareness,
		status: snapshot.status,
		synced: snapshot.synced,
		transports: snapshot.transports,
		lastSyncedAt: snapshot.lastSyncedAt,
	}
}
