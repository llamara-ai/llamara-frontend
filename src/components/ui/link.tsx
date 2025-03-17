import { forwardRef } from 'react'

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, ...props }, ref) => {
    return (
      <a href={href} ref={ref} {...props}>
        {children}
      </a>
    )
  }
)
Link.displayName = "Link"

export { Link }
