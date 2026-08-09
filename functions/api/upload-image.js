const ALLOWED_FILES = {
  hero: "hero.jpg",
  about: "office.jpg",
  agriculture: "agriculture.jpg",
  construction: "construction.jpg",
  transport: "transport.jpg"
};

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, i + chunkSize)
    );
  }

  return btoa(binary);
}

export async function onRequestPost(context) {
  try {
    /*
     * Make sure the admin is logged in.
     */
    const cookie =
      context.request.headers.get("Cookie") || "";

    if (!cookie.includes("ADMIN_SESSION")) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized."
        },
        { status: 401 }
      );
    }

    /*
     * Required Cloudflare secrets.
     */
    const githubToken =
      context.env.GITHUB_TOKEN;

    const githubOwner =
      context.env.GITHUB_OWNER;

    const githubRepo =
      context.env.GITHUB_REPO;

    if (
      !githubToken ||
      !githubOwner ||
      !githubRepo
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Image upload is not configured yet."
        },
        { status: 500 }
      );
    }

    const formData =
      await context.request.formData();

    const image =
      formData.get("image");

    const imageType =
      String(
        formData.get("imageType") || ""
      );

    if (
      !(image instanceof File)
    ) {
      return Response.json(
        {
          success: false,
          message: "No image was selected."
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILES[imageType]) {
      return Response.json(
        {
          success: false,
          message: "Invalid image type."
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES[image.type]) {
      return Response.json(
        {
          success: false,
          message:
            "Only JPG, PNG and WebP images are allowed."
        },
        { status: 400 }
      );
    }

    if (image.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          success: false,
          message:
            "Image must be smaller than 5 MB."
        },
        { status: 400 }
      );
    }

    const fileName =
      ALLOWED_FILES[imageType];

    const path =
      `images/${fileName}`;

    const buffer =
     
