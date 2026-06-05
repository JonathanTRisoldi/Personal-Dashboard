import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Widget from './Widget'

export default function DraggableWidget({ id, title, defaultOpen, children }) {
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
    cursor: 'grab'
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Widget
        title={title}
        defaultOpen={defaultOpen}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        {children}
      </Widget>
    </div>
  )
}