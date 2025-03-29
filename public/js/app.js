const menuIcon = document.querySelector(".menu-icon");
const sideMenu = document.querySelector(".side-menu");
const closeIcon = document.querySelector("#close-btn");

// Open the side menu
menuIcon.addEventListener("click", function () {
  sideMenu.classList.add("active");
});

// Close the side menu
closeIcon.addEventListener("click", function () {
  sideMenu.classList.remove("active");
});