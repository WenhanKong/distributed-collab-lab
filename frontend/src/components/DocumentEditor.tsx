import { EditorContent, useEditor } from "@tiptap/react"
import { useEffect, useState } from "react"
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

interface DocumentEditorProps {
    userName: string
    userColor: string
    ydoc: Y.Doc
    provider: HocuspocusProvider
}

export function DocumentEditor({ userName, userColor, ydoc, provider }: DocumentEditorProps) {
    const [synced, setSynced] = useState(false)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        const handleConnect = () => setConnected(true)
        const handleSynced = () => setSynced(true)
        const handleDisconnect = () => {
            setConnected(false)
            setSynced(false)
        }
        
        provider.on('connect', handleConnect)
        provider.on('synced', handleSynced)
        provider.on('disconnect', handleDisconnect)
        
        return () => {
            provider.off('connect', handleConnect)
            provider.off('synced', handleSynced)
            provider.off('disconnect', handleDisconnect)
        }
    }, [provider])

    // Derive status from state
    const status = !connected ? 'disconnected' : synced ? 'connected' : 'connecting'
    const statusColor = status === 'connected' ? '#10b981' : status === 'connecting' ? '#f59e0b' : '#ef4444'

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ undoRedo: false }),
            Highlight,
            TaskList,
            TaskItem,
            Typography,
            Placeholder.configure({ placeholder: 'Start typing...' }),
            CharacterCount.configure({
                limit: 10000,
            }),
            Collaboration.configure({
                document: ydoc,
            }),
            CollaborationCaret.configure({
                provider: provider,
                user: { name: userName, color: userColor },
            }),
        ],
    })

    if (!editor) {
        return (
            <div style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280'
            }}>
                Loading editor...
            </div>
        )
    }

    const characters = editor.storage.characterCount?.characters() || 0
    const words = editor.storage.characterCount?.words() || 0

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Status Bar */}
            <div style={{
                padding: '6px 16px',
                background: '#fafafa',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#6b7280'
            }}>
                <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: statusColor,
                    flexShrink: 0
                }} />
                <span>{status}</span>
            </div>

            {/* Toolbar */}
            <div style={{
                borderBottom: '1px solid #e5e7eb',
                padding: '8px 12px',
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                background: 'white'
            }}>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strike"
                >
                    <s>S</s>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="Code"
                >
                    {'<>'}
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Highlight"
                >
                    ⚡
                </ToolbarButton>

                <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    H1
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    H3
                </ToolbarButton>

                <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    •
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Ordered List"
                >
                    1.
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    {'</>'}
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    "
                </ToolbarButton>

                <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />

                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Horizontal Rule"
                >
                    —
                </ToolbarButton>
            </div>

            {/* Editor */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                <EditorContent editor={editor} />
            </div>

            {/* Footer */}
            <div style={{
                borderTop: '1px solid #e5e7eb',
                padding: '8px 16px',
                background: '#fafafa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px'
            }}>
                <span style={{
                    padding: '4px 10px',
                    background: userColor,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                }}>
                    {userName}
                </span>
                <span style={{ color: '#6b7280' }}>
                    {characters} characters · {words} words
                </span>
            </div>
        </div>
    )
}

function ToolbarButton({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
}: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: isActive ? '#dbeafe' : 'white',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.1s',
                minWidth: '28px',
                height: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#1e40af' : '#374151',
            }}
            onMouseOver={(e) => !disabled && (e.currentTarget.style.background = isActive ? '#bfdbfe' : '#f9fafb')}
            onMouseOut={(e) => !disabled && (e.currentTarget.style.background = isActive ? '#dbeafe' : 'white')}
        >
            {children}
        </button>
    )
}