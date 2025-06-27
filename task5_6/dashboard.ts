document.addEventListener('DOMContentLoaded', () => {

    //Fetch alert preview data from JSON file
    fetch('alert.json')
    .then(response => response.json())
    .then((alert : AlertItem[]) => {
        previewAlert(alert);
    })
    .catch(error => {
        console.log("Failed to load announcement data ", error);
    });

    interface AlertItem {
        title: string,
        time: string,
        bg: string,
        icon: string,
        class?: string,
        course?: string
    }
    
    //Render alert function
    function previewAlert( alert : AlertItem[]) {
        const alrt_menu = document.querySelector(".alert-scrollable");
        if(!alrt_menu) return;
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

            alrt_menu.appendChild(space);
        });
    }

    const alrt_container = document.getElementById("alert-container");
    const alrt_preview = document.querySelector(".alert-preview") as HTMLElement | null;
    const alrt_badge = document.getElementById("alert-notification");

    let hideTimeout : number;

    if(alrt_container && alrt_preview && alrt_badge){
        alrt_container.addEventListener("mouseenter", () => {
            clearTimeout(hideTimeout);
            alrt_preview.style.display = "block",
            alrt_badge.style.display = "none";
        });

        alrt_container.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout( () => {
                alrt_preview.style.display = "none";
                alrt_badge.style.display = "flex";
            }, 150);
        });
    }

    //Fetch announcement preview data from JSON file
    fetch('announce.json')
        .then(response => response.json())
        .then((announce : AnnounceItem[]) => {
            previewAnnounce(announce);
        })
        .catch(error => {
            console.log("Failed to load announcement data ", error);
        });

    interface AnnounceItem {
        name: string,
        context: string,
        file: string,
        time: string,
        bg: string,
        icon: string,
        course?: string,
    }
    //Render announcement function
    function previewAnnounce(announce: AnnounceItem[]){
        const ann_menu = document.querySelector(".announce-scrollable");
        if(!ann_menu) return;
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

            ann_menu.appendChild(space);
        });          
    }

    const ann_container = document.getElementById("announcement-container");
    const ann_preview = document.querySelector(".announce-preview") as HTMLElement | null;
    const ann_badge = document.getElementById("announce-notification");
  

    if(ann_container && ann_preview && ann_badge){
        ann_container.addEventListener("mouseenter", () => {
            clearTimeout(hideTimeout);
            ann_preview.style.display= "block";
            ann_badge.style.display = "none";
        });

        ann_container.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout(() => {
                ann_preview.style.display = "none";
                ann_badge.style.display = "flex";
            },150)
        });
    }
    

    //Hamburger Preview 
    const ham_container = document.getElementById("hamburger");
    const ham_menu = document.querySelector(".hamburger-menu") as HTMLElement | null;
    const ham_contentToggle = document.querySelector(".content-toggle") as HTMLElement | null;

    
    function showMenu() : void{
        if(ham_menu){
            clearTimeout(hideTimeout);
            ham_menu.style.display = "block";
        }
        
    }

    function hideMenu() : void{
        hideTimeout = setTimeout(() => {
            if(ham_menu){
                ham_menu.style.display = "none";
            } 
        }, 200);
    }
    if(ham_container && ham_menu){
        ham_container.addEventListener("mouseenter",showMenu);
        ham_container.addEventListener("mouseleave",hideMenu);
        ham_menu.addEventListener("mouseenter",showMenu);
        ham_menu.addEventListener("mouseleave",hideMenu);
    }
    
    if(ham_contentToggle){
        ham_contentToggle.addEventListener("click", function () {
            ham_contentToggle.classList.toggle("active");
        });
    }
    
    //Fetch course data from JSON file
    fetch('courses.json')
        .then(response => response.json())
        .then((courses : courseItem[]) => {
            renderCourse(courses);
        })
        .catch(error => {
            console.log("Failed to laod course data ", error)
        });

    interface courseItem{
        title: string,
        subject: string,
        grade: string,
        gradePlus: string,
        units?: number,
        lessons?: number,
        topics?: number,
        class: string,
        students?: number,
        duration?: string,
        image: string,
        icon?: string,
        star?: string,
        status?: string
    }

    //Render course function
    function renderCourse(courses : courseItem[]){
        const container = document.querySelector('.course-info');
        if(!container) return;
        container.innerHTML = '';  //Clear existing cards if any

        courses.forEach(course =>{
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
        <div class="card-info">
            ${course.status ? `<div class="${course.status}">EXPIRED</div>` : '' }
            <div>
            <div class="course-cover"><img src="${course.image}" alt="course cover"></div>
            </div>
            <div class="C">
            <div class="c1">
                <div>${course.title}</div>
                <div><img src="quantum screen assets/icons/favourite.svg" alt="fav icon" class="${course.star}"></div>
            </div>

            <div class="c2">
                <div>${course.subject}</div>
                <div class="verticalBar"></div>
                <div>${course.grade}</div>
                <div class="greenPlus">${course.gradePlus}</div>
            </div>
          
            <div class="c3">
                <div><b>${course.units || ''}</b> Units</div>
                <div><b>${course.lessons || ''}</b> Lessons</div>
                <div><b>${course.topics || ''}</b> Topics</div>
            </div>

            <div class="c4">
                <select>
                <option value="b">${course.class}</option>
                </select>
            </div>

            <div class="c5">
                ${course.students ? `<div>${course.students} Students</div>` : ''}
                ${course.students && course.duration ? `<div class="verticalBar"></div>` : ''}
                ${course.duration ? `<div>${course.duration}</div>` : ''}
            </div>
            </div>
        </div>
        <div>
            <div class="icons">
            <div><img src="quantum screen assets/icons/preview.svg" alt="preview"></div>
            <div><img src="quantum screen assets/icons/manage course.svg" alt="manage course" class="${course.icon}"></div>
            <div><img src="quantum screen assets/icons/grade submissions.svg" alt="grade submission" class="${course.icon}"></div>
            <div><img src="quantum screen assets/icons/reports.svg" alt="reports"></div>
            </div>
        </div>
        `;

            container.appendChild(card);
    });
    }

});
