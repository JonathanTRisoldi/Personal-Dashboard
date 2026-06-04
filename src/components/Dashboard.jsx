import { useState } from 'react'
import { supabase } from '../supabase'
import DateTimeWeather from './widgets/DateTimeWeather'
import Tasks from './widgets/Tasks'
import Notes from './widgets/Notes'
import Projects from './widgets/Projects'
import Journal from './widgets/Journal'
import RSSFeed from './widgets/RSSFeed'
import Widget from './Widget'
import useProfile from './ProfileSetup'
import GoogleCalendar from './widgets/GoogleCalendar'
import Spotify from './widgets/Spotify'

export default function Dashboard({ session }) {
  const { displayName, updateDisplayName, loading } = useProfile(session)
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const startEditingName = () => {
    setTempName(displayName)
    setEditingName(true)
  }

  const saveName = async () => {
    if (tempName.trim()) await updateDisplayName(tempName.trim())
    setEditingName(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          {!loading && (
            editingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  placeholder="Enter your name..."
                  autoFocus
                  style={{
                    padding: '6px 12px',
                    background: '#1a1d2e',
                    border: '1px solid #6c63ff',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    width: '250px'
                  }}
                />
                <button onClick={saveName} style={{ padding: '6px 14px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Save</button>
                <button onClick={() => setEditingName(false)} style={{ padding: '6px 14px', background: '#2a2d3e', color: '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ color: '#ffffff', fontSize: '24px' }}>
                  {getGreeting()}, {displayName || 'Friend'}!
                </h1>
                <button onClick={startEditingName} style={{ background: 'none', border: 'none', color: '#6c63ff', cursor: 'pointer', fontSize: '16px' }}>✎</button>
              </div>
            )
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>{session.user.email}</span>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', background: '#ff4d4d33', color: '#ff4d4d', border: '1px solid #ff4d4d44', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Widget title="Date, Time & Weather">
            <DateTimeWeather />
          </Widget>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <Widget title="Quick Tasks">
              <Tasks session={session} />
            </Widget>
            <Widget title="Quick Notes">
              <Notes session={session} />
            </Widget>
          </div>

          <Widget title="Projects">
            <Projects session={session} />
          </Widget>

          <Widget title="Daily Journal">
            <Journal session={session} />
          </Widget>
        </div>

        {/* Right Sidebar */}
<div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
  <Widget title="Spotify">
    <Spotify />
  </Widget>
  <Widget title="Google Calendar">
    <GoogleCalendar />
  </Widget>
  <Widget title="News Feed">
    <RSSFeed />
  </Widget>
</div>

      </div>
    </div>
  )
}