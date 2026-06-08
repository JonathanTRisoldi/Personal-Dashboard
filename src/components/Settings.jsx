import { useState } from 'react'
import { supabase } from '../supabase'

export default function Settings({ session, onClose }) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error
      await supabase.auth.signOut()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div style={{
        background: '#1a1d2e',
        borderRadius: '12px',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', margin: 0 }}>Account Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '24px' }}>×</button>
        </div>

        {/* Account Info */}
        <div style={{ background: '#0f1117', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>Signed in as</p>
          <p style={{ color: '#fff', fontSize: '15px' }}>{session.user.email}</p>
        </div>

        {/* Delete Account */}
        <div style={{ border: '1px solid #ff4d4d44', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ color: '#ff4d4d', fontSize: '16px', marginBottom: '8px' }}>Danger Zone</h3>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
            Permanently delete your account and all your data including tasks, notes, projects, journal entries, and habits. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: '100%',
                padding: '10px',
                background: '#ff4d4d22',
                color: '#ff4d4d',
                border: '1px solid #ff4d4d44',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Delete My Account
            </button>
          ) : (
            <div>
              <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '8px' }}>
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE here..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#0f1117',
                  border: '1px solid #ff4d4d',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}
              />
              {error && <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '8px' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#ff4d4d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setConfirmText(''); setError(null) }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#2a2d3e',
                    color: '#aaa',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}