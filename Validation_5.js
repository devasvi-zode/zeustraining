var loginBtn = document.getElementById('loginBtn');
if (!loginBtn) {
    throw new Error('Login button not found!');
}
loginBtn.addEventListener('click', function () {
    var schoolTypeSelected = document.querySelector('input[name="schoolType"]:checked');
    var stateElem = document.getElementById('states');
    var districtElem = document.getElementById('districts');
    var emailElem = document.getElementById('email');
    var paswordElem = document.getElementById('password');

    if (!stateElem || !districtElem || !emailElem || !paswordElem) {
    alert('Some form elements are missing.');
    return;
    }
    // Extract values
    var state = stateElem.value;
    var district = districtElem.value;
    var email = emailElem.value.trim();
    var password = paswordElem.value.trim();
    var errors = [];
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
        errors.push("Pleae enter your email");
    }
    if (!password) {
        errors.push("Please enter your passwod");
    }
    if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
    }
    alert("Login successful!");
});
