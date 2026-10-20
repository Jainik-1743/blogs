/**
 * The one account allowed to use the admin pages. This is only the "show the page" check in the
 * browser; the real lock is firestore.rules (function isAdmin), which repeats this address and
 * refuses every admin write from anyone else. Change it in both places together.
 */
export const ADMIN_EMAIL = "jainikpatel1743@gmail.com";

/**
 * True only for the owner's address, and only for a signed-in reader (AuthProvider counts a reader as signed in only
 * once their email is confirmed, directly or through Google). The database rules repeat this check.
 */
export function isAdminUser(user: { email?: string | null } | null | undefined): boolean {
  return Boolean(user?.email && user.email.trim().toLowerCase() === ADMIN_EMAIL);
}
