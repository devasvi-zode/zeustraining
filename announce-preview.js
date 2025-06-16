document.addEventListener("DOMContentLoaded", function () {
    fetch('announce.json')
        .then(response => response.json())
        .then(announce => {
            previewAnnounce(announce);
        })
        .catch(error => {
            console.log("Failed to load announcement data", error);
        });

    function previewAnnounce(announce) {
        const menu = document.querySelector(".announce-scrollable");
        announce.forEach(a => {
            const space = document.createElement('div');
            space.className = 'announce-elem';

            space.innerHTML = `
            <div>
                <div class="${a.bg}">
                    <div class="announce-a">
                        <div class="announce-a-a">
                            <div class="teacher">PA: <b>${a.name}</b></div>
                            <div class="context">${a.context || ''}</div>
                            ${a.course ? `<div class="course">Course: ${a.course}</div>` : ''}
                        </div>
                        <div>${a.icon || ''}</div>
                    </div>
                    <div class="announce-b">
                        ${a.file ? `<div class="clip"><img src="icons8-clip-48.svg" id="clip-icon"> ${a.file}</div>` : ''}
                        <div id="time">${a.time}</div>
                    </div>
                </div>
            </div>
            `;

            menu.appendChild(space);
        });
    }

    // Hover logic to show/hide preview
    const container = document.getElementById("announcement-container");
    const preview = document.querySelector(".announce-preview");
    const badge = document.getElementById("announce-notification");

    let hideTimeout;

    container.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
        preview.style.display = "block";
        badge.style.display = "none";
    });

    container.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(() => {
            preview.style.display = "none";
            badge.style.display = "flex";
        }, 250);
    });

});
