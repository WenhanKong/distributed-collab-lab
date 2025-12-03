import { useCallback, useEffect, useMemo, useState } from 'react'
import type * as Y from 'yjs'

import type { CollabUser } from '../CollabProvider'
import type { MutexRequest } from '../algorithms/mutex'
import { computeMutexState } from '../algorithms/mutex'

export interface DocumentMutexState {
	hasLock: boolean
	canEdit: boolean
	isQueued: boolean
	queue: MutexRequest[]
	ownerName: string | null
	requestLock: () => void
	releaseLock: () => void
	resetLock: () => void
}

export function useDocumentMutex(doc: Y.Doc, resourceId: string, user: CollabUser): DocumentMutexState {
	const queue = useMemo(() => doc.getArray<MutexRequest>(`mutex:${resourceId}`), [doc, resourceId])
	const [requests, setRequests] = useState<MutexRequest[]>(() => queue.toArray())

	useEffect(() => {
		const observer = () => {
			setRequests(queue.toArray())
		}
		queue.observe(observer)
		return () => {
			queue.unobserve(observer)
		}
	}, [queue])

	const state = useMemo(() => computeMutexState(requests), [requests])

	const enqueue = useCallback(() => {
		const alreadyQueued = requests.some((request) => request.clientId === user.id)
		if (alreadyQueued) {
			return
		}
		queue.push([
			{
				clientId: user.id,
				name: user.name,
				timestamp: Date.now(),
			},
		])
	}, [queue, requests, user.id, user.name])

	const dequeue = useCallback(() => {
		const index = requests.findIndex((request) => request.clientId === user.id)
		if (index === -1) {
			return
		}
		queue.delete(index, 1)
	}, [queue, requests, user.id])

	const ownerName = useMemo(() => {
		if (!state.ownerId) {
			return null
		}
		const owner = requests.find((request) => request.clientId === state.ownerId)
		return owner?.name ?? null
	}, [state.ownerId, requests])

	const isQueued = requests.some((request) => request.clientId === user.id)
	const hasLock = state.ownerId === user.id
	const canEdit = hasLock || state.ownerId === null

	return {
		hasLock,
		canEdit,
		isQueued,
		queue: state.queue,
		ownerName,
		requestLock: enqueue,
		releaseLock: dequeue,
		resetLock: () => queue.delete(0, queue.length),
	}
}
