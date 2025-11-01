import httpRequest from "./httpRequest.js";
import { showToast } from "./toast.js";
import { loadLibraryData } from "./libraryLoad.js";
import { loadPlaylistDetail } from "./detailView.js";

// ===== Lấy user hiện tại =====
function getCurrentUser() {
  try {
    const currentUser = localStorage.getItem("user");
    return currentUser ? JSON.parse(currentUser) : null;
  } catch (error) {
    console.error("parse user error", error);
    return null;
  }
}

// ===== Tạo playlist mới =====
export async function createPlaylist() {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login to use this feature", "warning");
    return;
  }

  try {
    // Lấy danh sách playlist hiện có
    const listRes = await httpRequest.get("me/playlists");
    const existing =
      listRes?.data?.playlists || listRes?.playlists || listRes?.data || [];
    const nextIndex = (Array.isArray(existing) ? existing.length : 0) + 1;

    // Lấy tên hiển thị chuẩn từ localStorage user
    const displayName =
      user.display_name?.trim() ||
      user.username?.trim() ||
      user.email?.split("@")[0] ||
      "You";

    const body = {
      name: `My Playlist #${nextIndex}`,
      description: null,
      is_public: 1,
      user_display_name: displayName,
    };

    // Gửi yêu cầu tạo playlist
    const res = await httpRequest.post("playlists", body);
    const newPlaylist =
      res?.data?.playlist || res?.playlist || res?.data || res;

    if (newPlaylist && newPlaylist.id) {
      // Gắn fallback để hiển thị ngay lập tức đúng display name
      newPlaylist.user_display_name =
        newPlaylist.user_display_name || displayName;

      showToast(`Created: ${newPlaylist.name}`, "success");

      // Cập nhật sidebar
      await loadLibraryData();

      // Hiển thị chi tiết playlist vừa tạo
      await loadPlaylistDetail(newPlaylist.id, true);

      // Lưu trạng thái
      localStorage.setItem(
        "last_view",
        JSON.stringify({ type: "playlist", id: newPlaylist.id })
      );
    } else {
      showToast("Failed to create playlist", "error");
    }
  } catch (err) {
    console.error("Create Playlist Error:", err);
    showToast("Error creating playlist", "error");
  }
}
