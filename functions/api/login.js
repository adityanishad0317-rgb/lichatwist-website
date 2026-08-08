export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Login endpoint is working."
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

export async function onRequestPost(context) {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Login endpoint is working."
    }),
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
