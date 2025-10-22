import { updateUserUI } from "./updateUserUI.js";
import { showError, inputClearEvent, initPasswordToggle } from "./utils.js";
import { loadLibraryData } from "./libraryLoad.js"; //

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

      if (!res) {
        showToast("Cannot connect to server!", "error");
        return;
      }

      if (res.status === 401 || res.error?.code === "INVALID_CREDENTIALS") {
        showToast("Invalid email or password", "error");
        return;
      }

      // ====== SUCCESS ======
      if (res.status === 200 && res.data?.user) {
        const { user, access_token } = res.data;

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user", JSON.stringify(user));

        showToast("Login successful!", "success");

        // Cập nhật header
        updateUserUI(
          {
            email: user.email,
            display_name: user.display_name || user.email,
          },
          initTooltip
        );

        // Nạp lại Library ngay sau khi login
        loadLibraryData();

        // Đóng modal
        const authModal = document.querySelector("#authModal");
        if (authModal) authModal.classList.remove("show", "open");
        document.body.style.overflow = "auto";

        // Reset form
        loginForm.reset();
      } else {
        showToast("Login failed! Try again!", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("Something went wrong. Please try again!", "error");
    }
  });
}
