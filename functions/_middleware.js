const COOKIE_NAME = "ADMIN_SESSION_V2";

function base64urlEncode(value) {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(value) {
  value = value.replace(/-/g, "+").replace(/_/g, "/");

  while (value.length % 4) {
    value += "=";
  }

  const binary = atob(value);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));

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
    String.fromCharCode(...new Uint8Array(signature))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function verifySession(cookie, secret) {
  if (!cookie) {
    return false;
  }

  const parts = cookie.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [payload, signature] = parts;

  try {
    const expected = await createSignature(
      payload,
      secret
    );

    if (signature !== expected) {
      return false;
    }

    const session = JSON.parse(
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

function loginPage() {
  return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LichaTwist Admin Login</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f4f6f8;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }

    .box {
      background: white;
      padding: 30px;
      border-radius: 14px;
      width: min(90%, 380px);
      box-shadow: 0 4px 20px rgba(0,0,0,.12);
    }

    h1 {
      margin-top: 0;
    }

    input {
      width: 100%;
      padding: 13px;
      margin: 15px 0;
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 16px;
    }

    button {
      width: 100%;
      padding: 13px;
      border: 0;
      border-radius: 8px;
      background: #2563eb;
      color: white;
      font-size: 16px;
    }

    #message {
      margin-top: 15px;
      color: #dc2626;
    }
  </style>
</head>

<body>

  <div class="box">
    <h1>LichaTwist Admin</h1>
    <p>Owner login</p>

    <form id="loginForm">

      <input
        id="password"
        type="password"
        placeholder="Admin password"
        required
      >

      <button type="submit">
        Sign in
      </button>

      <div id="message"></div>

    </form>
  </div>

  <script>
    document
      .getElementById("loginForm")
      .addEventListener("submit", async function(e) {

        e.preventDefault();

        const password =
          document.getElementById("password").value;

        const message =
          document.getElementById("message");

        try {

          const response = await fetch(
            "/api/login",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                password: password
              })
            }
          );

          const data = await response.json();

          if (data.success) {
            window.location.href = "/admin.html";
          } else {
            message.textContent =
              "Invalid password.";
          }

        } catch {
          message.textContent =
            "Unable to connect to login service.";
        }

      });
  </script>

</body>
</html>
  `, {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=UTF-8"
    }
  });
}

export async function onRequest(context) {

  const url = new URL(context.request.url);

 // Protect the admin page.
if (url.pathname !== "/admin" && url.pathname !== "/admin.html") {
  return context.next();
}
  const secret = context.env.ADMIN_PASSWORD;

  if (!secret) {
    return new Response(
      "Server configuration error.",
      {
        status: 500
      }
    );
  }

  const cookies =
    context.request.headers.get("Cookie") || "";

  const match = cookies.match(
    new RegExp(`${COOKIE_NAME}=([^;]+)`)
  );

  const authenticated =
    await verifySession(
      match ? match[1] : null,
      secret
    );

  if (!authenticated) {
    return loginPage();
  }

  return context.next();
                      }
