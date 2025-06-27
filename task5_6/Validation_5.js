"use strict";
// const loginBtn = document.getElementById('loginBtn');
// if(!loginBtn){
//     throw new Error('Login button not found!');
// }
// loginBtn.addEventListener('click',function () {
//     const schoolTypeSelected = document.querySelector('input[name="schoolType"]:checked') as HTMLInputElement | null;
//     const stateElem = document.getElementById('states') as HTMLSelectElement | null;
//     const districtElem = document.getElementById('districts') as HTMLSelectElement | null;
//     const emailElem = document.getElementById('email') as HTMLInputElement | null;
//     const paswordElem = document.getElementById('password') as HTMLInputElement | null;
//     if (!stateElem || !districtElem || !emailElem || !paswordElem) {
//     alert('Some form elements are missing.');
//     return;
//     }
//     // Extract values
//     const state = stateElem.value;
//     const district = districtElem.value;
//     const email = emailElem.value.trim();
//     const password = paswordElem.value.trim();
//     let errors : string[] = [];
//     if(!schoolTypeSelected){
//         errors.push("Please select a school type");
//     }
//     if(!state || state ==="ss"){
//         errors.push("Please select a state");
//     }
//     if(!district){
//         errors.push("Please select district");
//     }
//     if(!email){
//         errors.push("Pleae enter your email");
//     }
//     if(!password){
//         errors.push("Please enter your passwod");
//     }
//     if(errors.length >0){
//         alert(errors.join("\n"));
//         return;
//     }
//     alert("Login successful!");
// });
function validateForm() {
    const schoolTypeSelected = document.querySelector('input[name="schoolType"]:checked');
    const stateElem = document.getElementById('states');
    const districtElem = document.getElementById('districts');
    const emailElem = document.getElementById('email');
    const paswordElem = document.getElementById('password');
    if (!stateElem || !districtElem || !emailElem || !paswordElem) {
        alert('Some form elements are missing.');
        return false;
    }
    const state = stateElem.value;
    const district = districtElem.value;
    const email = emailElem.value.trim();
    const password = paswordElem.value.trim();
    let errors = [];
    if (!schoolTypeSelected) {
        errors.push("Please select a school type");
    }
    if (!state || state === "ss") {
        errors.push("Please select a state");
    }
    if (!district) {
        errors.push("Please select district");
    }
    if (!email) {
        errors.push("Please enter your email");
    }
    if (!password) {
        errors.push("Please enter your password");
    }
    if (errors.length > 0) {
        alert(errors.join("\n"));
        return false;
    }
    return true;
}
const loginBtn = document.getElementById('loginBtn');
if (!loginBtn) {
    throw new Error('Login button not found!');
}
loginBtn.addEventListener('click', function () {
    if (validateForm()) {
        alert("Login successful!");
        window.location.href = 'dashboard.html';
    }
});
