import { useMemo } from 'react'

import type { AwarenessState } from '../../hooks/useAwareness'
import type { CollabUser } from '../CollabProvider'
import { electLeader, type LeaderResult } from '../algorithms/leaderElection'

interface PresencePayload {
	user?: CollabUser
	status?: string
	heartbeat?: number
	updatedAt?: number
}

export interface LeaderElectionState {
	leader: LeaderResult | null
	isLeader: boolean
	participants: number
}

export function useLeaderElectionState(
	presence: AwarenessState<PresencePayload>[],
	localClientId: number,
	timeoutMs = 8000,
): LeaderElectionState {
	return useMemo(() => {
		const candidates = presence
			.filter((entry) => entry.state?.user)
			.map((entry) => ({
				clientId: entry.clientId,
				userId: entry.state.user!.id,
				name: entry.state.user!.name,
				heartbeat: entry.state.heartbeat ?? entry.state.updatedAt ?? 0,
			}))

		const leader = electLeader(candidates, { heartbeatTimeoutMs: timeoutMs })
		const localUserId = presence.find((entry) => entry.clientId === localClientId)?.state.user?.id
		return {
			leader,
			isLeader: Boolean(leader && leader.userId === localUserId),
			participants: candidates.length,
		}
	}, [presence, localClientId, timeoutMs])
}
