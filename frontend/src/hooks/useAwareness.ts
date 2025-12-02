import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import type { Awareness } from 'y-protocols/awareness'

export interface AwarenessState<T> {
	clientId: number
	state: T
}

export function useAwareness<T extends Record<string, unknown>>(
	awareness: Awareness,
	localState?: Partial<T>,
) {
	const subscribe = useCallback(
		(listener: () => void) => {
			const handler = () => listener()
			awareness.on('update', handler)
			return () => {
				awareness.off('update', handler)
			}
		},
		[awareness],
	)

	const getSnapshot = useCallback(() => awareness.getStates(), [awareness])

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

			const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

			return useMemo(
				() =>
					Array.from(store.entries())
						.map(([clientId, state]) => ({
							clientId,
							state: state as T,
						}))
						.sort((a, b) => a.clientId - b.clientId),
				[store],
			)
	}
