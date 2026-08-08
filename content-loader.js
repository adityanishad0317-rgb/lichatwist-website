async function loadWebsiteContent() {
  try {
    const response = await fetch("/api/public-content");

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (!data.success || !data.content) {
      return;
    }

    const content = data.content;

    document.querySelectorAll("[data-content]").forEach(element => {
      const field = element.getAttribute("data-content");

      if (content[field] !== undefined) {
        element.textContent = content[field];
      }
    });

  } catch (error) {
    console.log("Website content could not be loaded.");
  }
}

loadWebsiteContent();
