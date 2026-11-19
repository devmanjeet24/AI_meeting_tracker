import { forwardRef } from "react"

// Animated gradient border + glow on focus. `as` can be input | textarea | select.
const Field = forwardRef(function Field({ as: Tag = "input", className = "", wrapperClass = "", children, ...props }, ref) {
  return (
    <div className={`field ${wrapperClass}`}>
      <Tag ref={ref} className={className} {...props}>{children}</Tag>
    </div>
  )
})

export default Field
