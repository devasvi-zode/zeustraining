function SelectRadio(selectedId) {
    // Map for radio images, you can extend if needed
    var radioMap = {
        radio1: "radio-button-on.svg",
        radio2: "radio-button-on.svg",
    };
    // Helper to get image elements safely
    var radio1Img = document.getElementById("radio1");
    var radio2Img = document.getElementById("radio2");
    if (!radio1Img || !radio2Img) {
        console.error("Radio button images not found");
        return;
    }
    // Reset both images to off
    radio1Img.src = "radio-button-off.svg";
    radio2Img.src = "radio-button-off.svg";
    // Set selected one to on
    var selectedImg = document.getElementById(selectedId);
    if (!selectedImg) {
        console.error("Selected radio image with id ".concat(selectedId, " not found"));
        return;
    }
    selectedImg.src = radioMap[selectedId];
    // Update the corresponding hidden real radio inputs
    var districtInput = document.getElementById("school-type-district");
    var independentInput = document.getElementById("school-type-independent");
    if (!districtInput || !independentInput) {
        console.error("Hidden radio inputs not found");
        return;
    }
    if (selectedId === "radio1") {
        districtInput.checked = true;
        independentInput.checked = false;
    }
    else if (selectedId === "radio2") {
        independentInput.checked = true;
        districtInput.checked = false;
    }
}
