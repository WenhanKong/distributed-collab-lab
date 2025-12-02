import { useEffect, useState } from 'react'
import { IndexeddbPersistence } from 'y-indexeddb'
import type * as Y from 'yjs'

export interface IndexedDbCacheOptions {
	enabled?: boolean
	onSynced?: (doc: Y.Doc) => void
}

const isBrowser = typeof window !== 'undefined'
const hasIndexedDb = isBrowser && typeof indexedDB !== 'undefined'

export function useIndexedDbCache(room: string, doc: Y.Doc, options?: IndexedDbCacheOptions) {
	const { enabled = true, onSynced } = options ?? {}
	const [isReady, setIsReady] = useState(() => !enabled || !hasIndexedDb)

	useEffect(() => {
		if (!enabled || !hasIndexedDb) {
			setIsReady(true)
			return undefined
		}

		let didCancel = false
		const persistence = new IndexeddbPersistence(room, doc)

		persistence.whenSynced.then(() => {
			if (didCancel) {
				return
			}
			setIsReady(true)
			onSynced?.(doc)
		})

		return () => {
			didCancel = true
			persistence.destroy()
		}
	}, [room, doc, enabled, onSynced])

	return {
		isReady,
		isSupported: hasIndexedDb,
	}
}
