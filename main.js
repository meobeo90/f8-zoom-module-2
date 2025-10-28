import httpRequest from "./utils/httpRequest.js";
import { initTooltip } from "./utils/tooltips.js";
import { showToast } from "./utils/toast.js";
import { initSignup } from "./utils/signup.js";
import { initLogin } from "./utils/login.js";
import { initLogout } from "./utils/logout.js";
import { updateUserUI } from "./utils/updateUserUI.js";
import { initHome } from "./utils/renderHome.js";
import { handleCreatePlaylist } from "./utils/createPlaylist.js";

// === Vô hiệu hóa Context menu ===
document.addEventListener("contextmenu", (e) => e.preventDefault());

// === Khởi tạo toàn bộ logic khi DOM sẵn sàng ===
document.addEventListener("DOMContentLoaded", async () => {
  // ===== AUTH MODAL =====
  const signupBtn = document.querySelector(".signup-btn");
  const loginBtn = document.querySelector(".login-btn");
  const authModal = document.getElementById("authModal");
  const modalClose = document.getElementById("modalClose");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");

  const showSignupForm = () => {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  };

  const showLoginForm = () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  };

  const openModal = () => {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto";
  };

  // Open/Close modal events
  signupBtn?.addEventListener("click", () => {
    showSignupForm();
    openModal();
  });
  loginBtn?.addEventListener("click", () => {
    showLoginForm();
    openModal();
  });
  modalClose?.addEventListener("click", closeModal);
  authModal?.addEventListener(
    "click",
    (e) => e.target === authModal && closeModal()
  );
  document.addEventListener(
    "keydown",
    (e) => e.key === "Escape" && closeModal()
  );

  showLoginBtn?.addEventListener("click", showLoginForm);
  showSignupBtn?.addEventListener("click", showSignupForm);

  // === KHỞI TẠO SIGNUP/LOGIN ===
  initSignup(httpRequest, showToast, initTooltip);
  initLogin(httpRequest, showToast, initTooltip);
  initLogout();

  // === TOOLTIP + HOME ===
  initTooltip(".tooltip-btn");
  initHome();

  // === USER DROPDOWN ===
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  userAvatar?.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!userAvatar?.contains(e.target) && !userDropdown?.contains(e.target)) {
      userDropdown?.classList.remove("show");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") userDropdown?.classList.remove("show");
  });

  // === LOGOUT ===
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    updateUserUI(null, initTooltip);
    showToast("Logged out successfully!", "success");
  });

  // === CHECK LOGIN STATUS ===
  const accessToken = localStorage.getItem("access_token");
  const userData = localStorage.getItem("user");

  if (accessToken && userData) {
    const parsedUser = JSON.parse(userData);
    updateUserUI(
      {
        email: parsedUser.email,
        display_name: parsedUser.display_name || parsedUser.email,
      },
      initTooltip
    );
  } else {
    updateUserUI(null, initTooltip);
  }
});

// === CREATE PLAYLIST ===
document.addEventListener("DOMContentLoaded", () => {
  initTooltip;

  const createBtn = document.querySelector(".create-btn");
  if (createBtn) {
    createBtn.addEventListener("click", handleCreatePlaylist);
  }
});
