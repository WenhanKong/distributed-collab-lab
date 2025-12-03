import { useEffect, useMemo } from 'react'

import type { CollabUser } from '../collab/CollabProvider'
import { useCollabProvider } from '../collab/useCollabProvider'
import { useAwareness } from '../hooks/useAwareness'
import { DocumentEditor } from '../components/DocumentEditor'
import { PresenceList } from '../components/PresenceList'
import type { ChatMessage } from '../components/ChatPanel'
import { ChatPanel } from '../components/ChatPanel'
import type { AgendaItem } from '../components/AgendaPanel'
import { AgendaPanel } from '../components/AgendaPanel'
import { useIndexedDbCache } from '../collab/persistence/useIndexedDbCache'
import { useLeaderElectionState } from '../collab/hooks/useLeaderElection'
import { useDocumentMutex } from '../collab/hooks/useDocumentMutex'

interface RoomShellProps {
    room: string
    user: CollabUser
    serverUrl?: string
    signalingUrls?: string[]
    onLeave: () => void
}

const statusCopy: Record<string, string> = {
    idle: 'Idle',
    connecting: 'Connecting…',
    connected: 'Connected',
    disconnected: 'Offline',
    error: 'Error',
}

export function RoomShell({ room, user, serverUrl, signalingUrls, onLeave }: RoomShellProps) {
    const collab = useCollabProvider({
        room,
        user,
        serverUrl,
        signalingUrls,
        enableWebRTC: true,
    })

    const { doc, awareness, status, synced, transports, provider } = collab

    const cache = useIndexedDbCache(room, doc, { enabled: true })

    const chat = useMemo(() => doc.getArray<ChatMessage>('chat'), [doc])
    const agenda = useMemo(() => doc.getArray<AgendaItem>('agenda'), [doc])

    const localPresence = useMemo(() => ({ status, user }), [status, user])
    const presence = useAwareness(awareness, localPresence)
    const leadership = useLeaderElectionState(presence, awareness.clientID)
    const documentMutex = useDocumentMutex(doc, 'document', user, { allowReset: leadership.isLeader })

    useEffect(() => {
        if (!provider) {
            return undefined
        }
        provider.updatePresence({ heartbeat: Date.now() })
        const interval = setInterval(() => {
            provider.updatePresence({ heartbeat: Date.now() })
        }, 3000)
        return () => {
            clearInterval(interval)
        }
    }, [provider])

    return (
        <div className="roomShell">
            <header className="roomShell__header">
                <div className="roomShell__titles">
                    <h1 className="roomShell__title">Room: {room}</h1>
                    <p className="roomShell__subtitle">{statusCopy[status]}</p>
                </div>
                <div className="roomShell__meta">
                    <div className="roomShell__transports">
                        {transports.map((transport) => (
                            <span key={transport.kind} className={`transport transport--${transport.status}`}>
                                {transport.kind}
                            </span>
                        ))}
                    </div>
                    <button type="button" className="roomShell__leave" onClick={onLeave}>
                        Leave room
                    </button>
                </div>
            </header>

            {!cache.isReady ? (
                <div className="roomShell__loading">Preparing offline cache…</div>
            ) : null}

            <div className="roomShell__content">
                <div className="roomShell__editor">
                    <DocumentEditor
                        doc={doc}
                        awareness={awareness}
                        status={status}
                        synced={synced}
                        user={user}
                        canEdit={documentMutex.canEdit}
                    />
                </div>
                <aside className="roomShell__sidebar">
                    <section className="roomShell__panel">
                        <h2 className="roomShell__panelTitle">Collaborators</h2>
                        <PresenceList
                            presences={presence}
                            localClientId={awareness.clientID}
                            leaderUserId={leadership.leader?.userId}
                        />
                    </section>
                    <section className="roomShell__panel">
                        <h2 className="roomShell__panelTitle">Chat</h2>
                        <ChatPanel chat={chat} user={user} />
                    </section>
                    <section className="roomShell__panel">
                        <h2 className="roomShell__panelTitle">Agenda</h2>
                        <AgendaPanel agenda={agenda} user={user} canToggle={leadership.isLeader} />
                    </section>
                    <section className="roomShell__panel">
                        <h2 className="roomShell__panelTitle">Document Lock</h2>
                        <p className="roomShell__text">
                            Owner: {documentMutex.ownerName ?? 'Unassigned'}
                        </p>
                        <div className="mutexControls">
                            <button
                                type="button"
                                onClick={documentMutex.requestLock}
                                disabled={documentMutex.hasLock || documentMutex.isQueued}
                            >
                                Request lock
                            </button>
                            <button
                                type="button"
                                onClick={documentMutex.releaseLock}
                                disabled={!documentMutex.hasLock}
                            >
                                Release lock
                            </button>
                            <button
                                type="button"
                                onClick={documentMutex.resetLock}
                                disabled={!leadership.isLeader}
                                title={
                                    leadership.isLeader
                                        ? 'Leader can clear stale locks'
                                        : 'Only the leader may reset the lock'
                                }
                            >
                                Reset lock
                            </button>
                        </div>
                        <ol className="mutexQueue">
                            {documentMutex.queue.map((request) => (
                                <li key={`${request.clientId}-${request.timestamp}`}>
                                    {request.name} · {new Date(request.timestamp).toLocaleTimeString()}
                                </li>
                            ))}
                        </ol>
                    </section>
                </aside>
            </div>
        </div>
    )
}
