import { useState, useEffect } from 'react'

import quotes_list from './quotes'

export default function DateTimeWeather() {
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState(null)
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    setQuote(quotes_list[Math.floor(Math.random() * quotes_list.length)])
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        console.log('Location:', latitude, longitude)
        const key = import.meta.env.VITE_OPENWEATHER_KEY
        console.log('Key:', key)
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=imperial`
        )
        const data = await res.json()
        console.log('Weather data:', data)
        if (data.main) setWeather(data)
      } catch (e) {
        console.log('Weather error:', e)
      }
    }, (err) => {
      console.log('Location error:', err)
    })
  }, [])

  const formatDate = (date) => date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const formatTime = (date) => date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr 1fr',
      alignItems: 'center',
      gap: '16px'
    }}>
      {/* Time & Date */}
      <div>
        <div style={{ textAlign: 'center', fontSize: '40px', fontWeight: 'bold', color: '#fff', lineHeight: 1 }}>
          {formatTime(time)}
        </div>
        <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {formatDate(time)}
        </div>
      </div>

      {/* Quote */}
      <div style={{ textAlign: 'center', padding: '0 16px', borderLeft: '1px solid #2a2d3e', borderRight: '1px solid #2a2d3e' }}>
        {quote && (
          <>
            <p style={{
              color: 'var(--text)',
              fontSize: '13px',
              fontStyle: 'italic',
              lineHeight: '1.5',
              marginBottom: '6px'
            }}>
              "{quote.q}"
            </p>
            <p style={{ color: 'var(--accent)', fontSize: '12px' }}>— {quote.a}</p>
            <button
              onClick={() => setQuote(quotes_list[Math.floor(Math.random() * quotes_list.length)])}
              style={{
                marginTop: '8px',
                padding: '4px 12px',
                background: 'none',
                color: 'var(--text-dim)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              New Quote
            </button>
          </>
        )}
      </div>

      {/* Weather */}
      <div style={{ textAlign: 'center' }}>
        {weather ? (
          <>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>
              {Math.round(weather.main.temp)}°F
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {weather.weather[0].description}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {weather.name}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Weather loading...</div>
        )}
      </div>
    </div>
  )
}