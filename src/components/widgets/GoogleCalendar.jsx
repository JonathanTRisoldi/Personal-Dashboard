import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'

export default function GoogleCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem('google_token'))
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    if (token) fetchEvents(token)
  }, [token])

  const login = useGoogleLogin({
    onSuccess: (res) => {
      localStorage.setItem('google_token', res.access_token)
      setToken(res.access_token)
    },
    onError: () => setError('Login failed. Please try again.'),
    scope: 'https://www.googleapis.com/auth/calendar.readonly'
  })

  const fetchEvents = async (accessToken) => {
    setLoading(true)
    setError(null)
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString()
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start}&timeMax=${end}&singleEvents=true&orderBy=startTime&maxResults=50`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (res.status === 401) {
        localStorage.removeItem('google_token')
        setToken(null)
        return
      }
      const data = await res.json()
      setEvents(data.items || [])
    } catch (e) {
      setError('Failed to load events.')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('google_token')
    setToken(null)
    setEvents([])
  }

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const getEventsForDay = (day) => {
    return events.filter(event => {
      const eventDate = new Date(event.start.date || event.start.dateTime)
      return eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
    })
  }

  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
  }

  const prevMonth = () => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    setCurrentDate(d)
    if (token) fetchEvents(token)
  }

  const nextMonth = () => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    setCurrentDate(d)
    if (token) fetchEvents(token)
  }

  const upcomingEvents = events
    .filter(e => new Date(e.start.date || e.start.dateTime) >= new Date())
    .slice(0, 5)

  const formatEventTime = (event) => {
    if (event.start.date) {
      return new Date(event.start.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return new Date(event.start.dateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
          Connect your Google Calendar to see upcoming events.
        </p>
        {error && <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
        <button
          onClick={() => login()}
          style={{
            padding: '10px 20px',
            background: '#6c63ff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            margin: '0 auto'
          }}
        >
          Connect Google Calendar
        </button>
      </div>
    )
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div>
      {/* Month Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}>‹</button>
        <span style={{ color: '#fff', fontSize: '15px', fontWeight: '500' }}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}>›</button>
      </div>

      {/* Day Labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} style={{ textAlign: 'center', color: '#555', fontSize: '11px', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '16px' }}>
        {days.map((day, i) => {
          const dayEvents = day ? getEventsForDay(day) : []
          return (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                background: isToday(day) ? '#6c63ff' : day ? '#0f1117' : 'transparent',
                position: 'relative'
              }}
            >
              {day && (
                <>
                  <span style={{ fontSize: '12px', color: isToday(day) ? '#fff' : '#aaa' }}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: isToday(day) ? '#fff' : '#6c63ff',
                      marginTop: '2px'
                    }} />
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Upcoming Events */}
      {loading ? (
        <p style={{ color: '#888', fontSize: '13px' }}>Loading events...</p>
      ) : upcomingEvents.length === 0 ? (
        <p style={{ color: '#888', fontSize: '13px' }}>No upcoming events.</p>
      ) : (
        <>
          <p style={{ color: '#555', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {upcomingEvents.map(event => (
              <div key={event.id} style={{
                padding: '8px 10px',
                background: '#0f1117',
                borderRadius: '6px',
                borderLeft: '3px solid #6c63ff'
              }}>
                <p style={{ color: '#e0e0e0', fontSize: '12px', marginBottom: '2px' }}>{event.summary}</p>
                <p style={{ color: '#555', fontSize: '11px' }}>{formatEventTime(event)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        onClick={handleLogout}
        style={{
          marginTop: '12px',
          padding: '6px 12px',
          background: 'none',
          color: '#555',
          border: '1px solid #2a2d3e',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Disconnect Calendar
      </button>
    </div>
  )
}