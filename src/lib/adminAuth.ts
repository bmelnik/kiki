import { createHmac, timingSafeEqual } from "crypto";

function toBase64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/** Create a signed session token (Node.js only – not for Edge/middleware) */
export function createSessionToken(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const payload = toBase64url(Buffer.from(JSON.stringify({ ts: Date.now() })));
  const sig = toBase64url(
    createHmac("sha256", secret).update(payload).digest()
  );
  return `${payload}.${sig}`;
}

/** Verify a signed session token (Node.js only – not for Edge/middleware) */
export function verifySessionToken(token: string): boolean {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return false;
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payload, sig] = parts;
    const expected = toBase64url(
      createHmac("sha256", secret).update(payload).digest()
    );
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Extract and verify the token from a Request's cookie header */
export function getVerifiedToken(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/);
  if (!match) return null;
  const token = decodeURIComponent(match[1]);
  return verifySessionToken(token) ? token : null;
}
