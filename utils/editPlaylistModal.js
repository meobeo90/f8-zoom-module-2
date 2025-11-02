// import { uploadPlaylistCover } from "./upload.js";
// import { showToast } from "./toast.js";
// import httpRequest from "./httpRequest.js";
// import { loadPlaylistDetail } from "./detailView.js";

// export function openEditModal(playlist) {
//   const modal = document.querySelector(".edit-playlist-modal");
//   if (!modal) return;

//   modal.classList.add("show");

//   const coverImg = modal.querySelector("#playlistCoverImg");
//   const nameEl = modal.querySelector("#playlistName");
//   const descEl = modal.querySelector("#playlistDesc");
//   const coverInput = modal.querySelector("#coverInput");
//   const uploadTrigger = modal.querySelector("#coverUploadTrigger");
//   const saveBtn = modal.querySelector("#savePlaylistBtn");
//   const closeBtn = modal.querySelector(".modal-close");

//   // --- Hiển thị thông tin hiện tại ---
//   coverImg.src = playlist.image_url || "./img/placeholder-playlists.png";
//   nameEl.textContent = playlist.name || "Untitled Playlist";
//   descEl.textContent = playlist.description || "";

//   // --- Upload ảnh mới ---
//   uploadTrigger.onclick = () => coverInput.click();

//   coverInput.onchange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const result = await uploadPlaylistCover(playlist.id, file);
//     if (result?.image_url) {
//       coverImg.src = result.image_url;
//       playlist.image_url = result.image_url;
//     }
//   };

//   // --- Lưu thay đổi playlist ---
//   saveBtn.onclick = async () => {
//     const updatedName = nameEl.textContent.trim();
//     const updatedDesc = descEl.textContent.trim();

//     if (!updatedName) {
//       showToast("Playlist name cannot be empty", "warning");
//       return;
//     }

//     try {
//       const body = {
//         name: updatedName,
//         description: updatedDesc,
//         image_url: playlist.image_url,
//       };

//       const res = await httpRequest.patch(`playlists/${playlist.id}`, body);

//       if (res.status === 200) {
//         showToast("Playlist updated successfully", "success");
//         modal.classList.remove("show");
//         await loadPlaylistDetail(playlist.id);
//       } else {
//         showToast("Failed to update playlist", "error");
//       }
//     } catch (error) {
//       console.error("Update playlist error:", error);
//       showToast("Error updating playlist", "error");
//     }
//   };

//   // --- Đóng modal ---
//   closeBtn.onclick = () => modal.classList.remove("show");
//   modal.addEventListener("click", (e) => {
//     if (e.target === modal) modal.classList.remove("show");
//   });
// }
// window.openEditModal = openEditModal;
import { uploadPlaylistCover } from "./upload.js";
import { showToast } from "./toast.js";
import httpRequest from "./httpRequest.js";
import { loadPlaylistDetail } from "./detailView.js";

export function openEditModal(playlist) {
  const modal = document.querySelector(".edit-playlist-modal");
  if (!modal) return;

  modal.classList.add("show");

  const coverImg = modal.querySelector("#playlistCoverImg");
  const nameEl = modal.querySelector("#playlistName");
  const descEl = modal.querySelector("#playlistDesc");
  const coverInput = modal.querySelector("#coverInput");
  const uploadTrigger = modal.querySelector("#coverUploadTrigger");
  const saveBtn = modal.querySelector("#savePlaylistBtn");
  const closeBtn = modal.querySelector(".modal-close");

  // --- Gán dữ liệu gốc ---
  coverImg.src = playlist.image_url || "./img/placeholder-playlists.png";
  nameEl.value = playlist.name || "Untitled Playlist";
  descEl.value = playlist.description || "";

  // --- Lưu giá trị gốc để so sánh khi đóng modal ---
  const original = {
    name: nameEl.value,
    desc: descEl.value,
    img: coverImg.src,
  };

  let hasChanges = false;

  // --- Theo dõi thay đổi ---
  const checkChanges = () => {
    hasChanges =
      nameEl.value.trim() !== original.name ||
      descEl.value.trim() !== original.desc ||
      coverImg.src !== original.img;
  };

  nameEl.addEventListener("input", checkChanges);
  descEl.addEventListener("input", checkChanges);

  // --- Upload ảnh mới ---
  uploadTrigger.onclick = () => coverInput.click();

  coverInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await uploadPlaylistCover(playlist.id, file);
    if (result?.image_url) {
      coverImg.src = result.image_url;
      playlist.image_url = result.image_url;
      checkChanges();
    }
  };

  // --- Lưu thay đổi playlist ---
  saveBtn.onclick = async () => {
    const updatedName = nameEl.value.trim();
    const updatedDesc = descEl.value.trim();

    if (!updatedName) {
      showToast("Playlist name cannot be empty", "warning");
      return;
    }

    // Kiểm tra xem có thay đổi gì không
    if (!hasChanges) {
      showToast("No changes detected.", "warning");
      return;
    }

    try {
      const body = {
        name: updatedName,
        description: updatedDesc,
        image_url: playlist.image_url,
      };

      const res = await httpRequest.patch(`playlists/${playlist.id}`, body);

      if (res.status === 200) {
        showToast("Playlist updated successfully", "success");
        modal.classList.remove("show");
        await loadPlaylistDetail(playlist.id);
      } else {
        showToast("Failed to update playlist", "error");
      }
    } catch (error) {
      console.error("Update playlist error:", error);
      showToast("Error updating playlist", "error");
    }
  };

  // --- Đóng modal ---
  function closeModalWithWarning() {
    if (hasChanges) {
      showToast("Press save to keep changes you've made.", "warning");
    }
    modal.classList.remove("show");
  }

  closeBtn.onclick = closeModalWithWarning;

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalWithWarning();
  });
}

window.openEditModal = openEditModal;
