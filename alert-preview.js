document.addEventListener("DOMContentLoaded", function () {
    fetch('alert.json')
        .then(response => response.json())
        .then(alert => {
            previewAlert(alert);
        })
        .catch(error => {
            console.log("Failed to load announcement data", error);
        });

    function previewAlert(alert) {
        const menu = document.querySelector(".alert-scrollable");
        alert.forEach(a => {
            const space = document.createElement('div');
            space.className = 'alert-elem';

            space.innerHTML = `
        <div>
            <div class="${a.bg}"> 
                <div class="alert-a">
                    <div class="alert-a-a">
                        <div class="alert-heading">${a.title}</div>
                        ${a.course ? `<div class="alert-cc">Course: <b>${a.course}</b></div>` : ''}
                        ${a.class ? `<div class="alert-cc">Course: <b>${a.class}</b></div>` : ''}
                    </div>
                    <div>${a.icon}</div>
                </div>
                <div class="alert-b">${a.time}</div>
            </div>
        </div>`;

            menu.appendChild(space);
        });
    }

    const container = document.getElementById("alert-container");
    const preview = document.querySelector(".alert-preview");
    const badge = document.getElementById("alert-notification");

    let hideTimeout;

    container.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
        preview.style.display = "block";
        badge.style.display = "none"; // Hide badge
    });

    container.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(() => {
            preview.style.display = "none";
            badge.style.display = "flex"; // Show badge again
        }, 150);
    });
});