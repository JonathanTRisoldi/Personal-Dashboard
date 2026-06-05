import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

export default function HabitTracker({ session }) {
  const [editingHabit, setEditingHabit] = useState(null)
  const [editName, setEditName] = useState('')
  const [habits, setHabits] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    const { data } = await supabase
      .from('habits')
      .select('*, habit_completions(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
    setHabits(data || [])
    setLoading(false)
  }

  const addHabit = async () => {
    if (!newHabit.trim()) return
    const { data, error } = await supabase
      .from('habits')
      .insert({ name: newHabit, user_id: session.user.id })
      .select('*, habit_completions(*)')
    if (error) { console.log(error); return }
    if (data && data[0]) setHabits([...habits, data[0]])
    setNewHabit('')
  }

  const deleteHabit = async (id) => {
    await supabase.from('habits').delete().eq('id', id)
    setHabits(habits.filter(h => h.id !== id))
  }

  const startEditing = (habit) => {
    setEditingHabit(habit.id)
    setEditName(habit.name)
  }

  const saveEdit = async (id) => {
    if (!editName.trim()) return
    const { error } = await supabase
      .from('habits')
      .update({ name: editName })
      .eq('id', id)
    if (error) { console.log(error); return }
    setHabits(habits.map(h => h.id === id ? { ...h, name: editName } : h))
    setEditingHabit(null)
  }

  const toggleToday = async (habit) => {
    const today = new Date().toISOString().split('T')[0]
    const alreadyDone = habit.habit_completions.some(c => c.completed_date === today)
    if (alreadyDone) {
      await supabase.from('habit_completions').delete().eq('habit_id', habit.id).eq('completed_date', today)
      setHabits(habits.map(h => h.id === habit.id ? {
        ...h,
        habit_completions: h.habit_completions.filter(c => c.completed_date !== today)
      } : h))
    } else {
      const { data } = await supabase.from('habit_completions').insert({ habit_id: habit.id, completed_date: today }).select()
      if (data && data[0]) {
        setHabits(habits.map(h => h.id === habit.id ? {
          ...h,
          habit_completions: [...h.habit_completions, data[0]]
        } : h))
      }
    }
  }

  const getStreak = (completions) => {
    if (!completions.length) return 0
    const dates = completions.map(c => c.completed_date).sort((a, b) => new Date(b) - new Date(a))
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (dates[0] !== today && dates[0] !== yesterday) return 0
    let streak = 0
    let current = new Date(dates[0])
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i])
      const expected = new Date(current)
      expected.setDate(expected.getDate() - (i === 0 ? 0 : 1))
      if (date.toISOString().split('T')[0] === expected.toISOString().split('T')[0]) {
        streak++
        current = date
      } else break
    }
    return streak
  }

  const getBestStreak = (completions) => {
    if (!completions.length) return 0
    const dates = completions.map(c => c.completed_date).sort((a, b) => new Date(a) - new Date(b))
    let best = 1
    let current = 1
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000
      if (diff === 1) { current++; best = Math.max(best, current) } else { current = 1 }
    }
    return best
  }

  const getLast30Days = (completions) => {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      days.push({ date, completed: completions.some(c => c.completed_date === date) })
    }
    return days
  }

  const isCompletedToday = (completions) => {
    const today = new Date().toISOString().split('T')[0]
    return completions.some(c => c.completed_date === today)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          placeholder="Add a new habit..."
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#0f1117',
            border: '1px solid #2a2d3e',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
        <button
          onClick={addHabit}
          style={{
            padding: '8px 16px',
            background: '#6c63ff',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Add
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : habits.length === 0 ? (
        <p style={{ color: '#888', fontSize: '14px' }}>No habits yet. Add one above!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {habits.map(habit => {
            const streak = getStreak(habit.habit_completions)
            const bestStreak = getBestStreak(habit.habit_completions)
            const last30 = getLast30Days(habit.habit_completions)
            const doneToday = isCompletedToday(habit.habit_completions)
            return (
              <div key={habit.id} style={{
                background: '#0f1117',
                borderRadius: '10px',
                padding: '16px',
                borderLeft: `3px solid ${doneToday ? '#4dff91' : '#6c63ff'}`
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => toggleToday(habit)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: `2px solid ${doneToday ? '#4dff91' : '#3a3f5c'}`,
                        background: doneToday ? '#4dff91' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        flexShrink: 0
                      }}
                    >
                      {doneToday ? '✓' : ''}
                    </button>
                    {editingHabit === habit.id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(habit.id)}
                          autoFocus
                          style={{
                            padding: '4px 8px',
                            background: '#1a1d2e',
                            border: '1px solid #6c63ff',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '14px',
                            width: '150px'
                          }}
                        />
                        <button
                          onClick={() => saveEdit(habit.id)}
                          style={{ padding: '4px 10px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingHabit(null)}
                          style={{ padding: '4px 10px', background: '#2a2d3e', color: '#aaa', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span style={{
                        color: doneToday ? '#4dff91' : '#e0e0e0',
                        fontSize: '15px',
                        fontWeight: '500',
                        textDecoration: doneToday ? 'line-through' : 'none'
                      }}>
                        {habit.name}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px' }}>🔥</div>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{streak}</div>
                      <div style={{ color: '#555', fontSize: '10px' }}>streak</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px' }}>🏆</div>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{bestStreak}</div>
                      <div style={{ color: '#555', fontSize: '10px' }}>best</div>
                    </div>
                    <button
                      onClick={() => startEditing(habit)}
                      style={{ background: 'none', border: 'none', color: '#6c63ff', cursor: 'pointer', fontSize: '16px' }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '18px' }}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* 30 Day Grid */}
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  {last30.map((day, i) => (
                    <div
                      key={i}
                      title={day.date}
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '3px',
                        background: day.completed ? '#4dff91' : '#1a1d2e',
                        flexShrink: 0
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ color: '#444', fontSize: '10px' }}>30 days ago</span>
                  <span style={{ color: '#444', fontSize: '10px' }}>today</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}