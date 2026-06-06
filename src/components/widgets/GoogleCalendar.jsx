import { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'

export default function GoogleCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(() => localStorage.getItem('google_token'))
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({ summary: '', date: '', startTime: '', endTime: '' })

  useEffect(() => {
    if (token) fetchEvents(token)
  }, [token, currentDate])

  const login = useGoogleLogin({
    onSuccess: (res) => {
      localStorage.setItem('google_token', res.access_token)
      setToken(res.access_token)
    },
    onError: () => setError('Login failed. Please try again.'),
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events'
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

  const addEvent = async () => {
    if (!newEvent.summary || !newEvent.date) return
    const eventBody = newEvent.startTime ? {
      summary: newEvent.summary,
      start: { dateTime: `${newEvent.date}T${newEvent.startTime}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end: { dateTime: `${newEvent.date}T${newEvent.endTime || newEvent.startTime}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
    } : {
      summary: newEvent.summary,
      start: { date: newEvent.date },
      end: { date: newEvent.date }
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(eventBody)
    })
    if (res.ok) {
      setNewEvent({ summary: '', date: '', startTime: '', endTime: '' })
      setShowAddEvent(false)
      fetchEvents(token)
    }
  }

  const updateEvent = async () => {
    if (!editingEvent) return
    const eventBody = editingEvent.start.dateTime ? {
      summary: editingEvent.summary,
      start: editingEvent.start,
      end: editingEvent.end
    } : {
      summary: editingEvent.summary,
      start: editingEvent.start,
      end: editingEvent.end
    }

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${editingEvent.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(eventBody)
    })
    if (res.ok) {
      setEditingEvent(null)
      fetchEvents(token)
    }
  }

  const deleteEvent = async (eventId) => {
    await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchEvents(token)
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
      let eventDate
      if (event.start.date) {
        const [year, month, d] = event.start.date.split('-').map(Number)
        eventDate = new Date(year, month - 1, d)
      } else {
        eventDate = new Date(event.start.dateTime)
      }
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

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const upcomingEvents = events
    .filter(e => {
      const date = e.start.date
        ? (() => { const [y, m, d] = e.start.date.split('-').map(Number); return new Date(y, m - 1, d) })()
        : new Date(e.start.dateTime)
      return date >= new Date(new Date().setHours(0, 0, 0, 0))
    })
    .slice(0, 5)

  const formatEventTime = (event) => {
    if (event.start.date) {
      const [year, month, day] = event.start.date.split('-').map(Number)
      return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    return new Date(event.start.dateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const inputStyle = {
    width: '100%',
    padding: '7px 10px',
    background: '#0f1117',
    border: '1px solid #2a2d3e',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    marginBottom: '8px'
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>Connect your Google Calendar to see upcoming events.</p>
        {error && <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
        <button onClick={() => login()} style={{ padding: '10px 20px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', margin: '0 auto', display: 'block' }}>
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
            <div key={i} style={{
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              background: isToday(day) ? '#6c63ff' : day ? '#0f1117' : 'transparent',
            }}>
              {day && (
                <>
                  <span style={{ fontSize: '12px', color: isToday(day) ? '#fff' : '#aaa' }}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isToday(day) ? '#fff' : '#6c63ff', marginTop: '2px' }} />
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Event Button */}
      <button
        onClick={() => setShowAddEvent(!showAddEvent)}
        style={{ width: '100%', padding: '8px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginBottom: '12px' }}
      >
        {showAddEvent ? 'Cancel' : '+ Add Event'}
      </button>

      {/* Add Event Form */}
      {showAddEvent && (
        <div style={{ background: '#0f1117', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
          <input type="text" placeholder="Event title..." value={newEvent.summary} onChange={e => setNewEvent({ ...newEvent, summary: e.target.value })} style={inputStyle} />
          <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input type="time" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} placeholder="Start time (optional)" />
            <input type="time" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} placeholder="End time" />
          </div>
          <button onClick={addEvent} style={{ width: '100%', padding: '8px', background: '#4dff91', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>
            Save Event
          </button>
        </div>
      )}

      {/* Edit Event Form */}
      {editingEvent && (
        <div style={{ background: '#0f1117', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '8px' }}>Editing event</p>
            <input
                type="text"
                value={editingEvent.summary}
                onChange={e => setEditingEvent({ ...editingEvent, summary: e.target.value })}
                placeholder="Event title..."
                style={inputStyle}
            />
      {editingEvent.start.date ? (
        <input
            type="date"
            value={editingEvent.start.date}
            onChange={e => setEditingEvent({
                ...editingEvent,
                start: { date: e.target.value },
                end: { date: e.target.value }
            })}
            style={inputStyle}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
                <p style={{ color: '#555', fontSize: '11px', marginBottom: '4px' }}>Start</p>
            <input
                type="datetime-local"
                value={editingEvent.start.dateTime?.slice(0, 16)}
                onChange={e => setEditingEvent({
                    ...editingEvent,
                    start: { ...editingEvent.start, dateTime: e.target.value + ':00' }
                })}
                style={{ ...inputStyle, marginBottom: 0 }}
            />
        </div>
        <div>
          <p style={{ color: '#555', fontSize: '11px', marginBottom: '4px' }}>End</p>
          <input
            type="datetime-local"
            value={editingEvent.end.dateTime?.slice(0, 16)}
            onChange={e => setEditingEvent({
              ...editingEvent,
              end: { ...editingEvent.end, dateTime: e.target.value + ':00' }
            })}
            style={{ ...inputStyle, marginBottom: 0 }}
          />
        </div>
      </div>
    )}
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      <button onClick={updateEvent} style={{ flex: 1, padding: '8px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Save</button>
      <button onClick={() => setEditingEvent(null)} style={{ flex: 1, padding: '8px', background: '#2a2d3e', color: '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
    </div>
  </div>
)}

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
              <div key={event.id} style={{ padding: '8px 10px', background: '#0f1117', borderRadius: '6px', borderLeft: '3px solid #6c63ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: '#e0e0e0', fontSize: '12px', marginBottom: '2px' }}>{event.summary}</p>
                    <p style={{ color: '#555', fontSize: '11px' }}>{formatEventTime(event)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setEditingEvent(event)} style={{ background: 'none', border: 'none', color: '#6c63ff', cursor: 'pointer', fontSize: '13px' }}>✎</button>
                    <button onClick={() => deleteEvent(event.id)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px' }}>×</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button onClick={handleLogout} style={{ marginTop: '12px', padding: '6px 12px', background: 'none', color: '#555', border: '1px solid #2a2d3e', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
        Disconnect Calendar
      </button>
    </div>
  )
}