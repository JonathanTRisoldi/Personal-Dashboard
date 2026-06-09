import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

export default function Journal({ session }) {
  const [entries, setEntries] = useState([])
  const [newEntry, setNewEntry] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('write')

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const saveEntry = async () => {
    if (!newEntry.trim()) return
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ content: newEntry, user_id: session.user.id })
      .select()
    if (error) { console.log(error); return }
    if (data && data[0]) setEntries([data[0], ...entries])
    setNewEntry('')
  }

  const deleteEntry = async (id) => {
    await supabase.from('journal_entries').delete().eq('id', id)
    setEntries(entries.filter(e => e.id !== id))
    if (selectedEntry?.id === id) setSelectedEntry(null)
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const formatShortDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setView('write')}
            style={{
              padding: '6px 14px',
              background: view === 'write' ? 'var(--accent)' : '#0f1117',
              color: 'var(--text)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Write
          </button>
          <button
            onClick={() => setView('entries')}
            style={{
              padding: '6px 14px',
              background: view === 'entries' ? 'var(--accent)' : '#0f1117',
              color: 'var(--text)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Past Entries
          </button>
        </div>
      </div>

      {view === 'write' ? (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="What's on your mind today..."
            rows={8}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--card-inner)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '14px',
              resize: 'vertical',
              lineHeight: '1.6',
              marginBottom: '12px'
            }}
          />
          <button
            onClick={saveEntry}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--accent)',
              color: 'var(--text)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Save Entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '200px', flexShrink: 0 }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            ) : entries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No entries yet!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                {entries.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    style={{
                      padding: '10px',
                      background: selectedEntry?.id === entry.id ? '#2a2d3e' : '#0f1117',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: selectedEntry?.id === entry.id ? '1px solid var(--accent)' : '1px solid transparent'
                    }}
                  >
                    <p style={{ color: 'var(--text)', fontSize: '12px', fontWeight: '500' }}>{formatShortDate(entry.created_at)}</p>
                    <p style={{ color: '#666', fontSize: '11px', marginTop: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {entry.content.substring(0, 30)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedEntry && (
            <div style={{ flex: 1, background: 'var(--card-inner)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{formatDate(selectedEntry.created_at)}</p>
                <button
                  onClick={() => deleteEntry(selectedEntry.id)}
                  style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '13px' }}
                >
                  Delete
                </button>
              </div>
              <p style={{ color: 'var(--text)', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {selectedEntry.content}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}