/** Shared rules for sign-up and the profile. firestore.rules repeats the length and option checks on the server. */

export const EXPERIENCE_OPTIONS = [
  { value: "student", label: "Student or just starting" },
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-3", label: "1 to 3 years" },
  { value: "3-5", label: "3 to 5 years" },
  { value: "5-plus", label: "5 years or more" },
] as const;

export const GOAL_OPTIONS = [
  { value: "learn", label: "Learn programming from the basics" },
  { value: "interviews", label: "Prepare for interviews" },
  { value: "level-up", label: "Grow in my current job" },
  { value: "career-switch", label: "Switch to a software career" },
  { value: "other", label: "Something else" },
] as const;

export type Profile = {
  name: string;
  email: string;
  experience?: string;
  goal?: string;
  emailUpdates: boolean;
};

/**
 * Two letters for the avatar. Two or more words give the first letter of the first two ("Jainik Patel" is "JP");
 * one word gives its first two letters ("jainikpatel" is "JA").
 */
export function initialsOf(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/[\s._-]+/).filter(Boolean);
  const letters = words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

/** Returns an error message, or null when the password is acceptable (Firebase itself needs at least 6). */
export function checkPassword(p: string): string | null {
  if (!p) return "Enter a password.";
  if (p.length < 8) return "Use at least 8 characters.";
  return null;
}

/** Returns an error message, or null when the name is acceptable. */
export function checkName(raw: string): string | null {
  const n = raw.trim();
  if (n.length < 2) return "Enter your name.";
  if (n.length > 60) return "Use 60 characters or fewer.";
  return null;
}

export function checkEmail(raw: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim()) ? null : "Enter a valid email address.";
}

/** Keeps a redirect on this site: only a single leading slash is allowed, never "//host" or a full URL. */
export function safeNext(next: string | null | undefined): string {
  return next && /^\/(?!\/)[^\s\\]*$/.test(next) ? next : "/account";
}

/** Plain-English text for the error codes Firebase returns. */
export function authErrorMessage(err: unknown): string {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: string }).code) : "";
  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request": return "The sign-in window was closed before it finished. Click the button and try again.";
    case "auth/popup-blocked": return "Your browser blocked the sign-in window. Allow pop-ups and try again.";
    case "auth/network-request-failed": return "Network problem. Check your connection and try again.";
    case "auth/too-many-requests": return "Too many attempts. Wait a few minutes and try again.";
    case "auth/operation-not-allowed": return "This sign-in method is not turned on yet. In the Firebase console open Authentication, Sign-in method, and enable it (for email links, tick \"Email link\" under Email/Password).";
    case "auth/invalid-action-code":
    case "auth/expired-action-code": return "This sign-in link has expired or was already used. Request a new one.";
    case "auth/email-already-in-use": return "An account with this email already exists. Sign in instead. If you used Google before, click Continue with Google.";
    // Firebase deliberately gives one answer for "no such account" and "wrong password", so the page cannot say which.
    // The message is true for both, and the sign-in page puts "Create an account" first.
    case "auth/invalid-credential": return "We could not sign you in. Either there is no account for this email yet, or the password is wrong.";
    case "auth/user-not-found": return "There is no account for this email yet. Create one to get started.";
    case "auth/wrong-password": return "That password is not correct. You can reset it below.";
    case "auth/provider-already-linked": return "This account already has a password. Use Change password instead.";
    case "auth/credential-already-in-use": return "That email already belongs to another account.";
    case "auth/weak-password": return "Choose a stronger password with at least 8 characters.";
    case "auth/invalid-email": return "Enter a valid email address.";
    case "auth/unauthorized-continue-uri":
    case "auth/unauthorized-domain": return "This website address is not allowed yet. Add it under Authentication, Settings, Authorized domains.";
    case "auth/requires-recent-login": return "For safety, please sign in again and then repeat this.";
    case "permission-denied": return "The database refused the request. Check that the Firestore rules are deployed.";
    default: return `Something went wrong${code ? ` (${code})` : ""}. Please try again, and tell us the code in brackets if it keeps happening.`;
  }
}
