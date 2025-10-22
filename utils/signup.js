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

  // Gắn auto clear error
  inputClearEvent(emailInput, emailGroup);
  inputClearEvent(passwordInput, passwordGroup);

  // Gắn toggle password
  initPasswordToggle(
    passwordInput,
    document.querySelector("#eye-show-signup"),
    document.querySelector("#eye-hide-signup")
  );
  // ====== Handle Submit ======
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const displayName = displayNameInput.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    let hasError = false;
    if (!emailRegex.test(email)) {
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
        display_name: displayName,
      });

      // ====== Handle Errors ======
      if (!res) {
        showToast("Cannot connect to server!", "error");
        return;
      }

      if (res.status === 409 || res.error?.code === "EMAIL_EXISTS") {
        showToast("This email is already registered!", "error");
        return;
      }

      // ====== SUCCESS ======
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
        // Đóng modal
        const authModal = document.querySelector("#authModal");
        if (authModal) authModal.classList.remove("show", "open");
        document.body.style.overflow = "auto";

        // Reset form
        signupForm.reset();
      } else {
        showToast("Registration failed! Try again!", "error");
      }
    } catch (error) {
      console.error("Signup error:", error);
      showToast("Something went wrong. Please try again!", "error");
    }
  });
}
