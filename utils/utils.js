// FORM UTILS
export function showError(group, message) {
  group.classList.add("invalid");
  group.querySelector(".error-message span").textContent = message;
}

export function clearError(group) {
  group.classList.remove("invalid");
}

export function inputClearEvent(input, group) {
  if (input && group) {
    input.addEventListener("input", () => clearError(group));
  }
}

export function initPasswordToggle(passwordInput, eyeShowIcon, eyeHideIcon) {
  if (!passwordInput || !eyeShowIcon || !eyeHideIcon) return;

  const updateIcons = () => {
    const isPassword = passwordInput.type === "password";
    eyeShowIcon.classList.toggle("hidden", !isPassword);
    eyeHideIcon.classList.toggle("hidden", isPassword);
  };

  const togglePassword = () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    updateIcons();
  };
  updateIcons();

  eyeShowIcon.addEventListener("click", togglePassword);
  eyeHideIcon.addEventListener("click", togglePassword);
}

// formatDuration & escapeHTML

export function formatDuration(duration) {
  const sec = Number(duration);
  if (isNaN(sec) || sec <= 0) return "--:--";
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

export function escapeHTML(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
