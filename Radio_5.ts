function SelectRadio(selectedId: "radio1" | "radio2"): void {
  // Map for radio images, you can extend if needed
  const radioMap: Record<"radio1" | "radio2", string> = {
    radio1: "radio-button-on.svg",
    radio2: "radio-button-on.svg",
  };

  // Helper to get image elements safely
  const radio1Img = document.getElementById("radio1") as HTMLImageElement | null;
  const radio2Img = document.getElementById("radio2") as HTMLImageElement | null;

  if (!radio1Img || !radio2Img) {
    console.error("Radio button images not found");
    return;
  }

  // Reset both images to off
  radio1Img.src = "radio-button-off.svg";
  radio2Img.src = "radio-button-off.svg";

  // Set selected one to on
  const selectedImg = document.getElementById(selectedId) as HTMLImageElement | null;
  if (!selectedImg) {
    console.error(`Selected radio image with id ${selectedId} not found`);
    return;
  }
  selectedImg.src = radioMap[selectedId];

  // Update the corresponding hidden real radio inputs
  const districtInput = document.getElementById("school-type-district") as HTMLInputElement | null;
  const independentInput = document.getElementById("school-type-independent") as HTMLInputElement | null;

  if (!districtInput || !independentInput) {
    console.error("Hidden radio inputs not found");
    return;
  }

  if (selectedId === "radio1") {
    districtInput.checked = true;
    independentInput.checked = false;
  } else if (selectedId === "radio2") {
    independentInput.checked = true;
    districtInput.checked = false;
  }
}
