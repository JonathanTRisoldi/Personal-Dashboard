import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

export default function Notes({ session }) {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }

  const addNote = async () => {
    if (!newNote.trim()) return
    const { data, error } = await supabase
      .from('notes')
      .insert({ content: newNote, user_id: session.user.id })
      .select()
    if (error) { console.log(error); return }
    if (data && data[0]) setNotes([data[0], ...notes])
    setNewNote('')
  }

  const deleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(notes.filter(n => n.id !== id))
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div>

      <div style={{ marginBottom: '16px' }}>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Jot something down..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'var(--card-inner)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontSize: '14px',
            resize: 'vertical',
            marginBottom: '8px'
          }}
        />
        <button
          onClick={addNote}
          style={{
            width: '100%',
            padding: '8px',
            background: 'var(--accent)',
            color: 'var(--text)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Save Note
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : notes.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No notes yet!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {notes.map(note => (
            <div key={note.id} style={{
              padding: '12px',
              background: 'var(--card-inner)',
              borderRadius: '8px',
              position: 'relative'
            }}>
              <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '6px', whiteSpace: 'pre-wrap' }}>
                {note.content}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{formatDate(note.created_at)}</span>
                <button
                  onClick={() => deleteNote(note.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff4d4d',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}