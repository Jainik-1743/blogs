/**
 * Throwaway-inbox providers. Anyone can open these inboxes, so confirming the email proves nothing.
 * firestore.rules repeats this list (isDisposableEmail) and enforces it on the server: keep the two in step.
 */
export const DISPOSABLE_DOMAINS = [
  "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.nf", "jetable.fr.nf", "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr", "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf",
  "mailinator.com", "mailinator.net", "mailinator2.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.biz", "guerrillamail.de", "guerrillamailblock.com", "grr.la", "sharklasers.com", "pokemail.net", "spam4.me",
  "10minutemail.com", "10minutemail.net", "10minutemail.co.uk", "20minutemail.com", "tempmail.com", "temp-mail.org", "temp-mail.io", "tempmail.net", "tempmail.dev", "tempmailo.com", "tempail.com", "tempr.email", "tempinbox.com",
  "throwawaymail.com", "trashmail.com", "trashmail.net", "trashmail.de", "trash-mail.com", "trashmail.io", "trashmail.me", "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org", "wegwerfemail.de",
  "getnada.com", "nada.email", "maildrop.cc", "mailnesia.com", "mailcatch.com", "mailnull.com", "mailsac.com", "mytemp.email", "mohmal.com", "moakt.com", "moakt.cc", "tmpmail.org", "tmpmail.net",
  "dispostable.com", "fakeinbox.com", "fakemail.net", "fakemailgenerator.com", "emailondeck.com", "email-fake.com", "emailfake.com", "fake-mail.net", "mintemail.com", "mailtemp.net", "mail-temp.com",
  "spamgourmet.com", "spambox.us", "spamex.com", "spam.la", "spamfree24.org", "spamhereplease.com", "spamobox.com", "mailforspam.com", "incognitomail.com", "incognitomail.org",
  "discard.email", "discardmail.com", "discardmail.de", "burnermail.io", "anonbox.net", "anonymbox.com", "armyspy.com", "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu", "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com", "teleworm.us",
  "harakirimail.com", "inboxbear.com", "inboxkitten.com", "instant-mail.de", "kasmail.com", "luxusmail.org", "mailexpire.com", "mailme.lv", "mailmoat.com", "mailnator.com", "mailzilla.com", "meltmail.com", "mt2015.com",
  "mvrht.com", "nowmymail.com", "objectmail.com", "owlymail.com", "proxymail.eu", "rcpt.at", "safetymail.info", "selfdestructingmail.com", "sneakemail.com", "snkmail.com", "sogetthis.com", "spoofmail.de",
  "tafmail.com", "tempemail.net", "tempomail.fr", "temporaryemail.net", "tempsky.com", "thankyou2010.com", "trbvm.com", "tyldd.com", "veryrealemail.com", "vomoto.com", "wh4f.org", "yepmail.net", "zehnminuten.de", "zippymail.info",
  "emailtemporanea.com", "emailtemporanea.net", "crazymailing.com", "dropmail.me", "fexpost.com", "fexbox.org", "mailpoof.com", "guerrillamail.info", "linshiyouxiang.net", "byom.de", "33mail.com", "jnxjn.com", "mailbox.in.ua",
  "tmail.ws", "tmailor.com", "internxt.com", "emlhub.com", "emltmp.com", "mail.tm", "mailtothis.com", "1secmail.com", "1secmail.net", "1secmail.org", "esiix.com", "wwjmp.com", "xojxe.com", "yoggm.com", "vjuum.com", "laafd.com", "txcct.com",
] as const;

const disposable = new Set<string>(DISPOSABLE_DOMAINS);

/** True when the address uses a throwaway-inbox domain (or a subdomain of one). */
export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  const parts = domain.split(".");
  return parts.some((_, i) => disposable.has(parts.slice(i).join(".")));
}
