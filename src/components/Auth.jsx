import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isReset, setIsReset] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isReset) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_REDIRECT_URI}/reset-password`
      })
      if (error) setError(error.message)
      else setMessage('Check your email for a password reset link!')
      setLoading(false)
      return
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      if (!firstName.trim() || !lastName.trim() || !username.trim()) {
        setError('Please fill in all fields.')
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          username: username.toLowerCase().trim(),
          display_name: firstName
        })
        if (profileError) setError(profileError.message)
        else setMessage('Check your email for a confirmation link!')
      }
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: '#0f1117',
    border: '1px solid #2a2d3e',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '15px'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: '#aaa',
    fontSize: '14px'
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
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#fff' }}>My Dashboard</h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '8px' }}>
          {isReset ? 'Reset your password' : isLogin ? 'Welcome back!' : 'Create your account'}
        </p>

        {/* Privacy Notice */}
        {!isLogin && !isReset && (
          <div style={{
            background: '#6c63ff22',
            border: '1px solid #6c63ff44',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#aaa',
            textAlign: 'center'
          }}>
            By signing up you agree that your data is stored securely and is only accessible by you.
            We do not sell or share your personal information.
          </div>
        )}

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

        {!isLogin && !isReset && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. johndoe"
                style={inputStyle}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {!isReset && (
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

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
          {loading ? 'Please wait...' : isReset ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        {isReset ? (
          <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
            <span onClick={() => { setIsReset(false); setError(null); setMessage(null) }} style={{ color: '#6c63ff', cursor: 'pointer' }}>
              Back to Sign In
            </span>
          </p>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '8px' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null) }} style={{ color: '#6c63ff', cursor: 'pointer' }}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </p>
            {isLogin && (
              <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
                <span onClick={() => { setIsReset(true); setError(null); setMessage(null) }} style={{ color: '#6c63ff', cursor: 'pointer' }}>
                  Forgot your password?
                </span>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}