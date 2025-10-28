import { uploadPlaylistCover, updatePlaylistInfo } from "./createPlaylist.js";
import { showToast } from "./toast.js";

export function showPlaylistView(playlistId) {
  const viewPlaylist = document.querySelector(".playlist-view");
  const modal = document.querySelector(".edit-playlist-modal");
  if (!viewPlaylist || !modal) return;

  const playlist = window.playlists?.find((p) => p.id === playlistId);
  if (!playlist) return;

  // Hiển thị dữ liệu hiện tại
  const coverImg = viewPlaylist.querySelector("#playlistCoverImg");
  const coverTrigger = viewPlaylist.querySelector("#coverUploadTrigger");
  const playlistName = viewPlaylist.querySelector("#playlistName");
  const coverInput = viewPlaylist.querySelector("#coverInput");
  const playlistDesc = viewPlaylist.querySelector("#playlistDesc");
  const savePlaylistBtn = viewPlaylist.querySelector("#savePlaylistBtn");
  const closeBtn = modal.querySelector(".close-modal");

  //   Hiển thị playlist
  coverImg.src = playlist.coverPath || "./img/placehoder-playlists.png";
  playlistName.textContent = playlist.name || "My playlist";
  playlistDesc.textContent = playlist.description || "";
  let isChanged = false;

  // Upload ảnh
  coverTrigger.addEventListener("click", () => coverInput.click());
  coverInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const updated = await uploadPlaylistCover(playlist.id, file);
      if (updated?.coverPath) {
        coverImg.src = updated.coverPath;
        playlist.coverPath = updated.coverPath;
        showToast("Cover updated successfully");
      }
    } catch (error) {
      showToast("Failed to upload image", "error");
    }

    // ===== Theo dõi thay đổi =====
    const handleChange = () => {
      const newName = playlistName.textContent.trim();
      const newDesc = playlistDesc.textContent.trim();
      const hasChange =
        newName !== (playlist.name || "") ||
        newDesc !== (playlist.description || "");
      if (hasChange && !isChanged) {
        isChanged = true;
      }
    };
    playlistName.addEventListener("input", handleChange);
    playlistDesc.addEventListener("input", handleChange);

    // ===== Nút Save =====
    savePlaylistBtn.addEventListener("click", async () => {
      const newName = playlistName.textContent.trim();
      const newDesc = playlistDesc.textContent.trim();
      if ((newName === playlistName && newDesc === playlistDesc) || "") {
        showToast("No changes to save");
        return;
      }

      try {
        const updated = await updatePlaylistInfo(playlist.id, newName, newDesc);
        playlist.name = updated.name;
        playlist.description = updated.description;
        isChanged = false;
        // Cập nhật sidebar
        await loadLibraryData();

        // Đóng modal
        modal.classList.remove("show");

        showToast("Playlist saved successfully!");
      } catch (error) {
        showToast("Failed to update playlist", "error");
      }
    });

    // ===== Cảnh báo khi tắt modal mà chưa Save =====
    const handleCloseModal = (e) => {
      if (isChanged) {
        e.stopPropagation();
        showToast("Press Save to keep changes you've made", "warning");
        return;
      }
      modal.classList.remove("show");
    };

    if (closeBtn) {
      closeBtn.addEventListener("click", handleCloseModal);
    }
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        handleCloseModal(e);
      }
    });
    modal.classList.add("show");
  });
}
