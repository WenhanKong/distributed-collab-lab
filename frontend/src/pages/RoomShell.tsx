import { useMemo } from 'react'

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
        enableWebRTC: false,
    })

    const { doc, awareness, status, synced, transports } = collab

    const cache = useIndexedDbCache(room, doc, { enabled: true })

    const chat = useMemo(() => doc.getArray<ChatMessage>('chat'), [doc])
    const agenda = useMemo(() => doc.getArray<AgendaItem>('agenda'), [doc])

    const localPresence = useMemo(() => ({ status, user }), [status, user])
    const presence = useAwareness(awareness, localPresence)

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
                    <DocumentEditor doc={doc} awareness={awareness} status={status} synced={synced} user={user} />
                </div>
                <aside className="roomShell__sidebar">
                    <section className="roomShell__panel">
                        <h2 className="roomShell__panelTitle">Collaborators</h2>
                        <PresenceList presences={presence} localClientId={awareness.clientID} />
                    </section>
                    <section className="roomShell__panel">
                        <h2 className="roomShell__panelTitle">Chat</h2>
                        <ChatPanel chat={chat} user={user} />
                    </section>
                    <section className="roomShell__panel">
                        <h2 className="roomShell__panelTitle">Agenda</h2>
                        <AgendaPanel agenda={agenda} user={user} />
                    </section>
                </aside>
            </div>
        </div>
    )
}
