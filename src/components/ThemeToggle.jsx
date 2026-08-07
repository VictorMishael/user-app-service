import { useTheme } from "../context/ThemeContext";
import { ACTION_BUTTON_BASE } from "../styles/buttonStyles";

const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

/**
 * Light/dark theme switch.
 *
 * @param {{ withLabel?: boolean, className?: string }} props
 *   withLabel renders a visible text label, used inside the mobile menu where
 *   a bare icon would read as ambiguous.
 */
const ThemeToggle = ({ withLabel = false, className = "" }) => {
  const { isDark, toggleTheme } = useTheme();
  const actionLabel = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={actionLabel}
      aria-label={actionLabel}
      className={`${ACTION_BUTTON_BASE} flex items-center gap-2 p-2 text-sm ${className}`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      {withLabel && (
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      )}
    </button>
  );
};

export default ThemeToggle;
