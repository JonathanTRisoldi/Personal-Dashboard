import { useState, useEffect } from 'react'
import { supabase } from '../../supabase'

export default function Projects({ session }) {
  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [selectedProject, setSelectedProject] = useState(null)
  const [newStep, setNewStep] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*, project_steps(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  const addProject = async () => {
    if (!newProject.trim()) return
    const { data, error } = await supabase
      .from('projects')
      .insert({ title: newProject, description: newDescription, user_id: session.user.id })
      .select('*, project_steps(*)')
    if (error) { console.log(error); return }
    if (data && data[0]) setProjects([data[0], ...projects])
    setNewProject('')
    setNewDescription('')
  }

  const deleteProject = async (id) => {
    await supabase.from('projects').delete().eq('id', id)
    setProjects(projects.filter(p => p.id !== id))
    if (selectedProject?.id === id) setSelectedProject(null)
  }

  const startEditingProject = (e, project) => {
    e.stopPropagation()
    setEditingProject(project.id)
    setEditTitle(project.title)
    setEditDescription(project.description || '')
  }

  const saveProjectEdit = async (e, projectId) => {
    e.stopPropagation()
    const { error } = await supabase
      .from('projects')
      .update({ title: editTitle, description: editDescription })
      .eq('id', projectId)
    if (error) { console.log(error); return }
    const updated = projects.map(p =>
      p.id === projectId ? { ...p, title: editTitle, description: editDescription } : p
    )
    setProjects(updated)
    if (selectedProject?.id === projectId) {
      setSelectedProject({ ...selectedProject, title: editTitle, description: editDescription })
    }
    setEditingProject(null)
  }

  const cancelEdit = (e) => {
    e.stopPropagation()
    setEditingProject(null)
  }

  const addStep = async () => {
    if (!newStep.trim() || !selectedProject) return
    const { data, error } = await supabase
      .from('project_steps')
      .insert({ title: newStep, project_id: selectedProject.id, order_index: selectedProject.project_steps.length })
      .select()
    if (error) { console.log(error); return }
    if (data && data[0]) {
      const updatedProject = {
        ...selectedProject,
        project_steps: [...selectedProject.project_steps, data[0]]
      }
      setSelectedProject(updatedProject)
      setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
    }
    setNewStep('')
  }

  const toggleStep = async (step) => {
    await supabase
      .from('project_steps')
      .update({ completed: !step.completed })
      .eq('id', step.id)
    const updatedSteps = selectedProject.project_steps.map(s =>
      s.id === step.id ? { ...s, completed: !s.completed } : s
    )
    const updatedProject = { ...selectedProject, project_steps: updatedSteps }
    setSelectedProject(updatedProject)
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
  }

  const deleteStep = async (stepId) => {
    await supabase.from('project_steps').delete().eq('id', stepId)
    const updatedSteps = selectedProject.project_steps.filter(s => s.id !== stepId)
    const updatedProject = { ...selectedProject, project_steps: updatedSteps }
    setSelectedProject(updatedProject)
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
  }

  const getProgress = (steps) => {
    if (!steps || steps.length === 0) return 0
    return Math.round((steps.filter(s => s.completed).length / steps.length) * 100)
  }

  return (
    <div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          placeholder="Project name..."
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--card-inner)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            marginBottom: '8px'
          }}
        />
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Description (optional)..."
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--card-inner)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            marginBottom: '8px'
          }}
        />
        <button
          onClick={addProject}
          style={{
            width: '100%',
            padding: '8px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Add Project
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : projects.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No projects yet!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            {projects.map(project => {
              const progress = getProgress(project.project_steps)
              const isEditing = editingProject === project.id
              return (
                <div
                  key={project.id}
                  onClick={() => !isEditing && setSelectedProject(project)}
                  style={{
                    padding: '12px',
                    background: selectedProject?.id === project.id ? '#2a2d3e' : '#0f1117',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: isEditing ? 'default' : 'pointer',
                    border: selectedProject?.id === project.id ? '1px solid var(--accent)' : '1px solid transparent'
                  }}
                >
                  {isEditing ? (
                    <div onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          background: 'var(--card)',
                          border: '1px solid var(--accent)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '14px',
                          marginBottom: '6px'
                        }}
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description (optional)..."
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '13px',
                          marginBottom: '8px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={(e) => saveProjectEdit(e, project.id)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: 'var(--accent)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: '#2a2d3e',
                            color: '#aaa',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{project.title}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={(e) => startEditingProject(e, project)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '13px' }}
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteProject(project.id) }}
                            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '16px' }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {project.description && (
                        <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>{project.description}</p>
                      )}
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{progress}% complete</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{project.project_steps?.length || 0} steps</span>
                        </div>
                        <div style={{ background: 'var(--card)', borderRadius: '4px', height: '4px' }}>
                          <div style={{
                            background: progress === 100 ? '#4dff91' : 'var(--accent)',
                            width: `${progress}%`,
                            height: '100%',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {selectedProject && (
            <div style={{ flex: 1, background: 'var(--card-inner)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ color: '#fff', fontSize: '15px', marginBottom: '12px' }}>{selectedProject.title}</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addStep()}
                  placeholder="Add a step..."
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
                <button
                  onClick={addStep}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Add
                </button>
              </div>
              {selectedProject.project_steps?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No steps yet. Add one above!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedProject.project_steps.map(step => (
                    <div key={step.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      background: 'var(--card)',
                      borderRadius: '6px'
                    }}>
                      <input
                        type="checkbox"
                        checked={step.completed}
                        onChange={() => toggleStep(step)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{
                        flex: 1,
                        fontSize: '13px',
                        color: step.completed ? '#555' : '#e0e0e0',
                        textDecoration: step.completed ? 'line-through' : 'none'
                      }}>
                        {step.title}
                      </span>
                      <button
                        onClick={() => deleteStep(step.id)}
                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}