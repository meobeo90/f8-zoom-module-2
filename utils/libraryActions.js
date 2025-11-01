import httpRequest from "./httpRequest.js";
import { refreshLibrary } from "./libraryRefresh.js";
import { showToast } from "./toast.js";

export async function setupActionButton(btn, type, id, isActive) {
  if (!btn) return;

  let active = Boolean(isActive);

  const plusIcon = btn.querySelector(".fa-plus");
  const checkIcon = btn.querySelector(".fa-check");

  const updateUI = (isDisabled = false) => {
    btn.disabled = isDisabled;

    if (type === "artist") {
      btn.textContent = active ? "Unfollow" : "Follow";
      btn.classList.toggle("unfollow", active);
    } else if (type === "playlist") {
      btn.classList.toggle("saved", active);
      if (plusIcon && checkIcon) {
        plusIcon.style.display = active ? "none" : "inline-block";
        checkIcon.style.display = active ? "inline-block" : "none";
      }
    }
  };

  updateUI();

  btn.onclick = async () => {
    // Kiểm tra user đã đăng nhập chưa
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");

    if (!token && !user) {
      showToast("Please log in to use this feature.", "warning");
      return;
    }

    updateUI(true);

    try {
      let endpoint = "";

      if (type === "artist") {
        endpoint = `artists/${id}/follow`;
      } else if (type === "playlist") {
        endpoint = `playlists/${id}/follow`;
      }

      // --- Gọi API ---
      if (active) {
        await httpRequest.delete(endpoint);
      } else {
        await httpRequest.post(endpoint);
      }

      active = !active;
      refreshLibrary();
    } catch (error) {
      if (error?.message?.includes("409")) {
        active = true;
      }
      console.error(`[ActionBtn] ${type} toggle error:`, error);
    } finally {
      updateUI(false);
    }
  };
}
