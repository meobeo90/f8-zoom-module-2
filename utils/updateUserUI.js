import { loadLibraryData } from "./libraryLoad.js";
export function updateUserUI(user, initTooltip) {
  // --- Các phần tử giao diện ---
  const userMenu = document.querySelector(".user-menu");
  const userAvatarBtn = document.querySelector("#userAvatar");
  const avatarImg = userAvatarBtn?.querySelector("img");
  const btnLogin = document.querySelector(".login-btn");
  const btnSignup = document.querySelector(".signup-btn");
  const userName = document.querySelector(".user-name");
  const libraryContent = document.querySelector(".library-content");

  if (user) {
    // --- User đã đăng nhập ---
    // Lấy tên hiển thị: ưu tiên display_name, fallback sang email
    const displayValue =
      String(user.display_name || user.displayName || "").trim() ||
      String(user.email || "");

    // Ẩn nút Login/Signup
    if (btnLogin) btnLogin.style.display = "none";
    if (btnSignup) btnSignup.style.display = "none";

    // Hiển thị menu user
    if (userMenu) userMenu.style.display = "flex";

    // Tạo avatar ảo từ chữ cái đầu
    if (userAvatarBtn) {
      const oldAvatar = userAvatarBtn.querySelector(".virtual-avatar");
      if (oldAvatar) oldAvatar.remove();

      const firstLetter = displayValue.charAt(0).toUpperCase() || "";
      const avatarDiv = document.createElement("div");
      avatarDiv.classList.add("virtual-avatar");
      avatarDiv.textContent = firstLetter;

      if (avatarImg) avatarImg.style.display = "none";
      userAvatarBtn.prepend(avatarDiv);
      userAvatarBtn.dataset.tooltip = displayValue;

      // Cập nhật tên hiển thị
      if (userName) userName.textContent = displayValue;
    }

    // Kích hoạt tooltip
    if (initTooltip) initTooltip("#userAvatar");

    // Nạp lại thư viện sidebar ngay sau khi login
    if (libraryContent) loadLibraryData();
  } else {
    // --- Chưa đăng nhập hoặc logout ---
    // Ẩn user menu, hiển thị lại login/signup
    if (userMenu) userMenu.style.display = "none";
    if (btnSignup) btnSignup.style.display = "inline-block";
    if (btnLogin) btnLogin.style.display = "inline-block";

    // Reset avatar
    if (userAvatarBtn) {
      const oldAvatar = userAvatarBtn.querySelector(".virtual-avatar");
      if (oldAvatar) oldAvatar.remove();
      if (avatarImg) avatarImg.style.display = "block";
      userAvatarBtn.dataset.tooltip = "";
    }
    if (userName) userName.textContent = "";

    // Reset sidebar về trạng thái guest
    if (libraryContent) {
      libraryContent.innerHTML = `
        <p class="library-placeholder">Log in to create and share playlists.</p>
      `;
    }
  }
}
