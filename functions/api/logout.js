const COOKIE_NAME = "ADMIN_SESSION";

export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Logged out successfully."
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
      }
    }
  );
}
