document.addEventListener("DOMContentLoaded", function() {
const container = document.getElementById("hamburger");
const menu = document.querySelector(".hamburger-menu");

let hideTimeout;

function showMenu(){
    clearTimeout(hideTimeout);
    menu.style.display = "block";
}

function hideMenu(){
    hideTimeout = setTimeout(() => {
        menu.style.display = "none";
    }, 200);
}
container.addEventListener("mouseenter",showMenu);
container.addEventListener("mouseleave",hideMenu);
menu.addEventListener("mouseenter",showMenu);
menu.addEventListener("mouseleave",hideMenu);

const contentToggle = document.querySelector(".content-toggle");
contentToggle.addEventListener("click", function () {
      contentToggle.classList.toggle("active");
    });

});