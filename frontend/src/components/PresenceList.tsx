import type { AwarenessState } from '../hooks/useAwareness'

interface PresencePayload {
  user?: {
    id: string
    name: string
    color: string
  }
  status?: string
  updatedAt?: number
}

interface PresenceListProps {
  presences: AwarenessState<PresencePayload>[]
  localClientId: number
}

export function PresenceList({ presences, localClientId }: PresenceListProps) {
  if (!presences.length) {
    return (
      <div className="presenceList">
        <p className="presenceList__empty">No collaborators online</p>
      </div>
    )
  }

  return (
    <div className="presenceList">
      {presences.map(({ clientId, state }) => {
        const user = state.user
        const isLocal = clientId === localClientId
        return (
          <div key={clientId} className="presenceList__item">
            <span
              className="presenceList__avatar"
              style={{ backgroundColor: user?.color ?? '#6b7280' }}
              aria-hidden="true"
            >
              {(user?.name ?? 'Anon').slice(0, 2).toUpperCase()}
            </span>
            <div className="presenceList__details">
              <span className="presenceList__name">
                {user?.name ?? 'Anonymous'}
                {isLocal ? ' (You)' : ''}
              </span>
              <span className="presenceList__status">
                {state.status ?? 'online'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
