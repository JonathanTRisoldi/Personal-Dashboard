import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

export default function Tasks({ session }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

const addTask = async () => {
    if (!newTask.trim()) return
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title: newTask, user_id: session.user.id })
      .select()
    if (error) {
      console.log(error)
      return
    }
    if (data && data[0]) {
      setTasks([data[0], ...tasks])
    }
    setNewTask('')
  }

  const toggleTask = async (task) => {
    await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id)
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task..."
          style={{
            flex: 1,
            padding: '8px 12px',
            background: 'var(--card-inner)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontSize: '14px'
          }}
        />
        <button
          onClick={addTask}
          style={{
            padding: '8px 16px',
            background: 'var(--accent)',
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
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : tasks.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No tasks yet. Add one above!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map(task => (
            <div key={task.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              background: 'var(--card-inner)',
              borderRadius: '8px'
            }}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{
                flex: 1,
                fontSize: '14px',
                color: task.completed ? 'var(--text-dim)' : 'var(--text)',
                textDecoration: task.completed ? 'line-through' : 'none'
              }}>
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4d4d',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0 4px'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}