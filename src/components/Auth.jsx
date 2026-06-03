import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email for a confirmation link!')
    }

    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#0f1117'
    }}>
      <div style={{
        background: '#1a1d2e',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#fff' }}>
          My Dashboard
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '32px' }}>
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </p>

        {error && (
          <div style={{ background: '#ff4d4d22', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: '#4dff9122', border: '1px solid #4dff91', color: '#4dff91', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>
            {message}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '14px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#0f1117',
              border: '1px solid #2a2d3e',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontSize: '14px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#0f1117',
              border: '1px solid #2a2d3e',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px'
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#6c63ff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: '#6c63ff', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  )
}