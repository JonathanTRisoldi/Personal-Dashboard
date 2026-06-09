import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const WIDGETS = [
  { id: 'datetime', label: 'Date, Time & Weather', description: 'Clock, date, and local weather' },
  { id: 'tasks-notes', label: 'Tasks & Notes', description: 'Quick tasks and notes side by side' },
  { id: 'projects', label: 'Projects', description: 'Project tracker with steps and progress' },
  { id: 'journal', label: 'Daily Journal', description: 'Personal journal with saved entries' },
  { id: 'habits', label: 'Habit Tracker', description: 'Daily habits with streaks and history' },
  { id: 'spotify', label: 'Spotify', description: 'Music player and controls' },
  { id: 'calendar', label: 'Google Calendar', description: 'Calendar view and upcoming events' },
  { id: 'news', label: 'News Feed', description: 'RSS feed reader' },
  { id: 'bookmarks', label: 'Bookmarks', description: 'Quick links to your favorite sites' },
]

const ACCENT_COLORS = [
  { label: 'Purple', value: '#6c63ff' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#10b981' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Yellow', value: '#eab308' },
]

export default function Settings({ session, onClose, onSignOut, accentColor, onAccentColorChange, theme, onThemeChange }) {
  const [activeTab, setActiveTab] = useState('account')
  const [displayName, setDisplayName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [widgetPrefs, setWidgetPrefs] = useState({})
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    fetchProfile()
    fetchWidgetPrefs()
  }, [])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .single()
    if (data?.display_name) setDisplayName(data.display_name)
  }

  const fetchWidgetPrefs = async () => {
    const { data } = await supabase
      .from('widget_preferences')
      .select('*')
      .eq('user_id', session.user.id)
    const prefs = {}
    WIDGETS.forEach(w => { prefs[w.id] = true })
    if (data) data.forEach(p => { prefs[p.widget_id] = p.enabled })
    setWidgetPrefs(prefs)
    setLoadingPrefs(false)
  }

  const saveDisplayName = async () => {
    if (!displayName.trim()) return
    setSavingName(true)
    await supabase.from('profiles').update({ display_name: displayName }).eq('id', session.user.id)
    setSavingName(false)
    setSuccessMessage('Display name updated!')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const toggleWidget = async (widgetId) => {
    const newValue = !widgetPrefs[widgetId]
    setWidgetPrefs(prev => ({ ...prev, [widgetId]: newValue }))
    await supabase.from('widget_preferences').upsert({
      user_id: session.user.id,
      widget_id: widgetId,
      enabled: newValue
    }, { onConflict: 'user_id,widget_id' })
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm.')
      return
    }
    setDeleteLoading(true)
    setError(null)
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error
      await supabase.auth.signOut()
    } catch (e) {
      setError(e.message)
      setDeleteLoading(false)
    }
  }

  const tabStyle = (tab) => ({
    padding: '8px 16px',
    background: activeTab === tab ? '#6c63ff' : 'none',
    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  })

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--card-inner)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '14px'
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0 24px' }}>
          <h2 style={{ color: 'var(--text)', fontSize: '20px', margin: 0 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '24px' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', borderBottom: '1px solid #2a2d3e' }}>
          <button style={tabStyle('account')} onClick={() => setActiveTab('account')}>Account</button>
          <button style={tabStyle('widgets')} onClick={() => setActiveTab('widgets')}>Widgets</button>
          <button style={tabStyle('appearance')} onClick={() => setActiveTab('appearance')}>Appearance</button>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div>
              {successMessage && (
                <div style={{ background: '#4dff9122', border: '1px solid #4dff91', color: '#4dff91', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                  {successMessage}
                </div>
              )}

              <div style={{ background: 'var(--card-inner)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginBottom: '4px' }}>Email</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{session.user.email}</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Display Name</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={saveDisplayName}
                    disabled={savingName}
                    style={{ padding: '10px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              <button
                onClick={onSignOut}
                style={{ width: '100%', padding: '12px', background: '#2a2d3e', color: 'var(--text-muted)', border: '1px solid #3a3f5c', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' }}
              >
                Sign Out
              </button>

              {/* Danger Zone */}
              <div style={{ border: '1px solid #ff4d4d44', borderRadius: '8px', padding: '16px' }}>
                <h3 style={{ color: '#ff4d4d', fontSize: '15px', marginBottom: '8px' }}>Danger Zone</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                  Permanently delete your account and all your data. This cannot be undone.
                </p>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    style={{ width: '100%', padding: '10px', background: '#ff4d4d22', color: '#ff4d4d', border: '1px solid #ff4d4d44', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div>
                    <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '8px' }}>Type <strong>DELETE</strong> to confirm:</p>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type DELETE here..."
                      style={{ ...inputStyle, border: '1px solid #ff4d4d', marginBottom: '8px' }}
                    />
                    {error && <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleDeleteAccount} disabled={deleteLoading} style={{ flex: 1, padding: '10px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                      <button onClick={() => { setConfirmDelete(false); setConfirmText(''); setError(null) }} style={{ flex: 1, padding: '10px', background: '#2a2d3e', color: 'var(--text-muted)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Widgets Tab */}
          {activeTab === 'widgets' && (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                Toggle widgets on or off. Disabled widgets will be hidden from your dashboard.
              </p>
              {loadingPrefs ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {WIDGETS.map(widget => (
                    <div key={widget.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--card-inner)',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '2px' }}>{widget.label}</p>
                        <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{widget.description}</p>
                      </div>
                      <div
                        onClick={() => toggleWidget(widget.id)}
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          background: widgetPrefs[widget.id] ? accentColor : '#2a2d3e',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          left: widgetPrefs[widget.id] ? '22px' : '2px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#fff',
                          transition: 'left 0.2s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>Theme</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
  onClick={() => onThemeChange('dark')}
  style={{
    flex: 1,
    padding: '12px',
    background: theme === 'dark' ? '#6c63ff' : '#1a1d2e',
    color: '#fff',
    border: theme === 'dark' ? '1px solid #6c63ff' : '1px solid #0f1117',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  }}
>
  🌙 Dark
</button>
<button
  onClick={() => onThemeChange('light')}
  style={{
    flex: 1,
    padding: '12px',
    background: theme === 'light' ? '#6c63ff' : '#f0f2f5',
    color: theme === 'light' ? '#fff' : '#1a1d2e',
    border: theme === 'light' ? '1px solid #6c63ff' : '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  }}
>
  ☀️ Light
</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>Accent Color</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {ACCENT_COLORS.map(color => (
                    <button
                        key={color.value}
                        onClick={() => onAccentColorChange(color.value)}
                        style={{
                        padding: '12px',
                        background: color.value,
                        border: accentColor === color.value ? '3px solid var(--text)' : '3px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: 'var(--text)',
                        fontSize: '12px',
                        fontWeight: '500',
                        opacity: accentColor === color.value ? 1 : 0.7
                        }}
                    >
                        {color.label}
                    </button>
                    ))}
                </div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 