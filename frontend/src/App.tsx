import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { DocumentEditor } from './components/DocumentEditor'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

const colors = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D']
const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace']

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

function App() {
  // Generate random users once - like official demo
  const user1 = useMemo(() => ({
    name: getRandomElement(names),
    color: getRandomElement(colors),
  }), [])

  const user2 = useMemo(() => ({
    name: getRandomElement(names),
    color: getRandomElement(colors),
  }), [])

  // Create shared Y.Doc and provider
  const ydoc1 = useMemo(() => new Y.Doc(), [])
  const ydoc2 = useMemo(() => new Y.Doc(), [])

  const provider1 = useMemo(() => {
    return new HocuspocusProvider({
      url: 'ws://localhost:3000',
      name: 'workspace',
      document: ydoc1,
    })
  }, [ydoc1])

  const provider2 = useMemo(() => {
    return new HocuspocusProvider({
      url: 'ws://localhost:3000',
      name: 'workspace',
      document: ydoc2,
    })
    }, [ydoc2])
  
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'system-ui',
      background: '#f3f4f6'
    }}>
      <header style={{ 
        padding: '16px 24px', 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
          Collaborative Editor Demo
        </h1>
      </header>

      <div style={{ 
        flex: 1, 
        display: 'flex', 
        gap: '1px', 
        background: '#e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
          <div style={{ 
            padding: '12px 16px', 
            background: '#f9fafb', 
            borderBottom: '1px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            Editor 1 - {user1.name}
          </div>
          <DocumentEditor 
            userName={user1.name} 
            userColor={user1.color}
            ydoc={ydoc1}
            provider={provider1}
          />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
          <div style={{ 
            padding: '12px 16px', 
            background: '#f9fafb', 
            borderBottom: '1px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            Editor 2 - {user2.name}
          </div>
          <DocumentEditor 
            userName={user2.name} 
            userColor={user2.color}
            ydoc={ydoc2}
            provider={provider2}
          />
        </div>
      </div>

      <footer style={{
        padding: '12px 24px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        fontSize: '13px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        💡 Open this in multiple browser windows to see real-time collaboration!
      </footer>
    </div>
  )
}

export default App
