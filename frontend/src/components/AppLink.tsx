import { Link, NavLink, type LinkProps, type NavLinkProps } from "react-router-dom"

/**
 * Link with view transitions enabled by default. Use this instead of
 * react-router's Link for any navigation between reader-facing pages.
 *
 * Why a wrapper rather than adding `viewTransition` at each call site:
 * one place to turn the behaviour off if it ever misbehaves, and no
 * chance of forgetting it on a new link.
 */
export function AppLink(props: LinkProps) {
  return <Link viewTransition {...props} />
}

export function AppNavLink(props: NavLinkProps) {
  return <NavLink viewTransition {...props} />
}