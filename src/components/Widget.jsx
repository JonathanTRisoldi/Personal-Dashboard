import { useState } from 'react'

export default function Widget({ title, children, defaultOpen = true, dragHandleProps = {} }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={{ background: '#1a1d2e', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        userSelect: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <span
            {...dragHandleProps}
            style={{ color: '#3a3f5c', fontSize: '16px', cursor: 'grab', padding: '0 4px' }}
            title="Drag to reorder"
          >
            ⠿
          </span>
          <h2
            onClick={() => setIsOpen(!isOpen)}
            style={{ color: '#fff', fontSize: '18px', margin: 0, cursor: 'pointer', flex: 1 }}
          >
            {title}
          </h2>
        </div>
        <span
          onClick={() => setIsOpen(!isOpen)}
          style={{
            color: '#888',
            fontSize: '18px',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
            display: 'inline-block',
            cursor: 'pointer'
          }}
        >
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