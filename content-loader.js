async function loadWebsiteContent() {

  try {

    const response = await fetch(
      "/api/public-content",
      {
        method: "GET",
        cache: "no-store"
      }
    );

    if (!response.ok) {
      console.log("Public content request failed.");
      return;
    }

    const data = await response.json();

    if (!data.success || !data.content) {
      console.log("No public content received.");
      return;
    }

    const content = data.content;

    /*
     * =========================
     * CONTACT INFORMATION
     * =========================
     */

    const phone = content.phone || "";
    const email = content.email || "";
    const address = content.address || "";
    const whatsapp = content.whatsapp || "";
    
    const businessName =
     content.business_name || "";


    /*
     * =========================
     * PHONE / EMAIL / ADDRESS
     * =========================
     */

    document
      .querySelectorAll("[data-content]")
      .forEach(element => {

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
        if (field === "business_name") {
  element.innerHTML =
    businessName + "<sup>®</sup>";
        }

      });


    /*
     * =========================
     * PHONE LINKS
     * =========================
     */

    if (phone) {

      const cleanPhone =
        phone.replace(/[^\d+]/g, "");

      document
        .querySelectorAll('a[href^="tel:"]')
        .forEach(link => {

          link.href =
            "tel:" + cleanPhone;

        });

    }
    if (phone) {

  const cleanPhone =
    phone.replace(/[^\d+]/g, "");

  document
    .querySelectorAll("[data-phone-footer]")
    .forEach(link => {

      link.href =
        "tel:" + cleanPhone;

    });

}


    /*
     * =========================
     * EMAIL LINKS
     * =========================
     */

    if (email) {

      document
        .querySelectorAll('a[href^="mailto:"]')
        .forEach(link => {

          link.href =
            "mailto:" + email.trim();

        });

    }


    /*
     * =========================
     * WHATSAPP LINKS
     * =========================
     */

    if (whatsapp) {

      const whatsappNumber =
        whatsapp.replace(/\D/g, "");

      document
        .querySelectorAll('a[href*="wa.me/"]')
        .forEach(link => {

          link.href =
            "https://wa.me/" +
            whatsappNumber;

        });

    }


    /*
     * =========================
     * FLOATING PHONE BUTTON
     * =========================
     */

    if (phone) {

      const cleanPhone =
        phone.replace(/[^\d+]/g, "");

      document
        .querySelectorAll("[data-phone-button]")
        .forEach(button => {

          button.href =
            "tel:" + cleanPhone;

        });

    }


    /*
     * =========================
     * EMAIL BUTTONS
     * =========================
     */

    if (email) {

      document
        .querySelectorAll("[data-email-button]")
        .forEach(button => {

          button.href =
            "mailto:" + email.trim();

        });

    }


    /*
     * =========================
     * HERO
     * =========================
     */

    if (content.hero_title) {

      const el =
        document.getElementById("heroTitle");

      if (el) {
        el.textContent =
          content.hero_title;
      }

    }


    if (content.hero_subtitle) {

      const el =
        document.getElementById("heroSubtitle");

      if (el) {
        el.textContent =
          content.hero_subtitle;
      }

    }


    if (content.hero_description) {

      const el =
        document.getElementById("heroDescription");

      if (el) {
        el.textContent =
          content.hero_description;
      }

    }


    /*
     * =========================
     * ABOUT
     * =========================
     */

    if (content.about_heading) {

      const el =
        document.getElementById("aboutHeading");

      if (el) {
        el.textContent =
          content.about_heading;
      }

    }


    if (content.about_description) {

      const el =
        document.getElementById("aboutDescription");

      if (el) {
        el.textContent =
          content.about_description;
      }

    }


    /*
     * =========================
     * MISSION
     * =========================
     */

    if (content.mission) {

      const el =
        document.getElementById("missionText");

      if (el) {
        el.textContent =
          content.mission;
      }

    }


    /*
     * =========================
     * VISION
     * =========================
     */

    if (content.vision) {

      const el =
        document.getElementById("visionText");

      if (el) {
        el.textContent =
          content.vision;
      }

    }


    /*
     * =========================
     * VALUES
     * =========================
     */

    if (content.values_text) {

      const el =
        document.getElementById("valuesText");

      if (el) {
        el.textContent =
          content.values_text;
      }

    }


    /*
     * =========================
     * SERVICES
     * =========================
     */

    if (content.agriculture_title) {

      const el =
        document.getElementById("agricultureTitle");

      if (el) {
        el.textContent =
          content.agriculture_title;
      }

    }


    if (content.agriculture_description) {

      const el =
        document.getElementById("agricultureDescription");

      if (el) {
        el.textContent =
          content.agriculture_description;
      }

    }


    if (content.construction_title) {

      const el =
        document.getElementById("constructionTitle");

      if (el) {
        el.textContent =
          content.construction_title;
      }

    }


    if (content.construction_description) {

      const el =
        document.getElementById("constructionDescription");

      if (el) {
        el.textContent =
          content.construction_description;
      }

    }


    if (content.transport_title) {

      const el =
        document.getElementById("transportTitle");

      if (el) {
        el.textContent =
          content.transport_title;
      }

    }


    if (content.transport_description) {

      const el =
        document.getElementById("transportDescription");

      if (el) {
        el.textContent =
          content.transport_description;
      }

    }


    /*
     * =========================
     * COMPANIES
     * =========================
     */

    if (content.agro_company_name) {

      const el =
        document.getElementById("agroCompanyName");

      if (el) {
        el.textContent =
          content.agro_company_name;
      }

    }


    if (content.agro_company_description) {

      const el =
        document.getElementById("agroCompanyDescription");

      if (el) {
        el.textContent =
          content.agro_company_description;
      }

    }


    if (content.construction_company_name) {

      const el =
        document.getElementById("constructionCompanyName");

      if (el) {
        el.textContent =
          content.construction_company_name;
      }

    }


    if (content.construction_company_description) {

      const el =
        document.getElementById(
          "constructionCompanyDescription"
        );

      if (el) {
        el.textContent =
          content.construction_company_description;
      }

    }


    if (content.transport_company_name) {

      const el =
        document.getElementById("transportCompanyName");

      if (el) {
        el.textContent =
          content.transport_company_name;
      }

    }


    if (content.transport_company_description) {

      const el =
        document.getElementById(
          "transportCompanyDescription"
        );

      if (el) {
        el.textContent =
          content.transport_company_description;
      }

    }


   /*
 * =========================
 * PROJECTS
 * =========================
 */

if (content.projects_heading) {

  const el =
    document.getElementById("projectsHeading");

  if (el) {
    el.textContent =
      content.projects_heading;
  }

}


if (content.projects_description) {

  const el =
    document.getElementById("projectsDescription");

  if (el) {
    el.textContent =
      content.projects_description;
  }

}


/* PROJECT 1 */

if (content.project1_category) {

  const el =
    document.getElementById("project1Category");

  if (el) {
    el.textContent =
      content.project1_category;
  }

}


if (content.project1_title) {

  const el =
    document.getElementById("project1Title");

  if (el) {
    el.textContent =
      content.project1_title;
  }

}


if (content.project1_description) {

  const el =
    document.getElementById("project1Description");

  if (el) {
    el.textContent =
      content.project1_description;
  }

}


/* PROJECT 2 */

if (content.project2_category) {

  const el =
    document.getElementById("project2Category");

  if (el) {
    el.textContent =
      content.project2_category;
  }

}


if (content.project2_title) {

  const el =
    document.getElementById("project2Title");

  if (el) {
    el.textContent =
      content.project2_title;
  }

}


if (content.project2_description) {

  const el =
    document.getElementById("project2Description");

  if (el) {
    el.textContent =
      content.project2_description;
  }

}


/* PROJECT 3 */

if (content.project3_category) {

  const el =
    document.getElementById("project3Category");

  if (el) {
    el.textContent =
      content.project3_category;
  }

}


if (content.project3_title) {

  const el =
    document.getElementById("project3Title");

  if (el) {
    el.textContent =
      content.project3_title;
  }

}


if (content.project3_description) {

  const el =
    document.getElementById("project3Description");

  if (el) {
    el.textContent =
      content.project3_description;
  }

}

    console.log(
      "LichaTwist website content loaded successfully."
    );

  } catch (error) {

    console.log(
      "Website content could not be loaded.",
      error
    );

  }

}


loadWebsiteContent();
