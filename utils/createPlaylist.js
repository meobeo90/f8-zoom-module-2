import httpRequest from "./httpRequest.js";
import { loadLibraryData } from "./libraryLoad.js";
import { showPlaylistView } from "./playlistView.js";

// ===== CREATE PLAYLIST =====
export async function handleCreatePlaylist() {
  try {
    const res = await httpRequest.post("playlists", {
      name: "My playlist",
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error("Failed to create playlist");
    }

    const newPlaylist = res.data?.playlist;
    if (!newPlaylist) return;

    loadLibraryData();
    showPlaylistView(newPlaylist.id);
  } catch (error) {
    console.error("Create playlist error:", error);
  }
}

// ===== UPLOAD ẢNH COVER =====
export async function uploadPlaylistCover(playlistId, file) {
  try {
    const formData = new FormData();
    formData.append("cover", file);
    const uploadCover = await httpRequest.post(
      `upload/playlist/${playlistId}/cover`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const coverPath = uploadCover.data?.path;
    if (!coverPath) throw new Error("Upload failed");
    // Cập nhật playlist với ảnh mới
    await httpRequest.put(`playlists/${playlistId}`, { coverPath });
    // Cập nhật ảnh trên UI
    const playlistCover = document.querySelector(
      `.created-playlist[data-id="${playlistId}"] .playlist-icon img`
    );
    if (playlistCover) playlistCover.src = coverPath;
    return { coverPath };
  } catch (error) {
    console.error("Upload cover error:", error);
  }
}

// ===== CẬP NHẬT TÊN/MÔ TẢ PLAYLIST =====
export async function updatePlaylistInfo(playlistId, newName, newDesc) {
  try {
    const res = await httpRequest.put(`playlists/${playlistId}`, {
      name: newName,
      description: newDesc,
    });
    if (res.status !== 200) throw new Error("Rename failed");
    // Cập nhật tên ở sidebar
    const playlistTitle = document.querySelector(
      `.created-playlist[data-id="${playlistId}"] .item-title `
    );
    if (playlistTitle) playlistTitle.textContent = newName;
  } catch (error) {
    console.error("Rename playlist error:", error);
  }
}
