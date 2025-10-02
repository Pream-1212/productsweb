document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  // --- SUCCESS ALERT HANDLING ---
  const successAlert = document.querySelector(".alert");
  if (successAlert) {
    // Show fade-out after 3 seconds
    setTimeout(() => {
      successAlert.style.transition = "opacity 0.5s";
      successAlert.style.opacity = "0";
      setTimeout(() => successAlert.remove(), 500);
    }, 3000);
  }

  // --- FORM VALIDATION HELPERS ---
  const showError = (input, message = "Invalid field") => {
    input.classList.add("is-invalid");

    let feedback = input.parentElement.querySelector(".invalid-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "invalid-feedback";
      input.parentElement.appendChild(feedback);
    }
    feedback.textContent = message;
  };

  const clearError = (input) => {
    input.classList.remove("is-invalid");
    const feedback = input.parentElement.querySelector(".invalid-feedback");
    if (feedback) feedback.remove();
  };

  // --- FORM FIELDS ---
  const productName = document.querySelector("#productName");
  const category = document.querySelector("#category");
  const price = document.querySelector("#price");
  const quantity = document.querySelector("#quantity");
  const color = document.querySelector("#color");
  const productImage = document.querySelector("#productImage");

  const fields = [productName, category, price, quantity, color, productImage];

  // --- FIELD VALIDATION FUNCTION ---
  const validateField = (input) => {
    switch (input) {
      case productName:
        !productName.value ? showError(productName) : clearError(productName);
        break;
      case category:
        !category.value ? showError(category) : clearError(category);
        break;
      case price:
        if (!price.value || isNaN(price.value) || Number(price.value) <= 0)
          showError(price);
        else clearError(price);
        break;
      case quantity:
        if (
          !quantity.value ||
          isNaN(quantity.value) ||
          Number(quantity.value) < 0
        )
          showError(quantity);
        else clearError(quantity);
        break;
      case color:
        !color.value ? showError(color) : clearError(color);
        break;
      case productImage:
        !productImage.files[0]
          ? showError(productImage)
          : clearError(productImage);
        break;
    }
  };

  // --- LIVE VALIDATION ---
  [productName, category, price, quantity, color].forEach((field) => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("change", () => validateField(field)); // for selects
  });
  productImage.addEventListener("change", () => validateField(productImage));

  // --- FORM SUBMIT VALIDATION ---
  form.addEventListener("submit", (e) => {
    let isValid = true;

    fields.forEach((field) => {
      validateField(field);
      if (field.classList.contains("is-invalid")) isValid = false;
    });

    if (!isValid) e.preventDefault();
  });
});
