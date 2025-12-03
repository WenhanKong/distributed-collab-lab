export interface MutexRequest {
	clientId: string
	name: string
	timestamp: number
}

export interface MutexComputation {
	ownerId: string | null
	queue: MutexRequest[]
}

export function computeMutexState(requests: MutexRequest[]): MutexComputation {
	if (!requests.length) {
		return { ownerId: null, queue: [] }
	}
	const sorted = [...requests].sort((a, b) => {
		if (a.timestamp === b.timestamp) {
			return a.clientId.localeCompare(b.clientId)
		}
		return a.timestamp - b.timestamp
	})
	return {
		ownerId: sorted[0]?.clientId ?? null,
		queue: sorted,
	}
}
