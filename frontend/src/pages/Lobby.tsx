import type { FormEvent } from 'react'
import { useState } from 'react'

interface LobbyProps {
	defaultRoom?: string
	defaultName?: string
	onJoin: (room: string, name: string) => void
}

export function Lobby({ defaultRoom = 'workspace', defaultName = '', onJoin }: LobbyProps) {
	const [room, setRoom] = useState(defaultRoom)
	const [name, setName] = useState(defaultName)

		const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const trimmedRoom = room.trim()
		const trimmedName = name.trim()
		if (!trimmedRoom || !trimmedName) {
			return
		}
		onJoin(trimmedRoom, trimmedName)
	}

	return (
		<div className="lobby">
			<div className="lobby__card">
				<h1 className="lobby__title">Collab Playground</h1>
				<p className="lobby__subtitle">Create or join a collaborative room.</p>
				<form className="lobby__form" onSubmit={handleSubmit}>
					<label className="lobby__field">
						<span className="lobby__label">Display name</span>
						<input
							className="lobby__input"
							placeholder="Jane Doe"
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</label>
					<label className="lobby__field">
						<span className="lobby__label">Room name</span>
						<input
							className="lobby__input"
							placeholder="workspace"
							value={room}
							onChange={(event) => setRoom(event.target.value)}
						/>
					</label>
					<button className="lobby__submit" type="submit">
						Join room
					</button>
				</form>
				<p className="lobby__hint">Share the room name with others to collaborate in real time.</p>
			</div>
		</div>
	)
}
