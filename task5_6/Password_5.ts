function ViewPass(): void {
  const x = document.getElementById('password') as HTMLInputElement | null;
  if (!x) {
    console.error("Password input element not found");
    return;
  }

  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}
