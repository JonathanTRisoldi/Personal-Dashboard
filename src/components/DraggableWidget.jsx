import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Widget from './Widget'

export default function DraggableWidget({ id, title, defaultOpen, children, isMobile, onMoveUp, onMoveDown, isFirst, isLast }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Widget
        title={title}
        defaultOpen={defaultOpen}
        dragHandleProps={{ ...attributes, ...listeners }}
        isMobile={isMobile}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        isFirst={isFirst}
        isLast={isLast}
      >
        {children}
      </Widget>
    </div>
  )
}