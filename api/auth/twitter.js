import crypto from "crypto";

export default function handler(req, res) {
  const clientId = process.env.TWITTER_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: "TWITTER_CLIENT_ID not configured" });
  }

  // PKCE
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const state = crypto.randomBytes(16).toString("hex");

  // Determine callback URL from request
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `${proto}://${host}/api/auth/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "tweet.read users.read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  // Store verifier + state in a cookie (httpOnly, short-lived)
  const cookieVal = JSON.stringify({ codeVerifier, state });
  res.setHeader(
    "Set-Cookie",
    `x_oauth=${encodeURIComponent(cookieVal)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );

  res.redirect(302, `https://twitter.com/i/oauth2/authorize?${params}`);
}
