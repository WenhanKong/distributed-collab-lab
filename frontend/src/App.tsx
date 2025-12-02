import { useMemo, useState } from 'react'

import './App.css'
import type { CollabUser } from './collab/CollabProvider'
import { Lobby } from './pages/Lobby'
import { RoomShell } from './pages/RoomShell'

const colors = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D']
const displayNames = ['Ada', 'Grace', 'Linus', 'Matz', 'Edsger', 'Radia', 'Marissa', 'Nadia']

const pickColor = () => colors[Math.floor(Math.random() * colors.length)]
const pickName = () => displayNames[Math.floor(Math.random() * displayNames.length)]

const createUser = (name: string): CollabUser => ({
  id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  name,
  color: pickColor(),
})

function App() {
  const [room, setRoom] = useState<string | null>(null)
  const [user, setUser] = useState<CollabUser | null>(null)
  const [lastRoom, setLastRoom] = useState('workspace')
  const [lastName, setLastName] = useState(() => pickName())

  const serverUrl = useMemo(() => 'ws://localhost:3000', [])
  const signalingUrls = useMemo(() => ['wss://signaling.yjs.dev'], [])

  const handleJoin = (roomName: string, displayName: string) => {
    setLastRoom(roomName)
    setLastName(displayName)
    setRoom(roomName)
    setUser(createUser(displayName))
  }

  const handleLeave = () => {
    setRoom(null)
    setUser(null)
  }

  if (!room || !user) {
    return <Lobby onJoin={handleJoin} defaultRoom={lastRoom} defaultName={lastName} />
  }

  return (
    <RoomShell
      room={room}
      user={user}
      serverUrl={serverUrl}
      signalingUrls={signalingUrls}
      onLeave={handleLeave}
    />
  )
}

export default App
