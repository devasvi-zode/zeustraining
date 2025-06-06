document.getElementById('loginBtn').addEventListener('click', function () {
  const schoolTypeSelected = document.querySelector('input[name="school type"]:checked');
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
  alert("Login successful!");
  // You can proceed with form submission or API call here
});
