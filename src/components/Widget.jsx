import { useState } from 'react'

export default function Widget({ title, children, defaultOpen = true, dragHandleProps = {}, isMobile, onMoveUp, onMoveDown, isFirst, isLast }) {
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
          {!isMobile && (
            <span
              {...dragHandleProps}
              style={{ color: '#3a3f5c', fontSize: '16px', cursor: 'grab', padding: '0 4px' }}
              title="Drag to reorder"
            >
              ⠿
            </span>
          )}
          {isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isFirst ? '#2a2d3e' : 'var(--accent)',
                  cursor: isFirst ? 'default' : 'pointer',
                  fontSize: '12px',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ▲
              </button>
              <button
                onClick={onMoveDown}
                disabled={isLast}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isLast ? '#2a2d3e' : 'var(--accent)',
                  cursor: isLast ? 'default' : 'pointer',
                  fontSize: '12px',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ▼
              </button>
            </div>
          )}
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