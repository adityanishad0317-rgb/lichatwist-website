function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function getCookie(request, name) {
  const cookies = request.headers.get("Cookie") || "";

  const match = cookies.match(
    new RegExp(`${name}=([^;]+)`)
  );

  return match ? match[1] : null;
}

function base64urlDecode(value) {
  value = value.replace(/-/g, "+").replace(/_/g, "/");

  while (value.length % 4) {
    value += "=";
  }

  const binary = atob(value);

  const bytes = Uint8Array.from(
    binary,
    c => c.charCodeAt(0)
  );

  return new TextDecoder().decode(bytes);
}

async function createSignature(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );

  return btoa(
    String.fromCharCode(
      ...new Uint8Array(signature)
    )
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function isAuthenticated(request, secret) {
  const cookie = getCookie(
    request,
    "ADMIN_SESSION"
  );

  if (!cookie) return false;

  const parts = cookie.split(".");

  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  try {
    const expected =
      await createSignature(
        payload,
        secret
      );

    if (signature !== expected) {
      return false;
    }

    const session =
      JSON.parse(
        base64urlDecode(payload)
      );

    return (
      session.exp &&
      Date.now() < session.exp
    );

  } catch {
    return false;
  }
}

export async function onRequestGet(context) {

  const secret =
    context.env.ADMIN_PASSWORD;

  if (!secret) {
    return json(
      {
        success: false,
        message: "Server configuration error."
      },
      500
    );
  }

  const authenticated =
    await isAuthenticated(
      context.request,
      secret
    );

  if (!authenticated) {
    return json(
      {
        success: false,
        message: "Unauthorized."
      },
      401
    );
  }

  const result =
    await context.env.DB.prepare(
      "SELECT * FROM site_content WHERE id = 1"
    ).first();

  return json({
    success: true,
    content: result || null
  });
}

export async function onRequestPost(context) {

  const secret =
    context.env.ADMIN_PASSWORD;

  if (!secret) {
    return json(
      {
        success: false,
        message: "Server configuration error."
      },
      500
    );
  }

  const authenticated =
    await isAuthenticated(
      context.request,
      secret
    );

  if (!authenticated) {
    return json(
      {
        success: false,
        message: "Unauthorized."
      },
      401
    );
  }

  try {

    const body =
      await context.request.json();

    await context.env.DB.prepare(`
      UPDATE site_content
      SET
        business_name = ?,
        phone = ?,
        email = ?,
        address = ?,
        about = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `)
      .bind(
        String(body.businessName || ""),
        String(body.phone || ""),
        String(body.email || ""),
        String(body.address || ""),
        String(body.about || "")
      )
      .run();

    return json({
      success: true,
      message: "Content saved successfully."
    });

  } catch (error) {

    return json(
      {
        success: false,
        message: "Unable to save content."
      },
      500
    );
  }
}
