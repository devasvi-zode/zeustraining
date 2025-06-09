// function changeImage(){
//     var image = document.getElementById("radio");
//     if(image.src.includes("radio-button-on.svg")){
//         image.src = "radio-button-off.svg";
//     } else {
//         image.src = "radio-button-on.svg";
//     }
// }
// function changeRadio(selectedId){
//     const radios = ["radio1","radio2"];
//     radios.forEach(id => {
//         if(id == selectedId){
//             img.src = "radio-button-on.svg";
//         } else{
//             img.src="radio-button-off.svg";
//         }
//     });
// }

function selectRadio(selectedId) {
    const radioMap = {
        radio1: "radio-button-on.svg",
        radio2: "radio-button-on.svg"
    };

    // Reset both images to off
    document.getElementById("radio1").src = "radio-button-off.svg";
    document.getElementById("radio2").src = "radio-button-off.svg";

    // Set selected one to on
    document.getElementById(selectedId).src = "radio-button-on.svg";

    // Update the corresponding hidden real radio inputs
    if (selectedId === "radio1") {
        document.getElementById("school-type-district").checked = true;
    } else if (selectedId === "radio2") {
        document.getElementById("school-type-independent").checked = true;
    }
}

