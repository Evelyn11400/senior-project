// Simple mobile nav toggle for small screens
const menuToggle = document.querySelector(".header__menu-toggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.style.display === "flex";
    nav.style.display = isOpen ? "none" : "flex";
    nav.style.flexDirection = "column";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });
}

