import { updateUserUI } from "./updateUserUI.js";
import { showError, inputClearEvent, initPasswordToggle } from "./utils.js";
import { loadLibraryData } from "./libraryLoad.js";

export function initLogin(httpRequest, showToast, initTooltip) {
  const loginForm = document.querySelector("#loginForm form");
  if (!loginForm) return;

  const emailInput = document.querySelector("#loginEmail");
  const passwordInput = document.querySelector("#loginPassword");
  const emailGroup = emailInput.closest(".form-group");
  const passwordGroup = passwordInput.closest(".form-group");

  inputClearEvent(emailInput, emailGroup);
  inputClearEvent(passwordInput, passwordGroup);

  initPasswordToggle(
    passwordInput,
    document.querySelector("#eye-show-login"),
    document.querySelector("#eye-hide-login")
  );

  // ====== Handle Submit ======
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // ========== Client-side validation ==========
    let hasError = false;
    if (!email) {
      showError(emailGroup, "Please enter your email!");
      hasError = true;
    }
    if (!password) {
      showError(passwordGroup, "Please enter your password!");
      hasError = true;
    }
    if (hasError) return;

    try {
      const res = await httpRequest.post("auth/login", { email, password });
      console.log("Login response:", res);

      if (!res.ok) {
        // ========== Handle API error ==========
        const apiMsg =
          res.data?.error?.message ||
          res.data?.message ||
          res.error ||
          "Invalid email or password";

        if (res.status === 401) {
          showToast("Invalid email or password", "error");
        } else {
          showToast(apiMsg, "error");
        }
        return;
      }

      // ========== SUCCESS ==========
      const { user, access_token } = res.data;
      const normalizedUser = updateUserUI(user, initTooltip);
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      showToast("Login successful!", "success");

      // Nạp lại Library sau login
      loadLibraryData();

      // Đóng modal
      const authModal = document.querySelector("#authModal");
      if (authModal) authModal.classList.remove("show", "open");
      document.body.style.overflow = "auto";

      // Reset form
      loginForm.reset();
    } catch (error) {
      console.error("Network/Login error:", error);
      showToast("Network error. Please try again!", "error");
    }
  });
}
