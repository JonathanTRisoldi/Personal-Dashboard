import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import DateTimeWeather from './widgets/DateTimeWeather'
import Tasks from './widgets/Tasks'
import Notes from './widgets/Notes'
import Projects from './widgets/Projects'
import Journal from './widgets/Journal'
import RSSFeed from './widgets/RSSFeed'
import GoogleCalendar from './widgets/GoogleCalendar'
import Spotify from './widgets/Spotify'
import HabitTracker from './widgets/HabitTracker'
import Widget from './Widget'
import DraggableWidget from './DraggableWidget'
import useProfile from './ProfileSetup'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'

const DEFAULT_LEFT = ['datetime', 'tasks-notes', 'projects', 'journal', 'habits']
const DEFAULT_RIGHT = ['spotify', 'calendar', 'news']

export default function Dashboard({ session }) {
  const { displayName, updateDisplayName, loading } = useProfile(session)
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [leftOrder, setLeftOrder] = useState(() => {
    const saved = localStorage.getItem('left_order')
    return saved ? JSON.parse(saved) : DEFAULT_LEFT
  })
  const [rightOrder, setRightOrder] = useState(() => {
    const saved = localStorage.getItem('right_order')
    return saved ? JSON.parse(saved) : DEFAULT_RIGHT
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    localStorage.setItem('left_order', JSON.stringify(leftOrder))
  }, [leftOrder])

  useEffect(() => {
    localStorage.setItem('right_order', JSON.stringify(rightOrder))
  }, [rightOrder])

const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 500, tolerance: 10 }
    })
  )

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

  const handleLeftDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setLeftOrder(items => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)))
    }
  }

  const handleRightDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setRightOrder(items => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)))
    }
  }

  const leftWidgets = {
    'datetime': (
      <Widget key="datetime" title="Date, Time & Weather">
        <DateTimeWeather />
      </Widget>
    ),
    'tasks-notes': (
      <DraggableWidget key="tasks-notes" id="tasks-notes" title="Tasks & Notes" defaultOpen={!isMobile}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <h3 style={{ color: '#aaa', fontSize: '14px', marginBottom: '12px' }}>Quick Tasks</h3>
            <Tasks session={session} />
          </div>
          <div>
            <h3 style={{ color: '#aaa', fontSize: '14px', marginBottom: '12px' }}>Quick Notes</h3>
            <Notes session={session} />
          </div>
        </div>
      </DraggableWidget>
    ),
    'projects': (
      <DraggableWidget key="projects" id="projects" title="Projects" defaultOpen={!isMobile}>
        <Projects session={session} />
      </DraggableWidget>
    ),
    'journal': (
      <DraggableWidget key="journal" id="journal" title="Daily Journal" defaultOpen={!isMobile}>
        <Journal session={session} />
      </DraggableWidget>
    ),
    'habits': (
      <DraggableWidget key="habits" id="habits" title="Habit Tracker" defaultOpen={!isMobile}>
        <HabitTracker session={session} />
      </DraggableWidget>
    )
  }

  const rightWidgets = {
    'spotify': (
      <DraggableWidget key="spotify" id="spotify" title="Spotify" defaultOpen={!isMobile}>
        <Spotify />
      </DraggableWidget>
    ),
    'calendar': (
      <DraggableWidget key="calendar" id="calendar" title="Google Calendar" defaultOpen={!isMobile}>
        <GoogleCalendar />
      </DraggableWidget>
    ),
    'news': (
      <DraggableWidget key="news" id="news" title="News Feed" defaultOpen={!isMobile}>
        <RSSFeed />
      </DraggableWidget>
    )
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: isMobile ? '12px' : '24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div>
          {!loading && (
            editingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                    fontSize: isMobile ? '16px' : '24px',
                    fontWeight: 'bold',
                    width: isMobile ? '160px' : '250px'
                  }}
                />
                <button onClick={saveName} style={{ padding: '6px 14px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Save</button>
                <button onClick={() => setEditingName(false)} style={{ padding: '6px 14px', background: '#2a2d3e', color: '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ color: '#fff', fontSize: isMobile ? '18px' : '24px' }}>
                  {getGreeting()}, {displayName || 'Friend'}!
                </h1>
                <button onClick={startEditingName} style={{ background: 'none', border: 'none', color: '#6c63ff', cursor: 'pointer', fontSize: '16px' }}>✎</button>
              </div>
            )
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isMobile && <span style={{ color: '#888', fontSize: '14px' }}>{session.user.email}</span>}
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', background: '#ff4d4d33', color: '#ff4d4d', border: '1px solid #ff4d4d44', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
        gap: '16px',
        alignItems: 'start'
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {leftWidgets['datetime']}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLeftDragEnd}>
            <SortableContext items={leftOrder.filter(id => id !== 'datetime')} strategy={verticalListSortingStrategy}>
              {leftOrder.filter(id => id !== 'datetime').map(id => leftWidgets[id])}
            </SortableContext>
          </DndContext>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: isMobile ? 'static' : 'sticky', top: '24px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRightDragEnd}>
            <SortableContext items={rightOrder} strategy={verticalListSortingStrategy}>
              {rightOrder.map(id => rightWidgets[id])}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  )
}