function ChangeBox(): void {
  const image = document.getElementById("checkbox") as HTMLImageElement | null;
  if (!image) {
    console.error("Checkbox image element not found");
    return;
  }

  if (image.src.includes("checkbox-checked.svg")) {
    image.src = "checkbox-unchecked.svg";
  } else {
    image.src = "checkbox-checked.svg";
  }
}
