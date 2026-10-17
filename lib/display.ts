/** Reader display settings (theme and text size), kept in localStorage and applied to <html>. */
export const THEME_KEY = "blogs:theme";
export const FONT_KEY = "blogs:font";

export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];

/** Text-size steps. "m" is the default and sets no attribute. */
export const FONT_STEPS = ["s", "m", "l", "xl"] as const;
export type FontStep = (typeof FONT_STEPS)[number];
export const FONT_LABELS: Record<FontStep, string> = { s: "Small", m: "Default", l: "Large", xl: "Extra large" };

export const THEME_COLORS: Record<Theme, string> = { dark: "#0b1120", light: "#f8fafc" };

/** Runs in <head> before first paint so the saved theme and size never flash. */
export const displayInitScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(THEME_KEY)}),f=localStorage.getItem(${JSON.stringify(FONT_KEY)});if(t==="light"){d.setAttribute("data-theme","light");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",${JSON.stringify(THEME_COLORS.light)})}if(f==="s"||f==="l"||f==="xl")d.setAttribute("data-font",f)}catch(e){}})();`;
