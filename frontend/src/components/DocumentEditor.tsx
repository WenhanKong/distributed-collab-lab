import type { ReactNode } from 'react'
import type { Awareness } from 'y-protocols/awareness'
import type * as Y from 'yjs'
import { EditorContent, useEditor } from '@tiptap/react'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { useEffect, useMemo } from 'react'

import type { ProviderStatus } from '../collab/CollabProvider'

interface DocumentEditorProps {
    doc: Y.Doc
    awareness: Awareness
    status: ProviderStatus
    synced: boolean
    user: {
        id: string
        name: string
        color: string
    }
    canEdit?: boolean
}

export function DocumentEditor({ doc, awareness, status, synced, user, canEdit = true }: DocumentEditorProps) {
    const { label, indicator } = useMemo(() => {
        if (status === 'connected' && synced) {
            return { label: 'synced', indicator: '#10b981' }
        }
            if (status === 'connected') {
                return { label: 'connected', indicator: '#10b981' }
        }
        if (status === 'connecting' || status === 'idle') {
            return { label: 'connecting', indicator: '#f59e0b' }
        }
        if (status === 'error') {
            return { label: 'error', indicator: '#ef4444' }
        }
        return { label: 'offline', indicator: '#ef4444' }
    }, [status, synced])

    const editor = useEditor({
        editable: canEdit,
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
                document: doc,
            }),
            CollaborationCaret.configure({
                provider: { awareness },
                user: { name: user.name, color: user.color },
            }),
        ],
    })

    useEffect(() => {
        if (!editor) {
            return
        }
        editor.setEditable(canEdit)
    }, [editor, canEdit])

    if (!editor) {
        return (
            <div className="editor editor--loading">Loading editor…</div>
        )
    }

    const characters = editor.storage.characterCount?.characters() ?? 0
    const words = editor.storage.characterCount?.words() ?? 0

    return (
        <div className="editor">
            <div className="editor__status">
                <span className="editor__indicator" style={{ backgroundColor: indicator }} />
                <span>{label}</span>
            </div>

            <div className="editor__toolbar">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike">
                    <s>S</s>
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code">
                    {'<>'}
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Highlight"
                >
                    ⚡
                </ToolbarButton>

                <div className="editor__divider" />

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

                <div className="editor__divider" />

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

                <div className="editor__divider" />

                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                    —
                </ToolbarButton>
            </div>

            <div className={`editor__body ${canEdit ? '' : 'editor__body--disabled'}`}>
                {!canEdit ? <div className="editor__lockNotice">Request the edit lock to make changes.</div> : null}
                <EditorContent editor={editor} />
            </div>

            <div className="editor__footer">
                <span className="editor__chip" style={{ backgroundColor: user.color }}>
                    {user.name}
                </span>
                <span className="editor__counts">
                    {characters} characters · {words} words
                </span>
            </div>
        </div>
    )
}

interface ToolbarButtonProps {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: ReactNode
    title: string
}

function ToolbarButton({ onClick, isActive = false, disabled = false, children, title }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`editor__button ${isActive ? 'editor__button--active' : ''}`}
        >
            {children}
        </button>
    )
}
