//Fetch course data from JSON file
fetch('courses.json')
    .then(response => response.json())
    .then(courses => {
        renderCourses(courses); //Call function with fetched data
    })
    .catch(error =>{
        console.error("Failed to load course",error);
    });

//Render course function 
function renderCourses(courses){
    const container = document.querySelector('.course-info');
    container.innerHTML = '';  //Clear existing cards if any

    courses.forEach(course =>{
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
      <div class="card-info">
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