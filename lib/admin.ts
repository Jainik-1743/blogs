/**
 * The one account allowed to use the admin pages. This is only the "show the page" check in the
 * browser; the real lock is firestore.rules (function isAdmin), which repeats this address and
 * refuses every admin write from anyone else. Change it in both places together.
 */
export const ADMIN_EMAIL = "jainikpatel1743@gmail.com";

/** True only for the owner's account with a verified email (Google sign-in verifies it automatically). */
export function isAdminUser(user: { email?: string | null; emailVerified?: boolean } | null | undefined): boolean {
  return Boolean(user?.emailVerified && user.email && user.email.trim().toLowerCase() === ADMIN_EMAIL);
}
