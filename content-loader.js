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

    const content = 
const phone = content.phone || "";
const email = content.email || "";
const address = content.address || "";
const whatsapp = content.whatsapp || "";
    /*
     * Update elements that have:
     *
     * data-content="phone"
     * data-content="email"
     * data-content="address"
     */
    document.querySelectorAll("[data-content]").forEach(element => {

      const field =
        element.getAttribute("data-content");

      if (field === "phone") {
        element.textContent = phone;
      }

      if (field === "email") {
        element.textContent = email;
      }

      if (field === "address") {
        element.textContent = address;
      }

    });


    /*
     * Update every phone link.
     *
     * Example:
     * href="tel:+91902677932"
     *
     * will become:
     * href="tel:NEW_NUMBER"
     */
    if (phone) {

      document.querySelectorAll('a[href^="tel:"]').forEach(link => {

        link.href = "tel:" + phone.replace(/[^\d+]/g, "");

      });

    }


    /*
     * Update every email link.
     *
     * Example:
     * href="mailto:old@email.com"
     *
     * will become:
     * href="mailto:NEW_EMAIL"
     */
    if (email) {

      document.querySelectorAll('a[href^="mailto:"]').forEach(link => {

        link.href = "mailto:" + email.trim();

      });

    }

/*
 * Update every WhatsApp link.
 *
 * Example:
 * href="https://wa.me/919026777932"
 *
 * will become:
 * href="https://wa.me/NEW_NUMBER"
 */
if (whatsapp) {

  const whatsappNumber =
    whatsapp.replace(/[^\d]/g, "");

  if (whatsappNumber) {

    document
      .querySelectorAll('a[href*="wa.me/"]')
      .forEach(link => {

        link.href =
          "https://wa.me/" + whatsappNumber;

      });

  }

}
    /*
     * Also update elements specifically marked
     * for the floating phone button.
     *
     * We will use:
     *
     * data-phone-button
     */
    if (phone) {

      document
        .querySelectorAll("[data-phone-button]")
        .forEach(button => {

          button.href =
            "tel:" + phone.replace(/[^\d+]/g, "");

        });

    }


    /*
     * Update elements specifically marked
     * for email buttons.
     */
    if (email) {

      document
        .querySelectorAll("[data-email-button]")
        .forEach(button => {

          button.href =
            "mailto:" + email.trim();

        });

    }
/* =========================
   HERO CONTENT
========================= */

if (content.hero_title) {

    const heroTitle =
        document.getElementById("heroTitle");

    if (heroTitle) {
        heroTitle.textContent =
            content.hero_title;
    }

}


if (content.hero_subtitle) {

    const heroSubtitle =
        document.getElementById("heroSubtitle");

    if (heroSubtitle) {
        heroSubtitle.textContent =
            content.hero_subtitle;
    }

}


if (content.hero_description) {

    const heroDescription =
        document.getElementById("heroDescription");

    if (heroDescription) {
        heroDescription.textContent =
            content.hero_description;
    }

}

/* =========================
   ABOUT + PRINCIPLES
========================= */

if (content.about_heading) {
    const el = document.getElementById("aboutHeading");
    if (el) el.textContent = content.about_heading;
}

if (content.about_description) {
    const el = document.getElementById("aboutDescription");
    if (el) el.textContent = content.about_description;
}

if (content.mission) {
    const el = document.getElementById("missionText");
    if (el) el.textContent = content.mission;
}

if (content.vision) {
    const el = document.getElementById("visionText");
    if (el) el.textContent = content.vision;
}

if (content.values_text) {
    const el = document.getElementById("valuesText");
    if (el) el.textContent = content.values_text;
}

/* =========================
   SERVICES
========================= */

if (content.agriculture_title) {
    const el = document.getElementById("agricultureTitle");
    if (el) el.textContent = content.agriculture_title;
}

if (content.agriculture_description) {
    const el = document.getElementById("agricultureDescription");
    if (el) el.textContent = content.agriculture_description;
}

if (content.construction_title) {
    const el = document.getElementById("constructionTitle");
    if (el) el.textContent = content.construction_title;
}

if (content.construction_description) {
    const el = document.getElementById("constructionDescription");
    if (el) el.textContent = content.construction_description;
}

if (content.transport_title) {
    const el = document.getElementById("transportTitle");
    if (el) el.textContent = content.transport_title;
}

if (content.transport_description) {
    const el = document.getElementById("transportDescription");
    if (el) el.textContent = content.transport_description;
}
    /* =========================
   COMPANIES
========================= */

if (content.agro_company_name) {
    const el = document.getElementById("agroCompanyName");
    if (el) el.textContent = content.agro_company_name;
}

if (content.agro_company_description) {
    const el = document.getElementById("agroCompanyDescription");
    if (el) el.textContent = content.agro_company_description;
}

if (content.construction_company_name) {
    const el = document.getElementById("constructionCompanyName");
    if (el) el.textContent = content.construction_company_name;
}

if (content.construction_company_description) {
    const el = document.getElementById("constructionCompanyDescription");
    if (el) el.textContent = content.construction_company_description;
}

if (content.transport_company_name) {
    const el = document.getElementById("transportCompanyName");
    if (el) el.textContent = content.transport_company_name;
}

if (content.transport_company_description) {
    const el = document.getElementById("transportCompanyDescription");
    if (el) el.textContent = content.transport_company_description;
}
    /* =========================
   PROJECTS
========================= */

if (content.projects_heading) {
    const el = document.getElementById("projectsHeading");
    if (el) el.textContent = content.projects_heading;
}

if (content.projects_description) {
    const el = document.getElementById("projectsDescription");
    if (el) el.textContent = content.projects_description;
}
  } catch (error) {

    console.log(
      "Website content could not be loaded."
    );

  }
}


loadWebsiteContent();
