import { useState } from 'react'
import { supabase } from '../supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isReset, setIsReset] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
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
    flex: 1,
    padding: '10px 14px',
    background: 'var(--card-inner)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '15px',
    width: '100%'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    color: 'var(--text-muted)',
    fontSize: '14px'
  }

  const eyeButton = (show, toggle) => (
    <button
      onClick={toggle}
      type="button"
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '0'
      }}
    >
      {show ? '🙈' : '👁️'}
    </button>
  )

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--card-inner)',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--card)',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text)' }}>NexusBase</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {isReset ? 'Reset your password' : isLogin ? 'Welcome back!' : 'Create your account'}
        </p>

        {/* Privacy Notice */}
        {!isLogin && !isReset && (
          <div style={{
            background: 'var(--accent)22',
            border: '1px solid var(--accent)44',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            By signing up you agree to our use of your data to power your personal dashboard.
            Your data is stored securely and is never sold or shared with third parties.
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
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. johndoe" style={inputStyle} />
            </div>
          </>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>

        {!isReset && (
          <div style={{ marginBottom: !isLogin ? '16px' : '24px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: '40px' }}
              />
              {eyeButton(showPassword, () => setShowPassword(!showPassword))}
            </div>
          </div>
        )}

        {!isLogin && !isReset && (
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: '40px' }}
              />
              {eyeButton(showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--accent)',
            color: 'var(--text)',
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
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            <span onClick={() => { setIsReset(false); setError(null); setMessage(null) }} style={{ color: 'var(--accent)', cursor: 'pointer' }}>
              Back to Sign In
            </span>
          </p>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null) }} style={{ color: 'var(--accent)', cursor: 'pointer' }}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </p>
            {isLogin && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                <span onClick={() => { setIsReset(true); setError(null); setMessage(null) }} style={{ color: 'var(--accent)', cursor: 'pointer' }}>
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