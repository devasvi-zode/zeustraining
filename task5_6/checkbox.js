function changeBox(){
    var image = document.getElementById("checkbox");
    if(image.src.includes("checkbox-checked.svg")){
        image.src = "checkbox-unchecked.svg";
    } else {
        image.src = "checkbox-checked.svg";
    }
}