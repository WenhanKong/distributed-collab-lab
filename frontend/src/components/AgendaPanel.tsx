import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import * as Y from 'yjs'

export interface AgendaItem {
  id: string
  text: string
  completed: boolean
  createdAt: number
  createdBy: {
    id: string
    name: string
    color: string
  }
}

interface AgendaPanelProps {
  agenda: Y.Array<AgendaItem>
  user: {
    id: string
    name: string
    color: string
  }
}

export function AgendaPanel({ agenda, user }: AgendaPanelProps) {
  const [draft, setDraft] = useState('')
  const [items, setItems] = useState<AgendaItem[]>(() => agenda.toArray())

  useEffect(() => {
    const update = () => {
      setItems(agenda.toArray())
    }
    agenda.observe(update)
    return () => {
      agenda.unobserve(update)
    }
  }, [agenda])

  const sortedItems = useMemo(() => {
    return items
      .slice()
      .sort((a, b) => Number(a.completed) - Number(b.completed) || a.createdAt - b.createdAt)
  }, [items])

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) {
      return
    }
    const item: AgendaItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      text,
      completed: false,
      createdAt: Date.now(),
      createdBy: user,
    }
    agenda.push([item])
    setDraft('')
  }

  const toggleItem = (id: string, completed: boolean) => {
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) {
      return
    }
    const clone: AgendaItem = {
      ...items[index],
      completed: !completed,
    }
    agenda.delete(index, 1)
    agenda.insert(index, [clone])
  }

  const removeItem = (id: string) => {
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) {
      return
    }
    agenda.delete(index, 1)
  }

  return (
    <div className="agendaPanel">
      <form className="agendaPanel__composer" onSubmit={handleAdd}>
        <input
          className="agendaPanel__input"
          placeholder="Add agenda item"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="agendaPanel__add" type="submit">
          Add
        </button>
      </form>
      <div className="agendaPanel__list">
        {sortedItems.length === 0 ? (
          <p className="agendaPanel__empty">No agenda items yet. Add one to track next steps.</p>
        ) : (
          sortedItems.map((item) => (
            <label key={item.id} className="agendaPanel__item">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id, item.completed)}
              />
              <span className={`agendaPanel__text ${item.completed ? 'agendaPanel__text--completed' : ''}`}>
                {item.text}
              </span>
              <button
                type="button"
                className="agendaPanel__remove"
                onClick={() => removeItem(item.id)}
                aria-label="Remove agenda item"
              >
                ×
              </button>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
