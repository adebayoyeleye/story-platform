import { Link, NavLink, useLocation } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { cn } from "@/lib/cn"
import type { PropsWithChildren } from "react"
import { BRAND } from "@/lib/brand"

type Props = PropsWithChildren<{
  /** Hide the chrome — used by the reading page in distraction-free mode. */
  hideChrome?: boolean
}>

/**
 * The persistent chrome wrapping every page. Pages render their content
 * as children; AppShell owns the top bar and the theme toggle.
 *
 * Architectural note: AppShell is layout, not routing. Pages still render
 * directly under routes in router.tsx; each page wraps itself in AppShell.
 * This is intentional — it lets specific pages (the reading page) opt out
 * of the chrome by passing `hideChrome` or by not using AppShell at all.
 * If we hoisted AppShell to the router level, every escape would require
 * a route-prop or context flag.
 */
export function AppShell({ children, hideChrome }: Props) {
  const [theme, toggleTheme] = useTheme()
  const location = useLocation()

  // Hide chrome on the read-page route too (catches direct hideChrome=false
  // misuse — the reading experience should never grow surprise chrome).
  const isReading = location.pathname.startsWith("/chapters/")
  const showChrome = !hideChrome && !isReading

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showChrome && (
        <header className="border-b border-border bg-surface/70 backdrop-blur supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-30">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
            <Link
              to="/"
              className="font-display text-xl tracking-tight hover:opacity-80"
              aria-label={`${BRAND.name} home`}
            >
              {/* Wordmark placeholder. Swap for an SVG/logo later. */}
              {BRAND.name}
            </Link>

            <nav className="flex items-center gap-1 text-sm">
              <NavItem to="/" label="Read" end />
              <NavItem to="/write" label="Write" />
              <button
                type="button"
                onClick={toggleTheme}
                className={cn(
                  "ml-2 inline-flex items-center justify-center h-9 w-9 rounded-md",
                  "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                  "transition-colors"
                )}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {/* Unicode placeholders. Swap for lucide-react sun/moon later. */}
                <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
              </button>
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1">{children}</main>

      {showChrome && (
        <footer className="border-t border-border mt-12 py-6 text-xs text-muted-foreground">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-wrap gap-x-6 gap-y-2 justify-between">
            <span>© {new Date().getFullYear()} {BRAND.name}</span>
            <span className="flex gap-4">
              {/* Stubs until legal docs ship per Part 2 of the design doc */}
              <span className="opacity-60">Terms</span>
              <span className="opacity-60">Privacy</span>
              <span className="opacity-60">Content Policy</span>
            </span>
          </div>
        </footer>
      )}
    </div>
  )
}

function NavItem({ to, label, end }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "px-3 py-1.5 rounded-md text-sm transition-colors",
          "hover:bg-surface-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
          isActive
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      {label}
    </NavLink>
  )
}