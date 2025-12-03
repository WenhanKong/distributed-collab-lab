import test from 'node:test'
import assert from 'node:assert/strict'

import { computeMutexState } from '../src/collab/algorithms/mutex'

test('computeMutexState picks the oldest timestamp as owner', () => {
	const state = computeMutexState([
		{ clientId: 'b', name: 'B', timestamp: 200 },
		{ clientId: 'a', name: 'A', timestamp: 100 },
	])

	assert.equal(state.ownerId, 'a')
	assert.equal(state.queue[0]?.clientId, 'a')
})

test('computeMutexState orders by timestamp then clientId for ties', () => {
	const state = computeMutexState([
		{ clientId: 'b', name: 'B', timestamp: 100 },
		{ clientId: 'a', name: 'A', timestamp: 100 },
	])

	assert.deepEqual(
		state.queue.map((entry) => entry.clientId),
		['a', 'b'],
	)
})

test('computeMutexState handles empty queues', () => {
	const state = computeMutexState([])
	assert.equal(state.ownerId, null)
	assert.equal(state.queue.length, 0)
})
