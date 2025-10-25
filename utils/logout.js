import httpRequest from "./httpRequest.js";

export function initLogout() {
  const logoutBtn = document.querySelector("#logoutBtn");
  const userMenu = document.querySelector(".user-menu");
  const btnLogin = document.querySelector(".login-btn");
  const btnSignup = document.querySelector(".signup-btn");
  const userAvatar = document.querySelector("#userAvatar");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await httpRequest.post(
        "auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Logout response:", response);

      // Xóa token + user khỏi localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      // Ẩn avatar, hiện lại login/signup
      if (userMenu) userMenu.style.display = "none";
      if (btnLogin) btnLogin.style.display = "inline-block";
      if (btnSignup) btnSignup.style.display = "inline-block";

      if (userAvatar) userAvatar.removeAttribute("data-tooltip");

      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const basePath = pathParts.length > 0 ? `/${pathParts[0]}/` : "/";

      console.log("Redirecting to:", basePath);
      window.location.href = basePath;
    } catch (error) {
      console.error("Logout error:", error);
    }
  });
}
