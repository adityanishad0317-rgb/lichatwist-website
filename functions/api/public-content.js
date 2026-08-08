export async function onRequestGet(context) {
  try {
    const result = await context.env.DB.prepare(
      "SELECT business_name, phone, email, address, about FROM site_content WHERE id = 1"
    ).first();

    return new Response(
      JSON.stringify({
        success: true,
        content: result || {}
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Unable to load website content."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
