import test from 'node:test'
import assert from 'node:assert/strict'

import { electLeader } from '../src/collab/algorithms/leaderElection'

test('electLeader chooses the highest clientId inside the timeout window', () => {
	const now = Date.now()
	const leader = electLeader(
		[
			{ clientId: 1, userId: 'a', name: 'A', heartbeat: now },
			{ clientId: 3, userId: 'c', name: 'C', heartbeat: now },
			{ clientId: 2, userId: 'b', name: 'B', heartbeat: now },
		],
		{ now },
	)

	assert.ok(leader)
	assert.equal(leader?.clientId, 3)
	assert.equal(leader?.userId, 'c')
})

test('electLeader ignores stale candidates and falls back to null', () => {
	const now = Date.now()
	const leader = electLeader(
		[{ clientId: 5, userId: 'late', name: 'Late', heartbeat: now - 20000 }],
		{ now, heartbeatTimeoutMs: 5000 },
	)

	assert.equal(leader, null)
})

test('ties on clientId break by comparing userId for deterministic outcome', () => {
	const now = Date.now()
	const leader = electLeader(
		[
			{ clientId: 10, userId: 'alpha', name: 'Alpha', heartbeat: now },
			{ clientId: 10, userId: 'omega', name: 'Omega', heartbeat: now },
		],
		{ now },
	)

	assert.ok(leader)
	assert.equal(leader?.userId, 'omega')
})
