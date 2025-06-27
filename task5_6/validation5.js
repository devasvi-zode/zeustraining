document.getElementById('loginBtn').addEventListener('click', function () {
  const schoolTypeSelected = document.querySelector('input[name="schoolType"]:checked');
  const state = document.getElementById('states').value;
  const district = document.getElementById('districts').value;
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  let errors = [];

  if (!schoolTypeSelected) {
    errors.push("Please select a school type.");
  }

  if (!state || state === "ss") {
    errors.push("Please select a state.");
  }

  if (!district) {
    errors.push("Please select a district.");
  }

  if (!email) {
    errors.push("Please enter your email.");
  }

  if (!password) {
    errors.push("Please enter your password.");
  }

  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }

  // Success: perform login or redirect

  // You can proceed with form submission or API call here
  console.log("All validation passed. Redirecting to dashboard.html...");
  window.location.href = "dashboard.html";
  alert("Login successful!");
});

// function validateForm() {
//     var schoolTypeSelected = document.querySelector('input[name="schoolType"]:checked');
//     var stateElem = document.getElementById('states');
//     var districtElem = document.getElementById('districts');
//     var emailElem = document.getElementById('email');
//     var paswordElem = document.getElementById('password');
//     if (!stateElem || !districtElem || !emailElem || !paswordElem) {
//         alert('Some form elements are missing.');
//         return false;
//     }
//     var state = stateElem.value;
//     var district = districtElem.value;
//     var email = emailElem.value.trim();
//     var password = paswordElem.value.trim();
//     var errors = [];
//     if (!schoolTypeSelected) {
//         errors.push("Please select a school type");
//     }
//     if (!state || state === "ss") {
//         errors.push("Please select a state");
//     }
//     if (!district) {
//         errors.push("Please select district");
//     }
//     if (!email) {
//         errors.push("Please enter your email");
//     }
//     if (!password) {
//         errors.push("Please enter your password");
//     }
//     if (errors.length > 0) {
//         alert(errors.join("\n"));
//         return false;
//     }
//     return true;
// }
// var loginBtn = document.getElementById('loginBtn');
// if (!loginBtn) {
//     throw new Error('Login button not found!');
// }
// loginBtn.addEventListener('click', function () {
//     e.preventDefault(); // Prevent form submission
//     if (validateForm()) {
//         alert("Login successful!");
//         window.location.href = 'dashboard.html';
//     }
// });