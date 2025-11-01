// ====================== main.js ======================
import httpRequest from "./utils/httpRequest.js";
import { initTooltip } from "./utils/tooltips.js";
import { showToast } from "./utils/toast.js";
import { initSignup } from "./utils/signup.js";
import { initLogin } from "./utils/login.js";
import { initLogout } from "./utils/logout.js";
import { updateUserUI } from "./utils/updateUserUI.js";
import { initHome } from "./utils/renderHome.js";
import { loadLibraryData } from "./utils/libraryLoad.js";
import { createPlaylist } from "./utils/createPlaylist.js";
import { loadPlaylistDetail, loadArtistDetail } from "./utils/detailView.js";
// === Tắt menu chuột phải mặc định ===
document.addEventListener("contextmenu", (e) => e.preventDefault());

// === Toàn bộ logic chính ===
document.addEventListener("DOMContentLoaded", async () => {
  // ====== AUTH MODAL ======
  const signupBtn = document.querySelector(".signup-btn");
  const loginBtn = document.querySelector(".login-btn");
  const authModal = document.getElementById("authModal");
  const modalClose = document.getElementById("modalClose");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");

  // --- Hiển thị form login/signup ---
  const showSignupForm = () => {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  };
  const showLoginForm = () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  };

  // --- Modal mở / đóng ---
  const openModal = () => {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    authModal.classList.remove("show");
    document.body.style.overflow = "auto";
  };

  signupBtn?.addEventListener("click", () => {
    showSignupForm();
    openModal();
  });
  loginBtn?.addEventListener("click", () => {
    showLoginForm();
    openModal();
  });
  modalClose?.addEventListener("click", closeModal);
  authModal?.addEventListener("click", (e) => {
    if (e.target === authModal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  showLoginBtn?.addEventListener("click", showLoginForm);
  showSignupBtn?.addEventListener("click", showSignupForm);

  // === KHỞI TẠO SIGNUP / LOGIN / LOGOUT ===
  initSignup(httpRequest, showToast, initTooltip);
  initLogin(httpRequest, showToast, initTooltip);
  initLogout();

  // === KHỞI TẠO TOOLTIP + HOME ===
  initTooltip(".tooltip-btn");
  initHome();

  // === USER DROPDOWN ===
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // --- Toggle dropdown ---
  userAvatar?.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // --- Đóng dropdown khi click ra ngoài ---
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

    // 🔁 Sau khi logout → xóa playlist trong sidebar
    const libraryContainer = document.querySelector(".library-content");
    if (libraryContainer) libraryContainer.innerHTML = "";
  });

  // === CHECK LOGIN STATUS & LOAD PLAYLIST ===
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

    // load sidebar (Liked + Created + Followed + Artists)
    await loadLibraryData();

    // === Restore last view sau khi login ===
    const lastViewRaw = localStorage.getItem("last_view");

    if (lastViewRaw) {
      try {
        const lastView = JSON.parse(lastViewRaw);

        if (lastView.type === "playlist" && lastView.id) {
          await loadPlaylistDetail(lastView.id);
        } else if (lastView.type === "liked_tracks") {
          await loadPlaylistDetail("liked_tracks");
        } else if (lastView.type === "artist" && lastView.id) {
          await loadArtistDetail(lastView.id);
        } else {
          initHome();
        }
      } catch (error) {
        console.error("Error restoring last view:", error);
        initHome();
      }
    } else {
      initHome();
    }
  } else {
    updateUserUI(null, initTooltip);
  }
  // === NÚT TẠO PLAYLIST ===
  const createBtn = document.querySelector(".create-btn");
  if (createBtn) createBtn.addEventListener("click", createPlaylist);
});
