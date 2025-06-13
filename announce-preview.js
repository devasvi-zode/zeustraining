// //fetch data from json file
// fetch('announce.json')
//     .then(response => response.json())
//     .then(announce => {
//         previewAnnounce(announce); //call function with fetched data
//     })
//     .catch(error => {
//         console.log("Failed to load alert data",error);
//     });

//     function previewAnnounce(announce){
//         const menu = document.querySelector(".announce-preview");

//         announce.forEach(a => {
//             const space = document.createElement('div');
//             space.className = 'announce-elem';

//             space.innerHTML =
//             `<div class="announce-elem ${a.bg}">
//                 <div class="announce-a">
//                     <div>
//                         <div>PA: ${a.name}</div>
//                         <div>${context}</div>
//                         <div>${a.course ? `<div>Course: ${a.course}</div>` : ''}</div>
//                     </div>
//                     <div>${a.icon}</div>
//                 </div>
//                 <div class="announce-b">
//                     <div>${a.file ? `<div><img src="icons8-clip-48.svg"> ${a.file}</div>` : ''}</div>
//                     <div>${a.time}</div>
//                 </div>
//             </div>`;

//             menu.appendChild(space);
//         });

//     }

// const announceIcon = document.getElementById("announcement");
// const announceBox = document.querySelector(".announce-preview");

// announceBox.style.display = "none";

// announceIcon.addEventListener("click", () => {
//     announceBox.style.display = announceBox.style.display === "none" ? "block" : "none";
// });



// document.addEventListener("DOMContentLoaded", function () {
//     fetch('announce.json')
//         .then(response => response.json())
//         .then(announce => {
//             previewAnnounce(announce);
//         })
//         .catch(error => {
//             console.log("Failed to load announcement data", error);
//         });

//     function previewAnnounce(announce) {
//         const menu = document.querySelector(".announce-preview");
//         if (!menu) {
//             console.warn("announce-preview element not found");
//             return;
//         }

//         announce.forEach(a => {
//             const space = document.createElement('div');
//             space.className = 'announce-elem';

//             space.innerHTML = `
//                 <div class="${a.bg || ''}">
//                     <div class="announce-a">
//                         <div>
//                             <div>PA: ${a.name}</div>
//                             <div>${a.context || ''}</div>
//                             ${a.course ? `<div>Course: ${a.course}</div>` : ''}
//                         </div>
//                         <div>${a.icon || ''}</div>
//                     </div>
//                     <div class="announce-b">
//                         ${a.file ? `<div><img src="icons8-clip-48.svg" alt="clip icon" id="clip-icon"> ${a.file}</div>` : ''}
//                         <div>${a.time}</div>
//                     </div>
//                 </div>
//             `;

//             menu.appendChild(space);
//         });
//     }

//     // Toggle preview on icon click
//     const announceIcon = document.getElementById("announcement");
//     const announceBox = document.querySelector(".announce-preview");

//     if (announceIcon && announceBox) {
//         announceBox.style.display = "none";

//         announceIcon.addEventListener("click", () => {
//             announceBox.style.display =
//                 announceBox.style.display === "none" ? "block" : "none";
//         });
//     }
// });



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
        const menu = document.querySelector(".announce-preview");
        announce.forEach(a => {
            const space = document.createElement('div');
            space.className = 'announce-elem';

            space.innerHTML = `
                <div class="${a.bg || ''}">
                    <div class="announce-a">
                        <div>
                            <div>PA: ${a.name}</div>
                            <div>${a.context || ''}</div>
                            ${a.course ? `<div>Course: ${a.course}</div>` : ''}
                        </div>
                        <div>${a.icon || ''}</div>
                    </div>
                    <div class="announce-b">
                        ${a.file ? `<div><img src="icons8-clip-48.svg" id="clip-icon"> ${a.file}</div>` : ''}
                        <div>${a.time}</div>
                    </div>
                </div>
            `;

            menu.appendChild(space);
        });
    }

    // Hover logic to show/hide preview
    const container = document.getElementById("announcement-container");
    const preview = document.querySelector(".announce-preview");

    container.addEventListener("mouseenter", () => {
        preview.style.display = "block";
    });

    container.addEventListener("mouseleave", () => {
        preview.style.display = "none";
    });
});
