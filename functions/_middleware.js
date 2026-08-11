const ADMIN_COOKIE_NAME = "ADMIN_SESSION_V2";
const CLIENT_COOKIE_NAME = "CLIENT_SESSION_V1";


function base64urlDecode(value) {

  value =
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  while (value.length % 4) {
    value += "=";
  }

  const binary =
    atob(value);

  const bytes =
    Uint8Array.from(
      binary,
      c => c.charCodeAt(0)
    );

  return new TextDecoder()
    .decode(bytes);
}


async function createSignature(
  data,
  secret
) {

  const key =
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );


  const signature =
    await crypto.subtle.sign(
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


function getCookie(
  request,
  name
) {

  const cookies =
    request.headers.get("Cookie") || "";


  const parts =
    cookies.split(";");


  for (
    const part of parts
  ) {

    const trimmed =
      part.trim();


    if (
      trimmed.startsWith(
        name + "="
      )
    ) {

      return trimmed.substring(
        name.length + 1
      );

    }

  }


  return null;
}


/* =========================================
   VERIFY ADMIN SESSION
========================================= */

async function verifyAdminSession(
  cookie,
  secret
) {

  if (!cookie) {
    return false;
  }


  const parts =
    cookie.split(".");


  if (parts.length !== 2) {
    return false;
  }


  const [
    payload,
    signature
  ] = parts;


  try {

    const expected =
      await createSignature(
        payload,
        secret
      );


    if (
      signature !== expected
    ) {
      return false;
    }


    const session =
      JSON.parse(
        base64urlDecode(payload)
      );


    /*
     * Existing Owner sessions created
     * by /api/login do not contain a
     * role field.
     *
     * Therefore:
     *
     * missing role = existing Owner session
     *
     * role = client = NOT an Owner session
     */

    if (
      session.role === "client"
    ) {
      return false;
    }


    return Boolean(
      session.exp &&
      Date.now() < session.exp
    );


  } catch {

    return false;

  }
}


/* =========================================
   VERIFY CLIENT SESSION
========================================= */

async function verifyClientSession(
  cookie,
  secret,
  db
) {

  if (!cookie) {
    return null;
  }


  const parts =
    cookie.split(".");


  if (parts.length !== 2) {
    return null;
  }


  const [
    payload,
    signature
  ] = parts;


  try {

    const expected =
      await createSignature(
        payload,
        secret
      );


    if (
      signature !== expected
    ) {
      return null;
    }


    const session =
      JSON.parse(
        base64urlDecode(payload)
      );


    /*
     * Must be an actual Client session.
     */

    if (
      session.role !== "client"
    ) {
      return null;
    }


    /*
     * Session must not be expired.
     */

    if (
      !session.exp ||
      Date.now() >= session.exp
    ) {
      return null;
    }


    /*
     * Client ID must exist.
     */

    const clientId =
      Number(session.sub);


    if (
      !Number.isInteger(clientId) ||
      clientId <= 0
    ) {
      return null;
    }


    /*
     * Check the current account.
     *
     * This also lets us invalidate
     * sessions after password changes.
     */

    const client =
      await db.prepare(`
        SELECT
          id,
          status,
          session_version
        FROM client_accounts
        WHERE id = ?
        LIMIT 1
      `)
        .bind(clientId)
        .first();


    if (!client) {
      return null;
    }


    /*
     * Inactive client accounts cannot
     * access the dashboard.
     */

    if (
      client.status !== "active"
    ) {
      return null;
    }


    /*
     * The session version in the
     * signed cookie must match D1.
     */

    const databaseVersion =
      Number(
        client.session_version || 1
      );


    const sessionVersion =
      Number(
        session.version || 0
      );


    if (
      sessionVersion !==
      databaseVersion
    ) {
      return null;
    }


    return session;


  } catch {

    return null;

  }
}


/* =========================================
   OWNER LOGIN PAGE
========================================= */

function loginPage() {

  return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >

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
      box-shadow:
        0 4px 20px
        rgba(0,0,0,.12);
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

    <h1>
      LichaTwist Admin
    </h1>

    <p>
      Owner login
    </p>

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

<a
  href="/admin-recovery.html"
  style="
    display:block;
    margin-top:14px;
    text-align:center;
    color:#2563eb;
    text-decoration:none;
    font-size:14px;
    font-weight:700;
  "
>
  Forgot Admin Password?
</a>

<div id="message"></div>
    </form>

  </div>

  <script>

    document
      .getElementById("loginForm")
      .addEventListener(
        "submit",
        async function(e) {

          e.preventDefault();

          const password =
            document
              .getElementById("password")
              .value;

          const message =
            document
              .getElementById("message");

          try {

            const response =
              await fetch(
                "/api/login",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json"
                  },

                  body:
                    JSON.stringify({
                      password:
                        password
                    })
                }
              );

            const data =
              await response.json();

            if (data.success) {

              window.location.href =
                "/admin.html";

            } else {

              message.textContent =
                "Invalid password.";

            }

          } catch {

            message.textContent =
              "Unable to connect to login service.";

          }

        }
      );

  </script>

</body>
</html>
  `, {

    status: 401,

    headers: {
      "Content-Type":
        "text/html; charset=UTF-8"
    }

  });

}


/* =========================================
   MIDDLEWARE
========================================= */

export async function onRequest(
  context
) {

  const url =
    new URL(
      context.request.url
    );


  const secret =
    context.env.ADMIN_PASSWORD;


  /*
   * If the server secret is missing,
   * preserve the existing behavior for
   * protected routes.
   */

  if (!secret) {

    if (
      url.pathname === "/admin" ||
      url.pathname === "/admin.html" ||
      url.pathname === "/client-dashboard" ||
      url.pathname === "/client-dashboard.html"
    ) {

      return new Response(
        "Server configuration error.",
        {
          status: 500
        }
      );

    }


    return context.next();

  }


  /* =====================================
     OWNER / ADMIN PAGE
  ===================================== */

  if (
    url.pathname === "/admin" ||
    url.pathname === "/admin.html"
  ) {

    const cookie =
      getCookie(
        context.request,
        ADMIN_COOKIE_NAME
      );


    const authenticated =
      await verifyAdminSession(
        cookie,
        secret
      );


    if (!authenticated) {

      return loginPage();

    }


    return context.next();

  }


  /* =====================================
     CLIENT DASHBOARD
  ===================================== */

  if (
    url.pathname === "/client-dashboard" ||
    url.pathname === "/client-dashboard.html"
  ) {

    const cookie =
      getCookie(
        context.request,
        CLIENT_COOKIE_NAME
      );


    const session =
      await verifyClientSession(
        cookie,
        secret,
        context.env.DB
      );


    if (!session) {

      return Response.redirect(
        new URL(
          "/client-login.html",
          context.request.url
        ),
        302
      );

    }


    return context.next();

  }


  /*
   * Everything else behaves exactly
   * as before.
   */

  return context.next();

}
