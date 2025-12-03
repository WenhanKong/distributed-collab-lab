export interface LeaderCandidate {
	clientId: number
	userId: string
	name: string
	heartbeat: number
}

export interface LeaderResult extends LeaderCandidate {
	reason: 'highestId' | 'fallback'
	electedAt: number
}

/**
 * Implements a bully-style election: the highest clientId that has produced a heartbeat
 * within the timeout window becomes the coordinator.
 */
export function electLeader(
	candidates: LeaderCandidate[],
	options?: { now?: number; heartbeatTimeoutMs?: number },
): LeaderResult | null {
	const now = options?.now ?? Date.now()
	const timeout = options?.heartbeatTimeoutMs ?? 8000
	const alive = candidates.filter((candidate) => now - candidate.heartbeat <= timeout)
	if (alive.length === 0) {
		return null
	}

	const leader = alive.reduce<LeaderCandidate>((best, candidate) => {
		if (candidate.clientId > best.clientId) {
			return candidate
		}
		if (candidate.clientId === best.clientId && candidate.userId > best.userId) {
			return candidate
		}
		return best
	}, alive[0])

	return {
		...leader,
		reason: 'highestId',
		electedAt: now,
	}
}
