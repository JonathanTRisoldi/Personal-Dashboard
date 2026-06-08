import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setMessage('Password updated successfully! You can now sign in.')
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#0f1117',
      padding: '24px'
    }}>
      <div style={{
        background: '#1a1d2e',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#fff' }}>Reset Password</h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '24px' }}>Enter your new password below.</p>

        {error && (
          <div style={{ background: '#ff4d4d22', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: '#4dff9122', border: '1px solid #4dff91', color: '#4dff91', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '14px' }}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '8px', color: '#fff', fontSize: '15px' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '14px' }}>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: '#0f1117', border: '1px solid #2a2d3e', borderRadius: '8px', color: '#fff', fontSize: '15px' }}
          />
        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}
        >
          {loading ? 'Please wait...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}