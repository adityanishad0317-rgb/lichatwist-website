const CLIENT_COOKIE_NAME = "CLIENT_SESSION_V1";


function json(
  data,
  status = 200
) {

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        "Content-Type":
          "application/json",

        "Cache-Control":
          "no-store"
      }
    }
  );

}


function getCookie(
  request,
  name
) {

  const cookies =
    request.headers.get(
      "Cookie"
    ) || "";


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


function base64urlDecode(
  value
) {

  value =
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/");


  while (
    value.length % 4
  ) {

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
      new TextEncoder()
        .encode(secret),

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
      new TextEncoder()
        .encode(data)
    );


  return btoa(
    String.fromCharCode(
      ...new Uint8Array(
        signature
      )
    )
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

}


async function verifyClientSession(
  request,
  secret,
  db
) {

  const cookie =
    getCookie(
      request,
      CLIENT_COOKIE_NAME
    );


  if (!cookie) {

    return null;

  }


  const parts =
    cookie.split(".");


  if (
    parts.length !== 2
  ) {

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
        base64urlDecode(
          payload
        )
      );


    if (
      session.role !==
      "client"
    ) {

      return null;

    }


    if (
      !session.exp ||
      Date.now() >= session.exp
    ) {

      return null;

    }


    const clientId =
      Number(
        session.sub
      );


    if (
      !Number.isInteger(
        clientId
      ) ||
      clientId <= 0
    ) {

      return null;

    }


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
        .bind(
          clientId
        )
        .first();


    if (!client) {

      return null;

    }


    if (
      client.status !==
      "active"
    ) {

      return null;

    }


    const databaseVersion =
      Number(
        client.session_version ||
        1
      );


    const sessionVersion =
      Number(
        session.version ||
        0
      );


    if (
      sessionVersion !==
      databaseVersion
    ) {

      return null;

    }


    return {
      id: clientId,
      session: session
    };

  } catch {

    return null;

  }

}


/* =========================================
   GET CURRENT WEBSITE CONTENT
========================================= */

async function getWebsiteContent(
  db
) {

  const row =
  await db.prepare(`
    SELECT *
    FROM site_content
    WHERE id = 1
    LIMIT 1
  `)
    .first();

  if (!row) {

    return {};

  }


return row || {};
}


/* =========================================
   MAIN REQUEST
========================================= */

export async function onRequest(
  context
) {

  try {

    const secret =
      context.env.ADMIN_PASSWORD;


    if (!secret) {

      return json(
        {
          success: false,
          message:
            "Server configuration error."
        },

        500
      );

    }


    const authenticated =
      await verifyClientSession(
        context.request,
        secret,
        context.env.DB
      );


    if (!authenticated) {

      return json(
        {
          success: false,
          message:
            "Unauthorized."
        },

        401
      );

    }


    /*
     * -------------------------------------
     * GET
     * -------------------------------------
     */

    if (
      context.request.method ===
      "GET"
    ) {

      const content =
        await getWebsiteContent(
          context.env.DB
        );


      return json({

        success: true,

        content: content

      });

    }


    /*
     * -------------------------------------
     * POST
     * -------------------------------------
     */

    if (
      context.request.method ===
      "POST"
    ) {

      const body =
        await context.request.json();


      if (
        !body ||
        typeof body.content !==
        "object"
      ) {

        return json(
          {
            success: false,
            message:
              "Invalid content data."
          },

          400
        );

      }


      /*
       * IMPORTANT:
       *
       * At this stage we only test
       * authenticated client access.
       *
       * We do NOT write to the
       * database yet.
       *
       * The permission-filtering
       * layer will be added before
       * client saving is enabled.
       */

      return json({

        success: true,

        message:
          "Client content received successfully.",

        clientId:
          authenticated.id

      });

    }


    return json(
      {
        success: false,
        message:
          "Method not allowed."
      },

      405
    );


  } catch (error) {

    return json(
      {
        success: false,
        message:
          "Unable to process client content request."
      },

      500
    );

  }

}
