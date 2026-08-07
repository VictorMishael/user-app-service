/**
 * Shared look for the app's actions: black by default, blue on hover.
 *
 * Sizing is deliberately left out so each call site appends its own padding
 * and width. The transparent border keeps that sizing identical to the dark
 * theme, which needs an outline to separate the black fill from the near-black
 * page background.
 */
export const ACTION_BUTTON_BASE =
  "rounded-md border border-transparent bg-black font-medium text-white transition-colors hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-slate-700";
