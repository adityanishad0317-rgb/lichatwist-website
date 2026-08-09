const COOKIE_NAME = "ADMIN_SESSION";

function base64urlEncode(value) {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
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

  return btoa(
    String.fromCharCode(...new Uint8Array(signature))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const password = body.password;

    const secret = context.env.ADMIN_PASSWORD;

    if (!secret) {
      return Response.json(
        {
          success: false,
          message: "Server configuration error."
        },
        { status: 500 }
      );
    }

    if (!password || password !== secret) {
      return Response.json(
        {
          success: false,
          message: "Invalid password."
        },
        { status: 401 }
      );
    }

    const session = {
      exp: Date.now() + 6 * 60 * 60 * 1000
    };

    const payload = base64urlEncode(
      JSON.stringify(session)
    );

    const signature = await createSignature(
      payload,
      secret
    );

    const cookie = `${COOKIE_NAME}=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=21600`;

    return Response.json(
      {
        success: true,
        message: "Login successful."
      },
      {
        headers: {
          "Set-Cookie": cookie
        }
      }
    );
  } catch {
    return Response.json(
      {
        success: false,
        message: "Invalid request."
      },
      { status: 400 }
    );
  }
      }
