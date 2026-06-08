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
import Settings from './Settings'
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
  const [showSettings, setShowSettings] = useState(false)
  const [widgetPrefs, setWidgetPrefs] = useState({})
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent_color') || 'var(--accent)')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
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

  useEffect(() => {
    localStorage.setItem('accent_color', accentColor)
    document.documentElement.style.setProperty('--accent', accentColor)
  }, [accentColor])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    fetchWidgetPrefs()
  }, [])

  const fetchWidgetPrefs = async () => {
    const { data } = await supabase
      .from('widget_preferences')
      .select('*')
      .eq('user_id', session.user.id)
    const prefs = {}
    const allWidgets = ['datetime', 'tasks-notes', 'projects', 'journal', 'habits', 'spotify', 'calendar', 'news']
    allWidgets.forEach(w => { prefs[w] = true })
    if (data) data.forEach(p => { prefs[p.widget_id] = p.enabled })
    setWidgetPrefs(prefs)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 10 } })
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

  const bgColor = theme === 'light' ? '#f0f2f5' : '#0f1117'
  const cardColor = theme === 'light' ? '#ffffff' : '#1a1d2e'
  const textColor = theme === 'light' ? '#1a1d2e' : '#e0e0e0'

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: isMobile ? '12px' : '24px', minHeight: '100vh', background: bgColor }}>

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
                    background: cardColor,
                    border: `1px solid ${accentColor}`,
                    borderRadius: '8px',
                    color: textColor,
                    fontSize: isMobile ? '16px' : '24px',
                    fontWeight: 'bold',
                    width: isMobile ? '160px' : '250px'
                  }}
                />
                <button onClick={saveName} style={{ padding: '6px 14px', background: accentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Save</button>
                <button onClick={() => setEditingName(false)} style={{ padding: '6px 14px', background: '#2a2d3e', color: '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ color: textColor, fontSize: isMobile ? '18px' : '24px' }}>
                  {getGreeting()}, {displayName || 'Friend'}!
                </h1>
                <button onClick={startEditingName} style={{ background: 'none', border: 'none', color: accentColor, cursor: 'pointer', fontSize: '16px' }}>✎</button>
              </div>
            )
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isMobile && <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{session.user.email}</span>}
          <button
            onClick={() => setShowSettings(true)}
            style={{ padding: '8px 16px', background: '#2a2d3e', color: '#aaa', border: '1px solid #3a3f5c', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            ⚙️ Settings
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
          {widgetPrefs['datetime'] !== false && (
            <Widget title="Date, Time & Weather" cardColor={cardColor} textColor={textColor}>
              <DateTimeWeather />
            </Widget>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLeftDragEnd}>
            <SortableContext items={leftOrder.filter(id => id !== 'datetime')} strategy={verticalListSortingStrategy}>
              {leftOrder.filter(id => id !== 'datetime').map((id, index) => {
                if (widgetPrefs[id] === false) return null
                const filteredOrder = leftOrder.filter(i => i !== 'datetime' && widgetPrefs[i] !== false)
                const visibleIndex = filteredOrder.indexOf(id)
                const widgetProps = {
                  isMobile,
                  isFirst: visibleIndex === 0,
                  isLast: visibleIndex === filteredOrder.length - 1,
                  onMoveUp: () => setLeftOrder(prev => {
                    const filtered = prev.filter(i => i !== 'datetime')
                    const newOrder = arrayMove(filtered, filtered.indexOf(id), filtered.indexOf(id) - 1)
                    return ['datetime', ...newOrder]
                  }),
                  onMoveDown: () => setLeftOrder(prev => {
                    const filtered = prev.filter(i => i !== 'datetime')
                    const newOrder = arrayMove(filtered, filtered.indexOf(id), filtered.indexOf(id) + 1)
                    return ['datetime', ...newOrder]
                  })
                }
                const widgets = {
                  'tasks-notes': (
                    <DraggableWidget key="tasks-notes" id="tasks-notes" title="Tasks & Notes" defaultOpen={!isMobile} {...widgetProps}>
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
                    <DraggableWidget key="projects" id="projects" title="Projects" defaultOpen={!isMobile} {...widgetProps}>
                      <Projects session={session} />
                    </DraggableWidget>
                  ),
                  'journal': (
                    <DraggableWidget key="journal" id="journal" title="Daily Journal" defaultOpen={!isMobile} {...widgetProps}>
                      <Journal session={session} />
                    </DraggableWidget>
                  ),
                  'habits': (
                    <DraggableWidget key="habits" id="habits" title="Habit Tracker" defaultOpen={!isMobile} {...widgetProps}>
                      <HabitTracker session={session} />
                    </DraggableWidget>
                  )
                }
                return widgets[id]
              })}
            </SortableContext>
          </DndContext>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: isMobile ? 'static' : 'sticky', top: '24px' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRightDragEnd}>
            <SortableContext items={rightOrder} strategy={verticalListSortingStrategy}>
              {rightOrder.map((id, index) => {
                if (widgetPrefs[id] === false) return null
                const visibleOrder = rightOrder.filter(i => widgetPrefs[i] !== false)
                const visibleIndex = visibleOrder.indexOf(id)
                const widgetProps = {
                  isMobile,
                  isFirst: visibleIndex === 0,
                  isLast: visibleIndex === visibleOrder.length - 1,
                  onMoveUp: () => setRightOrder(prev => arrayMove(prev, prev.indexOf(id), prev.indexOf(id) - 1)),
                  onMoveDown: () => setRightOrder(prev => arrayMove(prev, prev.indexOf(id), prev.indexOf(id) + 1))
                }
                const widgets = {
                  'spotify': (
                    <DraggableWidget key="spotify" id="spotify" title="Spotify" defaultOpen={!isMobile} {...widgetProps}>
                      <Spotify />
                    </DraggableWidget>
                  ),
                  'calendar': (
                    <DraggableWidget key="calendar" id="calendar" title="Google Calendar" defaultOpen={!isMobile} {...widgetProps}>
                      <GoogleCalendar />
                    </DraggableWidget>
                  ),
                  'news': (
                    <DraggableWidget key="news" id="news" title="News Feed" defaultOpen={!isMobile} {...widgetProps}>
                      <RSSFeed />
                    </DraggableWidget>
                  )
                }
                return widgets[id]
              })}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {showSettings && (
        <Settings
          session={session}
          onClose={() => { setShowSettings(false); fetchWidgetPrefs() }}
          onSignOut={handleLogout}
          accentColor={accentColor}
          onAccentColorChange={setAccentColor}
          theme={theme}
          onThemeChange={setTheme}
        />
      )}
    </div>
  )
} 