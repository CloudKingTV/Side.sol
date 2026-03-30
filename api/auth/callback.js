export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect(302, "/?auth_error=missing_code");
  }

  // Read PKCE verifier from cookie
  const raw = req.cookies?.x_oauth || decodeURIComponent(
    (req.headers.cookie || "")
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("x_oauth="))
      ?.slice(8) || ""
  );

  let codeVerifier, savedState;
  try {
    const parsed = JSON.parse(raw);
    codeVerifier = parsed.codeVerifier;
    savedState = parsed.state;
  } catch {
    return res.redirect(302, "/?auth_error=invalid_session");
  }

  if (state !== savedState) {
    return res.redirect(302, "/?auth_error=state_mismatch");
  }

  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirectUri = `${proto}://${host}/api/auth/callback`;

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Token exchange failed:", err);
      return res.redirect(302, "/?auth_error=token_failed");
    }

    const { access_token } = await tokenRes.json();

    // Fetch user profile
    const userRes = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!userRes.ok) {
      console.error("User fetch failed:", await userRes.text());
      return res.redirect(302, "/?auth_error=profile_failed");
    }

    const { data: profile } = await userRes.json();

    // Get full-size profile image (replace _normal with _400x400)
    const pfp = (profile.profile_image_url || "").replace(
      "_normal",
      "_400x400"
    );

    // Clear the OAuth cookie
    res.setHeader(
      "Set-Cookie",
      "x_oauth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    );

    // Redirect back to app with user data in hash
    const userData = encodeURIComponent(
      JSON.stringify({
        name: profile.name,
        handle: `@${profile.username}`,
        pfp,
        method: "x",
      })
    );

    res.redirect(302, `/?x_auth=${userData}`);
  } catch (err) {
    console.error("OAuth error:", err);
    res.redirect(302, "/?auth_error=server_error");
  }
}
