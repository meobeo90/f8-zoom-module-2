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
        {}, // body rỗng
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Logout response:", response);

      if (!response.ok) console.warn("Server logout failed:", response.error);
      //Xóa thông tin đăng nhập
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      //Ẩn avatar, hiện lại nút login / signup
      userMenu.style.display = "none";
      btnLogin.style.display = "inline-block";
      btnSignup.style.display = "inline-block";

      //Cập nhật tooltip
      userAvatar.removeAttribute("data-tooltip");

      //Chuyển về trang chủ
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  });
}
