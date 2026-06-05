import { useState, useEffect } from 'react'

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming'
].join(' ')

export default function Spotify() {
  const [token, setToken] = useState(() => localStorage.getItem('spotify_token'))
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      exchangeToken(code)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (token) fetchCurrentTrack()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      exchangeToken(code)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (!current || !current.is_playing) return
    setProgress(current.progress_ms)
    const timer = setInterval(() => {
      setProgress(prev => prev + 1000)
    }, 1000)
    return () => clearInterval(timer)
  }, [current])

  const exchangeToken = async (code) => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = import.meta.env.VITE_REDIRECT_URI
    const codeVerifier = localStorage.getItem('spotify_code_verifier')

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
      })
    })
    const data = await res.json()
    if (data.access_token) {
      localStorage.setItem('spotify_token', data.access_token)
      setToken(data.access_token)
    }
  }

  const login = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = import.meta.env.VITE_REDIRECT_URI

    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    localStorage.setItem('spotify_code_verifier', codeVerifier)

    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES)}&code_challenge_method=S256&code_challenge=${codeChallenge}`
    console.log('Redirect URI:', redirectUri)
    console.log('Full URL:', url)
    window.location.href = url
  }

  const generateCodeVerifier = () => {
    const array = new Uint32Array(56)
    crypto.getRandomValues(array)
    return Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('')
  }

  const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  const fetchCurrentTrack = async () => {
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Status:', res.status)
      if (res.status === 401) {
        localStorage.removeItem('spotify_token')
        setToken(null)
        return
      }
      if (res.status === 204) {
        setCurrent(null)
        return
      }
      const data = await res.json()
      console.log('Player data:', data)
      setCurrent(data)
    } catch (e) {
      console.log('Spotify error', e)
    }
  }

  const controlPlayback = async (action) => {
    const endpoints = {
      play: { method: 'PUT', url: 'https://api.spotify.com/v1/me/player/play' },
      pause: { method: 'PUT', url: 'https://api.spotify.com/v1/me/player/pause' },
      next: { method: 'POST', url: 'https://api.spotify.com/v1/me/player/next' },
      prev: { method: 'POST', url: 'https://api.spotify.com/v1/me/player/previous' },
    }
    const { method, url } = endpoints[action]
    await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` }
    })
    setTimeout(fetchCurrentTrack, 500)
  }

  const handleLogout = () => {
    localStorage.removeItem('spotify_token')
    setToken(null)
    setCurrent(null)
  }

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
          Connect Spotify to control your music.
        </p>
        <button
          onClick={login}
          style={{
            padding: '10px 20px',
            background: '#1db954',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            margin: '0 auto'
          }}
        >
          Connect Spotify
        </button>
      </div>
    )
  }

  return (
    <div>
      {!current || !current.item ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ color: '#888', fontSize: '13px' }}>Nothing playing right now.</p>
          <p style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>Open Spotify on any device to start playing!</p>
        </div>
      ) : (
        <div>
          {/* Album Art + Track Info */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            {current.item.album?.images?.[0] && (
              <img
                src={current.item.album.images[0].url}
                alt="Album art"
                style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {current.item.name}
              </p>
              <p style={{
                color: '#888',
                fontSize: '12px',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {current.item.artists.map(a => a.name).join(', ')}
              </p>
              <p style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>
                {current.item.album.name}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ background: '#2a2d3e', borderRadius: '4px', height: '4px', marginBottom: '4px' }}>
              <div style={{
                background: '#1db954',
                width: `${(progress / current.item.duration_ms) * 100}%`,
                height: '100%',
                borderRadius: '4px',
                transition: 'width 1s linear'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#555', fontSize: '11px' }}>{formatTime(progress)}</span>
              <span style={{ color: '#555', fontSize: '11px' }}>{formatTime(current.item.duration_ms)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => controlPlayback('prev')}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}
            >
              ⏮
            </button>
            <button
              onClick={() => controlPlayback(current.is_playing ? 'pause' : 'play')}
              style={{
                background: '#1db954',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '20px',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {current.is_playing ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => controlPlayback('next')}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}
            >
              ⏭
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        style={{
          marginTop: '16px',
          padding: '6px 12px',
          background: 'none',
          color: '#555',
          border: '1px solid #2a2d3e',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Disconnect Spotify
      </button>
    </div>
  )
}