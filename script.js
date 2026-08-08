document.addEventListener("DOMContentLoaded", () => {

    // Mobile menu
const toggle = document.querySelector(".mobile-menu-button");
const menu = document.querySelector(".mobile-nav");
    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            menu.classList.toggle("open");

            const icon = toggle.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-bars");
                icon.classList.toggle("fa-times");
            }
        });

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("open");

                const icon = toggle.querySelector("i");
                if (icon) {
                    icon.classList.remove("fa-times");
                    icon.classList.add("fa-bars");
                }
            });
        });
    }

    // Animated counters
    const counters = document.querySelectorAll(".counter");
    let started = false;

    function runCounters() {
        if (started) return;

        const stats = document.querySelector(".stats");
        if (!stats) return;

        if (stats.getBoundingClientRect().top < window.innerHeight - 100) {

            started = true;

            counters.forEach(counter => {

                const target = Number(counter.dataset.target);
                let value = 0;

                const step = Math.max(1, Math.ceil(target / 80));

                const timer = setInterval(() => {

                    value += step;

                    if (value >= target) {
                        value = target;
                        clearInterval(timer);
                    }

                    counter.textContent = value;

                }, 20);

            });

        }
    }

    window.addEventListener("scroll", runCounters);
    runCounters();

    // Active menu
    const sections = document.querySelectorAll("section[id]");
    const links = document.querySelectorAll(".desktop-nav a, .mobile-nav a");

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.id;
            }
        });

        links.forEach(link => {

            link.style.color = "";

            if (link.getAttribute("href") === "#" + current) {
                link.style.color = "#6ea8fe";
            }

        });

    });

    // Scroll to top
    const topBtn = document.createElement("button");

    topBtn.innerHTML = "↑";

    Object.assign(topBtn.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        border: "none",
        background: "#0b5ed7",
        color: "#fff",
        fontSize: "22px",
        cursor: "pointer",
        display: "none",
        zIndex: "9999"
    });

    document.body.appendChild(topBtn);

    window.addEventListener("scroll", () => {
        topBtn.style.display = window.scrollY > 500 ? "block" : "none";
    });

    topBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

});

// Preloader
window.onload = function () {
    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.style.display = "none";
    }
};
/* ==========================
   IMAGE LIGHTBOX
========================== */

const galleryImages=document.querySelectorAll(".gallery-grid img");

const lightbox=document.getElementById("lightbox");

const lightboxImg=document.getElementById("lightbox-img");

const closeLightbox=document.getElementById("close-lightbox");

galleryImages.forEach(img=>{

img.addEventListener("click",()=>{

lightbox.style.display="flex";

lightboxImg.src=img.src;

});

});

closeLightbox.onclick=function(){

lightbox.style.display="none";

};

lightbox.onclick=function(e){

if(e.target===lightbox){

lightbox.style.display="none";

}

};
/* ==========================
   AUTO TESTIMONIAL SLIDER
========================== */

const testimonials=document.querySelectorAll(".testimonial-card");

let testimonialIndex=0;

if(testimonials.length>0){

testimonials.forEach((card,index)=>{

if(index!==0){
card.style.display="none";
}

});

setInterval(()=>{

testimonials[testimonialIndex].style.display="none";

testimonialIndex++;

if(testimonialIndex>=testimonials.length){
testimonialIndex=0;
}

testimonials[testimonialIndex].style.display="block";

},4000);

}
/* ==========================================
   EMAIL BUTTON
   ANDROID → GMAIL APP
   IOS → EMAIL APP
   DESKTOP → GMAIL WEBSITE
========================================== */

const emailContactCard =
    document.getElementById("emailContactCard");

if (emailContactCard) {

    emailContactCard.addEventListener("click", function (event) {

        event.preventDefault();

        const email = "lichatwist@gmail.com";

        const subject = encodeURIComponent(
            "LichaTwist Website Enquiry"
        );

        const body = encodeURIComponent(
            "Hello LichaTwist,\n\nI would like to contact you."
        );


        /* ANDROID */

        if (/Android/i.test(navigator.userAgent)) {

            const gmailApp =
                "intent://co?to=" +
                email +
                "&subject=" +
                subject +
                "&body=" +
                body +
                "#Intent;" +
                "scheme=googlegmail;" +
                "package=com.google.android.gm;" +
                "end";

            window.location.href = gmailApp;

            return;
        }


        /* IPHONE / IPAD */

        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {

            window.location.href =
                "mailto:" +
                email +
                "?subject=" +
                subject +
                "&body=" +
                body;

            return;
        }


        /* DESKTOP */

        window.open(
            "https://mail.google.com/mail/?view=cm&fs=1&to=" +
            email +
            "&su=" +
            subject +
            "&body=" +
            body,
            "_blank"
        );

    });

}