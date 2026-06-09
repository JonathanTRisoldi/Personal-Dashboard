import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

export default function Bookmarks({ session }) {
  const [bookmarks, setBookmarks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
    setBookmarks(data || [])
    setLoading(false)
  }

  const addBookmark = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return
    let url = newUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ title: newTitle, url, user_id: session.user.id })
      .select()
    if (error) { console.log(error); return }
    if (data && data[0]) setBookmarks([...bookmarks, data[0]])
    setNewTitle('')
    setNewUrl('')
    setAdding(false)
  }

  const deleteBookmark = async (id) => {
    await supabase.from('bookmarks').delete().eq('id', id)
    setBookmarks(bookmarks.filter(b => b.id !== id))
  }

  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

  return (
    <div>
      {/* Bookmarks Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
      ) : bookmarks.length === 0 && !adding ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No bookmarks yet. Add one below!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {bookmarks.map(bookmark => (
            <div key={bookmark.id} style={{ position: 'relative', textAlign: 'center' }}>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div style={{
                  background: 'var(--card-inner)',
                  borderRadius: '12px',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--card-inner)'}
                >
                  <img
                    src={getFavicon(bookmark.url)}
                    alt=""
                    style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <span style={{
                    color: 'var(--text)',
                    fontSize: '11px',
                    wordBreak: 'break-word',
                    lineHeight: '1.3',
                    maxWidth: '100%'
                  }}>
                    {bookmark.title}
                  </span>
                </div>
              </a>
              <button
                onClick={() => deleteBookmark(bookmark.id)}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#ff4d4d',
                  border: 'none',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title (e.g. YouTube)"
            style={{
              padding: '8px 12px',
              background: 'var(--card-inner)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '14px'
            }}
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addBookmark()}
            placeholder="URL (e.g. youtube.com)"
            style={{
              padding: '8px 12px',
              background: 'var(--card-inner)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '14px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={addBookmark}
              style={{ flex: 1, padding: '8px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              Save
            </button>
            <button
              onClick={() => { setAdding(false); setNewTitle(''); setNewUrl('') }}
              style={{ flex: 1, padding: '8px', background: 'var(--card-inner)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{ width: '100%', padding: '8px', background: 'var(--card-inner)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
        >
          + Add Bookmark
        </button>
      )}
    </div>
  )
}