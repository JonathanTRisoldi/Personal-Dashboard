import { useState } from 'react'

export default function Widget({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={{ background: '#1a1d2e', borderRadius: '12px', overflow: 'hidden' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <h2 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>{title}</h2>
        <span style={{
          color: '#888',
          fontSize: '18px',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
          display: 'inline-block'
        }}>
          ▾
        </span>
      </div>
      {isOpen && (
        <div style={{ padding: '0 24px 24px 24px' }}>
          {children}
        </div>
      )}
    </div>
  )
}