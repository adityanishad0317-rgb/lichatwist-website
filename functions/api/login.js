const COOKIE_NAME = "ADMIN_SESSION";
const SESSION_SECONDS = 60 * 60 * 8; // 8 hours

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    }
  });
}

function base64urlEncode(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(value) {
  value = value.replace(/-/g, "+").replace(/_/g, "/");
  while (value.length % 4) value += "=";

  const binary = atob(value);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function createSignature(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );

  return base64urlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );
}

async function verifySession(cookie, secret) {
  if (!cookie) return false;

  const parts = cookie.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  try {
    const expected = await createSignature(payload, secret);

    if (signature !== expected) return false;

    const session = JSON.parse(base64urlDecode(payload));

    if (!session.exp || Date.now() > session.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function onRequestGet(context) {
  const secret = context.env.ADMIN_PASSWORD;

  if (!secret) {
    return json(
      { success: false, message: "Server configuration error." },
      500
    );
  }

  const cookieHeader = context.request.headers.get("Cookie") || "";

  const match = cookieHeader.match(
    new RegExp(`${COOKIE_NAME}=([^;]+)`)
  );

  const authenticated = await verifySession(
    match ? match[1] : null,
    secret
  );

  return json({
    success: true,
    authenticated
  });
}

export async function onRequestPost(context) {
  const secret = context.env.ADMIN_PASSWORD;

  if (!secret) {
    return json(
      { success: false, message: "Server configuration error." },
      500
    );
  }

  try {
    const body = await context.request.json();
    const password = String(body.password || "");

    if (!password || password !== secret) {
      return json(
        {
          success: false,
          message: "Invalid password."
        },
        401
      );
    }

    const payload = base64urlEncode(
      JSON.stringify({
        exp: Date.now() + SESSION_SECONDS * 1000
      })
    );

    const signature = await createSignature(payload, secret);
    const session = `${payload}.${signature}`;

    return json(
      {
        success: true,
        message: "Login successful."
      },
      200,
      {
        "Set-Cookie":
          `${COOKIE_NAME}=${session}; ` +
          `Max-Age=${SESSION_SECONDS}; ` +
          `Path=/; ` +
          `HttpOnly; ` +
          `Secure; ` +
          `SameSite=Strict`
      }
    );
  } catch {
    return json(
      {
        success: false,
        message: "Invalid request."
      },
      400
    );
  }
}
