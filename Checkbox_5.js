function ChangeBox() {
    var image = document.getElementById("checkbox");
    if (!image) {
        console.error("Checkbox image element not found");
        return;
    }
    if (image.src.includes("checkbox-checked.svg")) {
        image.src = "checkbox-unchecked.svg";
    }
    else {
        image.src = "checkbox-checked.svg";
    }
}
