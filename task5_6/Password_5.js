"use strict";
function ViewPass() {
    const x = document.getElementById('password');
    if (!x) {
        console.error("Password input element not found");
        return;
    }
    if (x.type === "password") {
        x.type = "text";
    }
    else {
        x.type = "password";
    }
}
