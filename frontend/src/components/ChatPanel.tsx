import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import * as Y from 'yjs'

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  color: string
  text: string
  createdAt: number
}

interface ChatPanelProps {
  chat: Y.Array<ChatMessage>
  user: {
    id: string
    name: string
    color: string
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
}

export function ChatPanel({ chat, user }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => chat.toArray())
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const update = () => {
      setMessages(chat.toArray())
    }
    chat.observe(update)
    return () => {
      chat.unobserve(update)
    }
  }, [chat])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) {
      return
    }
    const message: ChatMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      userId: user.id,
      userName: user.name,
      color: user.color,
      text,
      createdAt: Date.now(),
    }
    chat.push([message])
    setDraft('')
  }

  const groupedMessages = useMemo(() => {
    return messages
      .slice()
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((message) => ({
        ...message,
        isLocal: message.userId === user.id,
      }))
  }, [messages, user.id])

  return (
    <div className="chatPanel">
      <div className="chatPanel__messages">
        {groupedMessages.length === 0 ? (
          <p className="chatPanel__empty">Say hi in the chat to get things started.</p>
        ) : (
          groupedMessages.map((message) => (
            <div key={message.id} className={`chatPanel__message ${message.isLocal ? 'chatPanel__message--local' : ''}`}>
              <div className="chatPanel__avatar" style={{ backgroundColor: message.color }}>
                {message.userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="chatPanel__bubble">
                <div className="chatPanel__meta">
                  <span className="chatPanel__author">
                    {message.isLocal ? `${message.userName} (You)` : message.userName}
                  </span>
                  <span className="chatPanel__timestamp">{formatTime(message.createdAt)}</span>
                </div>
                <p className="chatPanel__text">{message.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <form className="chatPanel__composer" onSubmit={handleSubmit}>
        <input
          className="chatPanel__input"
          placeholder="Send a message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="chatPanel__send" type="submit">
          Send
        </button>
      </form>
    </div>
  )
}
