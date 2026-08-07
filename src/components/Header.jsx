import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSignOut } from "../hooks/useSignOut";
import { ACTION_BUTTON_BASE } from "../styles/buttonStyles";
import ThemeToggle from "./ThemeToggle";

const DESKTOP_ITEM_STYLES = `${ACTION_BUTTON_BASE} px-4 py-2 text-sm`;

const MOBILE_ITEM_STYLES = `${ACTION_BUTTON_BASE} flex w-full items-center justify-center gap-2 p-2 text-sm`;

const MENU_BUTTON_STYLES = `${ACTION_BUTTON_BASE} p-2 lg:hidden`;

const MenuIcon = ({ isOpen }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className="h-6 w-6"
    aria-hidden="true"
  >
    {isOpen ? (
      <path d="M6 6l12 12M18 6L6 18" />
    ) : (
      <path d="M4 7h16M4 12h16M4 17h16" />
    )}
  </svg>
);

/**
 * One nav entry rendered either as a router link or as an action button, so
 * the desktop bar and the mobile menu stay in sync from a single list.
 *
 * @param {{
 *   item: { to?: string, label: string, onClick?: () => void },
 *   className: string,
 *   onActivate?: () => void,
 * }} props
 */
const NavItem = ({ item, className, onActivate }) => {
  if (item.to) {
    return (
      <Link to={item.to} className={className} onClick={onActivate}>
        {item.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onActivate?.();
        item.onClick();
      }}
    >
      {item.label}
    </button>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session } = UserAuth();
  const { isDark } = useTheme();
  const { pathname } = useLocation();
  const { handleSignOut, error: signOutError } = useSignOut();

  // Navigating away must not leave the panel hanging open behind the new view.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // `undefined` means the session is still being restored: rendering the
  // signed-out actions now would flash "Sign up" at an authenticated user.
  const navItems =
    session === undefined
      ? []
      : session
        ? [
            { key: "dashboard", to: "/dashboard", label: "Dashboard" },
            { key: "signout", onClick: handleSignOut, label: "Sign out" },
          ]
        : [
            { key: "signin", to: "/signin", label: "Sign in" },
            { key: "signup", to: "/signup", label: "Sign up" },
          ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/90">
      {/* Three equal-width columns keep the project name centred on the header
          itself, not on the space left over by the side groups. */}
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 justify-self-start"
          aria-label="Vic-Thor home"
        >
          <img
            src={isDark ? "/thor-hammer-white.svg" : "/thor-hammer.svg"}
            alt=""
            className="h-8 w-8"
          />
          <span className="text-lg font-bold tracking-tight">Vic-Thor</span>
        </Link>

        <span className="justify-self-center truncate text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300 sm:text-base">
          User-App-Service
        </span>

        <div className="flex items-center gap-3 justify-self-end">
          <nav className="hidden items-center gap-3 lg:flex">
            {navItems.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                className={DESKTOP_ITEM_STYLES}
              />
            ))}
          </nav>

          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="header-mobile-menu"
            className={MENU_BUTTON_STYLES}
          >
            <MenuIcon isOpen={isMenuOpen} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="header-mobile-menu"
          className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-800 lg:hidden"
        >
          {navItems.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              className={MOBILE_ITEM_STYLES}
              onActivate={() => setIsMenuOpen(false)}
            />
          ))}
          <ThemeToggle withLabel className="w-full justify-center" />
        </nav>
      )}

      {signOutError && (
        <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {signOutError}
        </p>
      )}
    </header>
  );
};

export default Header;
