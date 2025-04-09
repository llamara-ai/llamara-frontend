import React from "react";

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

const Link = (
  {
    ref,
    href,
    children,
    ...props
  }: LinkProps & {
    ref: React.RefObject<HTMLAnchorElement>;
  }
) => {
  return (
    <a href={href} ref={ref} {...props}>
      {children}
    </a>
  )
}
Link.displayName = "Link"

export { Link }
