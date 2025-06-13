// //fetch data from json file
// fetch('alert.json')
//     .then(response => response.json())
//     .then(alert => {
//         previewAlert(alert); //call function with fetched data
//     })
//     .catch(error => {
//         console.log("Failed to load alert data",error);
//     });

//     function previewAlert(alert){
//         const menu = document.querySelector(".alert-preview");

//         alert.forEach(a => {
//             const space = document.createElement('div');
//             space.className = 'alert-elem';

//             space.innerHTML = `
//         <div class="alert-box">
//             <div class="alert-elem ${a.bg}"> 
//                 <div class="alert-a">
//                     <div>
//                         <div class="alert-heading">${a.title}</div>
//                         ${a.course ? `<div class="alert-cc">Course: ${a.course}</div>` : ''}
//                         ${a.class ? `<div class="alert-cc">Course: ${a.class}</div>` : ''}
//                     </div>
//                     <div>${a.icon}</div>
//                 </div>
//                 <div class="alert-b">${a.time}</div>
//             </div>
//         </div>`;

//             menu.appendChild(space);
//         });

//     }




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
        const menu = document.querySelector(".alert-preview");
        alert.forEach(a => {
            const space = document.createElement('div');
            space.className = 'alert-elem';

            space.innerHTML = `
        <div class="alert-box">
            <div class="alert-elem ${a.bg}"> 
                <div class="alert-a">
                    <div>
                        <div class="alert-heading">${a.title}</div>
                        ${a.course ? `<div class="alert-cc">Course: ${a.course}</div>` : ''}
                        ${a.class ? `<div class="alert-cc">Course: ${a.class}</div>` : ''}
                    </div>
                    <div>${a.icon}</div>
                </div>
                <div class="alert-b">${a.time}</div>
            </div>
        </div>`;

            menu.appendChild(space);
        });
    }

    // Hover logic to show/hide preview
    const container = document.getElementById("alert-container");
    const preview = document.querySelector(".alert-preview");

    container.addEventListener("mouseenter", () => {
        preview.style.display = "block";
    });

    container.addEventListener("mouseleave", () => {
        preview.style.display = "none";
    });
});