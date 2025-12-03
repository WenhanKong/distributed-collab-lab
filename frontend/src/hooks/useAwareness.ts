import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import type { Awareness } from 'y-protocols/awareness'

export interface AwarenessState<T> {
	clientId: number
	state: T
}

export function useAwareness<T extends Record<string, unknown>>(
	awareness: Awareness,
	localState?: Partial<T>,
) {
	const snapshotRef = useRef<AwarenessState<T>[]>([])

	const computeSnapshot = useCallback(() => {
		return Array.from(awareness.getStates().entries())
			.map(([clientId, state]) => ({
				clientId,
				state: state as T,
			}))
			.sort((a, b) => a.clientId - b.clientId)
	}, [awareness])

	const subscribe = useCallback(
		(listener: () => void) => {
			const handler = () => {
				snapshotRef.current = computeSnapshot()
				listener()
			}
			snapshotRef.current = computeSnapshot()
			awareness.on('update', handler)
			return () => {
				awareness.off('update', handler)
			}
		},
		[awareness, computeSnapshot],
	)

	const getSnapshot = useCallback(() => snapshotRef.current, [])

		useEffect(() => {
			if (!localState) {
				return undefined
			}

			const current = awareness.getLocalState() ?? {}
			awareness.setLocalState({
				...current,
				...localState,
				updatedAt: Date.now(),
			})
		}, [awareness, localState])

		useEffect(() => {
			return () => {
				awareness.setLocalState(null)
			}
		}, [awareness])

			const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

			return useMemo(() => snapshot, [snapshot])
	}
