import { updateUserUI } from "./updateUserUI.js";
import { inputClearEvent, showError, initPasswordToggle } from "./utils.js";

export function initSignup(httpRequest, showToast, initTooltip) {
  const signupForm = document.querySelector("#signupForm form");
  if (!signupForm) return;

  const emailInput = document.querySelector("#signupEmail");
  const passwordInput = document.querySelector("#signupPassword");
  const displayNameInput = document.querySelector("#signupDisplayName");

  const emailGroup = emailInput.closest(".form-group");
  const passwordGroup = passwordInput.closest(".form-group");

  // Gắn event xóa input
  inputClearEvent(emailInput, emailGroup);
  inputClearEvent(passwordInput, passwordGroup);
  inputClearEvent(displayNameInput, displayNameInput.closest(".form-group"));

  // Toggle mắt mật khẩu
  initPasswordToggle(
    passwordInput,
    document.querySelector("#eye-show-signup"),
    document.querySelector("#eye-hide-signup")
  );

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const display_name = displayNameInput.value.trim() || undefined; // Cho phép trống

    // Xóa lỗi cũ
    [emailGroup, passwordGroup].forEach((g) => g.classList.remove("error"));

    // Kiểm tra input
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    let hasError = false;

    if (!emailRegex.test(email) || email.split("@").length !== 2) {
      showError(emailGroup, "Please enter a valid email address");
      hasError = true;
    }

    if (!passRegex.test(password)) {
      showError(
        passwordGroup,
        "Password must be at least 6 characters and include uppercase, lowercase, and number"
      );
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await httpRequest.post("auth/register", {
        email,
        password,
        ...(display_name && { display_name }),
      });

      console.log("Response from server:", res);

      if (res.status >= 400) {
        const error = res.data?.error;
        if (error?.details?.length) {
          error.details.forEach((d) => {
            const { field, message } = d;
            if (field === "email") showError(emailGroup, message);
            else if (field === "password") showError(passwordGroup, message);
            else showToast(message, "error");
          });
        } else {
          showToast(error?.message || "Validation failed", "error");
        }
        return;
      }

      if (res.status === 201 && res.data?.user) {
        const { user, access_token } = res.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
        showToast("Sign up successful!", "success");

        updateUserUI(
          {
            email: user.email,
            display_name: user.display_name || user.email,
          },
          initTooltip
        );

        const authModal = document.querySelector("#authModal");
        if (authModal) authModal.classList.remove("show", "open");
        document.body.style.overflow = "auto";
        signupForm.reset();
      } else {
        showToast("Registration failed! Try again!", "error");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorData =
        error?.response?.data?.error || error?.data?.error || error;
      console.log("Error response:", errorData);

      if (errorData?.details?.length) {
        errorData.details.forEach((d) => {
          const { field, message } = d;
          if (field === "email") showError(emailGroup, message);
          else if (field === "password") showError(passwordGroup, message);
          else showToast(message, "error");
        });
      } else {
        showToast(errorData?.message || "Unknown error", "error");
      }
    }
  });
}
