// import { uploadPlaylistCover, updatePlaylistInfo } from "./createPlaylist.js";
// import { showToast } from "./toast.js";

// export function showPlaylistView(playlistId) {
//   const viewPlaylist = document.querySelector(".playlist-view");
//   const modal = document.querySelector(".edit-playlist-modal");
//   if (!viewPlaylist || !modal) return;

//   const playlist = window.playlists?.find((p) => p.id === playlistId);
//   if (!playlist) return;

//   // Hiển thị dữ liệu hiện tại
//   const coverImg = viewPlaylist.querySelector("#playlistCoverImg");
//   const coverTrigger = viewPlaylist.querySelector("#coverUploadTrigger");
//   const playlistName = viewPlaylist.querySelector("#playlistName");
//   const coverInput = viewPlaylist.querySelector("#coverInput");
//   const playlistDesc = viewPlaylist.querySelector("#playlistDesc");
//   const savePlaylistBtn = viewPlaylist.querySelector("#savePlaylistBtn");
//   const closeBtn = modal.querySelector(".close-modal");

//   //   Hiển thị playlist
//   coverImg.src = playlist.coverPath || "./img/placehoder-playlists.png";
//   playlistName.textContent = playlist.name || "My playlist";
//   playlistDesc.textContent = playlist.description || "";
//   let isChanged = false;

//   // Upload ảnh
//   coverTrigger.addEventListener("click", () => coverInput.click());
//   coverInput.addEventListener("change", async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       const updated = await uploadPlaylistCover(playlist.id, file);
//       if (updated?.coverPath) {
//         coverImg.src = updated.coverPath;
//         playlist.coverPath = updated.coverPath;
//         showToast("Cover updated successfully");
//       }
//     } catch (error) {
//       showToast("Failed to upload image", "error");
//     }

//     // ===== Theo dõi thay đổi =====
//     const handleChange = () => {
//       const newName = playlistName.textContent.trim();
//       const newDesc = playlistDesc.textContent.trim();
//       const hasChange =
//         newName !== (playlist.name || "") ||
//         newDesc !== (playlist.description || "");
//       if (hasChange && !isChanged) {
//         isChanged = true;
//       }
//     };
//     playlistName.addEventListener("input", handleChange);
//     playlistDesc.addEventListener("input", handleChange);

//     // ===== Nút Save =====
//     savePlaylistBtn.addEventListener("click", async () => {
//       const newName = playlistName.textContent.trim();
//       const newDesc = playlistDesc.textContent.trim();
//       if ((newName === playlistName && newDesc === playlistDesc) || "") {
//         showToast("No changes to save");
//         return;
//       }

//       try {
//         const updated = await updatePlaylistInfo(playlist.id, newName, newDesc);
//         playlist.name = updated.name;
//         playlist.description = updated.description;
//         isChanged = false;
//         // Cập nhật sidebar
//         await loadLibraryData();

//         // Đóng modal
//         modal.classList.remove("show");

//         showToast("Playlist saved successfully!");
//       } catch (error) {
//         showToast("Failed to update playlist", "error");
//       }
//     });

//     // ===== Cảnh báo khi tắt modal mà chưa Save =====
//     const handleCloseModal = (e) => {
//       if (isChanged) {
//         e.stopPropagation();
//         showToast("Press Save to keep changes you've made", "warning");
//         return;
//       }
//       modal.classList.remove("show");
//     };

//     if (closeBtn) {
//       closeBtn.addEventListener("click", handleCloseModal);
//     }
//     modal.addEventListener("click", (e) => {
//       if (e.target === modal) {
//         handleCloseModal(e);
//       }
//     });
//     modal.classList.add("show");
//   });
// }
/*
import { uploadPlaylistCover, updatePlaylistInfo } from "./createPlaylist.js";
import { showToast } from "./toast.js";
import { loadLibraryData } from "./libraryLoad.js"; 
import { escapeHTML } from "./utils.js"; // Giả định hàm tiện ích

// Khởi tạo các biến global cho listeners của Modal để tránh lặp lại
let saveButtonListener = null;
let nameInputListener = null;
let descInputListener = null;
let closeButtonListener = null;
let modalClickListener = null;

// Hàm gỡ bỏ listeners cũ của Modal (để tránh lặp lại sự kiện)
function removePreviousModalListeners(modal) {
    const savePlaylistBtn = modal.querySelector("#savePlaylistBtn");
    const playlistName = modal.querySelector("#playlistName");
    const playlistDesc = modal.querySelector("#playlistDesc");
    const closeBtn = modal.querySelector(".close-modal");

    if (saveButtonListener) savePlaylistBtn.removeEventListener("click", saveButtonListener);
    if (nameInputListener) playlistName.removeEventListener("input", nameInputListener);
    if (descInputListener) playlistDesc.removeEventListener("input", descInputListener);
    if (closeButtonListener) closeBtn.removeEventListener("click", closeButtonListener);
    if (modalClickListener) modal.removeEventListener("click", modalClickListener);

    // Reset variables
    saveButtonListener = nameInputListener = descInputListener = closeButtonListener = modalClickListener = null;
}

// =========================================================================
// HÀM 1: Mở Modal Chỉnh sửa (Được gọi khi click vào tên/ảnh trên giao diện chính)
// =========================================================================
export function openEditPlaylistModal(playlistId) {
    const modal = document.querySelector(".edit-playlist-modal");
    if (!modal) {
        console.error("Modal element .edit-playlist-modal not found.");
        return;
    }

    // Gỡ bỏ listeners cũ trước khi mở modal mới
    removePreviousModalListeners(modal);

    const playlist = window.playlists?.find((p) => p.id === playlistId);
    if (!playlist) {
        showToast("Playlist not found.", "error");
        return;
    }

    // --- Khai báo và gán giá trị DOM trong Modal ---
    const coverImg = modal.querySelector("#playlistCoverImg");
    const coverTrigger = modal.querySelector("#coverUploadTrigger");
    const playlistName = modal.querySelector("#playlistName");
    const coverInput = modal.querySelector("#coverInput");
    const playlistDesc = modal.querySelector("#playlistDesc");
    const savePlaylistBtn = modal.querySelector("#savePlaylistBtn");
    const closeBtn = modal.querySelector(".close-modal");

    //   Hiển thị dữ liệu hiện tại
    coverImg.src = playlist.coverPath || "./img/placeholder-playlists.png";
    playlistName.textContent = playlist.name || "My playlist";
    playlistDesc.textContent = playlist.description || "";
    
    // Lưu tên/mô tả ban đầu
    const originalName = playlist.name || "";
    const originalDesc = playlist.description || "";
    let isChanged = false;

    // --- Listeners cho Modal ---

    // 1. Upload ảnh
    coverTrigger.onclick = () => coverInput.click();
    coverInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const updated = await uploadPlaylistCover(playlist.id, file);
            if (updated?.coverPath) {
                coverImg.src = updated.coverPath; // Cập nhật Modal
                // Cập nhật giao diện chính (View)
                const mainCover = document.querySelector(`#main-content-view img[data-playlist-cover="${playlist.id}"]`);
                if (mainCover) mainCover.src = updated.coverPath;
                
                playlist.coverPath = updated.coverPath;
                showToast("Cover updated successfully");
            }
        } catch (error) {
            showToast("Failed to upload image", "error");
        }
        e.target.value = ''; // Reset input để cho phép upload lại cùng file
    };
    
    // 2. Theo dõi thay đổi
    const handleChange = () => {
        const newName = playlistName.textContent.trim();
        const newDesc = playlistDesc.textContent.trim();
        
        isChanged = newName !== originalName || newDesc !== originalDesc;
        if (savePlaylistBtn) {
            savePlaylistBtn.disabled = !isChanged || !newName; // Yêu cầu tên không trống
            savePlaylistBtn.classList.toggle('opacity-50', !isChanged || !newName);
        }
    };
    
    nameInputListener = () => handleChange();
    descInputListener = () => handleChange();
    playlistName.addEventListener("input", nameInputListener);
    playlistDesc.addEventListener("input", descInputListener);
    
    // Đảm bảo nút save disabled khi mở modal (vì ban đầu chưa có thay đổi)
    if (savePlaylistBtn) {
        savePlaylistBtn.disabled = true;
        savePlaylistBtn.classList.add('opacity-50');
    }

    // 3. Nút Save
    saveButtonListener = async () => {
        const newName = playlistName.textContent.trim();
        const newDesc = playlistDesc.textContent.trim();
        
        if (!isChanged || !newName) {
            showToast("No changes to save or playlist name is empty.", "warning");
            return;
        }

        try {
            await updatePlaylistInfo(playlist.id, newName, newDesc);
            
            // Cập nhật dữ liệu local
            playlist.name = newName; 
            playlist.description = newDesc; 
            
            // Cập nhật giao diện chính (View)
            const mainTitle = document.querySelector(`#main-content-view [data-playlist-title="${playlist.id}"]`);
            if (mainTitle) mainTitle.textContent = newName;

            isChanged = false; // Đã save
            removePreviousModalListeners(modal); // Gỡ listeners
            modal.classList.remove("show"); // Đóng modal
            
            showToast("Playlist saved successfully!");

        } catch (error) {
            console.error("Save playlist error:", error);
            showToast("Failed to update playlist", "error");
        }
    };
    savePlaylistBtn.addEventListener("click", saveButtonListener);


    // 4. Cảnh báo khi tắt modal
    const handleCloseModal = (e) => {
        if (isChanged) {
            showToast("Press Save to keep changes you've made", "warning");
            return;
        }
        // Gỡ listeners trước khi đóng
        removePreviousModalListeners(modal);
        modal.classList.remove("show"); 
    };

    closeButtonListener = (e) => handleCloseModal(e);
    modalClickListener = (e) => {
        if (e.target === modal) {
            handleCloseModal(e);
        }
    };

    if (closeBtn) {
      closeBtn.addEventListener("click", closeButtonListener);
    }
    modal.addEventListener("click", modalClickListener);
    
    // Hiển thị modal
    modal.classList.add("show");
}


// =========================================================================
// HÀM 2: Render Giao diện chi tiết Playlist (Được gọi khi click trên sidebar hoặc sau khi tạo mới)
// =========================================================================
export function showPlaylistView(playlistId) {
    const mainContent = document.getElementById("main-content-view"); 
    if (!mainContent) {
        console.error("Main content view element not found.");
        return;
    }
    
    const playlist = window.playlists?.find((p) => p.id === playlistId);
    if (!playlist) {
        mainContent.innerHTML = '<div class="error-state text-white p-8">Playlist not found.</div>';
        return;
    }

    // Lấy thông tin người tạo (Giả định thông tin đã có từ libraryLoad.js)
    const creatorName = playlist.user_display_name || playlist.user_username || "Unknown";
    const totalSongs = playlist.total_tracks || 0;
    const totalSongsText = totalSongs === 1 ? "1 song" : `${totalSongs} songs`;

    // 1. Tạo HTML cho giao diện Playlist View
    const playlistHTML = `
        <div class="playlist-view-container min-h-full" data-playlist-id="${escapeHTML(playlist.id)}">
            <!-- Header: Chứa Ảnh, Tên và Meta. Click vào đây để mở Modal Edit -->
            <header id="playlist-header-view" data-playlist-id="${escapeHTML(playlist.id)}"
                    class="playlist-header p-8 bg-gradient-to-b from-gray-900 to-black/70 cursor-pointer">
                <div class="flex items-end space-x-6">
                    <div class="playlist-cover shadow-2xl">
                        <img id="viewPlaylistCover"
                             data-playlist-cover="${escapeHTML(playlist.id)}"
                             src="${escapeHTML(playlist.coverPath || './img/placeholder-playlists.png')}" 
                             alt="${escapeHTML(playlist.name)}" 
                             class="w-48 h-48 object-cover rounded shadow-xl hover:opacity-75 transition-opacity"
                             onerror="this.onerror=null; this.src='./img/placeholder-playlists.png'">
                    </div>
                    <div class="flex flex-col justify-end">
                        <p class="text-xs text-white uppercase font-bold tracking-widest">Public Playlist</p>
                        <h1 id="viewPlaylistTitle"
                            data-playlist-title="${escapeHTML(playlist.id)}"
                            class="playlist-title text-8xl font-black text-white mt-2 mb-4 hover:underline transition-colors">
                            ${escapeHTML(playlist.name)}
                        </h1>
                        <p class="text-sm text-gray-300 mb-2">${escapeHTML(playlist.description || '')}</p>
                        <div class="playlist-meta flex items-center text-sm text-gray-300">
                            <span class="creator-name font-bold text-white hover:underline cursor-pointer">
                                ${escapeHTML(creatorName)}
                            </span>
                            <span class="mx-1">•</span>
                            <span>${totalSongsText}</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Controls (Nút Play) -->
            <div class="playlist-controls p-6 flex items-center bg-black/30">
                <button class="play-button bg-green-500 text-black p-4 rounded-full shadow-lg hover:scale-105 transition-transform">
                    <i class="fas fa-play text-2xl"></i>
                </button>
            </div>

            <!-- Tracks Content -->
            <div class="playlist-tracks p-8">
                <h2 class="text-xl font-bold text-white mb-4">Let's find something for your playlist</h2>
                <div class="search-box mb-8 flex items-center p-3 bg-gray-800 rounded-full w-full max-w-sm">
                    <i class="fas fa-search text-gray-400 mr-3"></i>
                    <input type="text" placeholder="Search for songs or episodes" class="bg-gray-800 text-white focus:outline-none w-full">
                </div>
                <p class="text-gray-400">Add some tracks here...</p>
            </div>
        </div>
    `;

    // 2. Render HTML
    mainContent.innerHTML = playlistHTML;

    // 3. Thêm Event Listener để mở Modal Edit
    const headerElement = document.getElementById("playlist-header-view");
    if (headerElement) {
        // Gỡ bỏ listener cũ nếu có (an toàn hơn, dù showPlaylistView chỉ render 1 lần)
        headerElement.removeEventListener('click', handleHeaderClick);
        // Thêm listener mới
        headerElement.addEventListener('click', handleHeaderClick);
    }
}

/**
 * Hàm xử lý click vào Header (Ảnh/Tên) của Playlist View.
 */
// function handleHeaderClick(e) {
//     // Chỉ mở modal khi click vào ảnh, tên, hoặc vùng header, không phải nút play
//     const playlistId = e.currentTarget.getAttribute('data-playlist-id');
//     const isPlayButton = e.target.closest('.play-button');

//     if (playlistId && !isPlayButton) {
//         openEditPlaylistModal(playlistId);
//     }
// }

// */

// import { uploadPlaylistCover, updatePlaylistInfo } from "./createPlaylist.js";
// import { loadLibraryData } from "./libraryLoad.js";
// import { showToast } from "./toast.js";

// // ===== HIỂN THỊ GIAO DIỆN CHI TIẾT PLAYLIST =====
// export function showPlaylistView(playlistId) {
//   const view = document.querySelector(".playlist-view");
//   const modal = document.querySelector(".edit-playlist-modal");
//   if (!view || !modal) return;

//   const playlist = window.playlists?.find((p) => p.id === playlistId);
//   if (!playlist) return;

//   // Gán dữ liệu
//   const coverImg = view.querySelector("#playlistCoverImg");
//   const playlistName = view.querySelector("#playlistName");
//   const playlistDesc = view.querySelector("#playlistDesc");

//   coverImg.src = playlist.coverPath || "./img/placehoder-playlists.png";
//   playlistName.textContent = playlist.name || "My Playlist";
//   playlistDesc.textContent = playlist.description || "";

//   // Khi click vào ảnh hoặc tên → mở modal chỉnh sửa
//   [coverImg, playlistName].forEach((el) => {
//     el.addEventListener("click", () => openEditModal(playlist, modal, view));
//   });
// }

// // ===== MỞ MODAL CHỈNH SỬA =====
// function openEditModal(playlist, modal, view) {
//   const coverInput = modal.querySelector("#coverInput");
//   const coverPreview = modal.querySelector("#coverPreview");
//   const nameInput = modal.querySelector("#editPlaylistName");
//   const descInput = modal.querySelector("#editPlaylistDesc");
//   const saveBtn = modal.querySelector("#savePlaylistBtn");
//   const closeBtn = modal.querySelector(".close-modal");

//   // Đổ dữ liệu hiện tại
//   coverPreview.src = playlist.coverPath || "./img/placehoder-playlists.png";
//   nameInput.value = playlist.name || "";
//   descInput.value = playlist.description || "";

//   modal.classList.add("show");

//   let isChanged = false;

//   // Theo dõi thay đổi
//   [nameInput, descInput].forEach((input) =>
//     input.addEventListener("input", () => (isChanged = true))
//   );

//   // Upload ảnh mới
//   coverInput.addEventListener("change", async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       const { coverPath } = await uploadPlaylistCover(playlist.id, file);
//       if (coverPath) {
//         coverPreview.src = coverPath;
//         playlist.coverPath = coverPath;
//         showToast("Cover updated successfully");
//         isChanged = true;
//       }
//     } catch {
//       showToast("Failed to upload image", "error");
//     }
//   });

//   // Nút Save
//   saveBtn.onclick = async () => {
//     const newName = nameInput.value.trim();
//     const newDesc = descInput.value.trim();

//     if (!isChanged) {
//       showToast("No changes to save");
//       return;
//     }

//     try {
//       const updated = await updatePlaylistInfo(playlist.id, newName, newDesc);
//       Object.assign(playlist, updated);

//       // Cập nhật view
//       const viewName = view.querySelector("#playlistName");
//       const viewDesc = view.querySelector("#playlistDesc");
//       const viewCover = view.querySelector("#playlistCoverImg");
//       if (viewName) viewName.textContent = playlist.name;
//       if (viewDesc) viewDesc.textContent = playlist.description;
//       if (viewCover) viewCover.src = playlist.coverPath;

//       await loadLibraryData();
//       modal.classList.remove("show");
//       showToast("Playlist saved successfully!");
//     } catch {
//       showToast("Failed to update playlist", "error");
//     }
//   };

//   // Đóng modal
//   const handleClose = () => {
//     if (isChanged) {
//       showToast("Press Save to keep your changes", "warning");
//       return;
//     }
//     modal.classList.remove("show");
//   };

//   closeBtn.onclick = handleClose;
//   modal.addEventListener("click", (e) => e.target === modal && handleClose());
// }

// import { uploadPlaylistCover, updatePlaylistInfo } from "./createPlaylist.js";
// import { loadLibraryData } from "./libraryLoad.js";
// import { showToast } from "./toast.js";

// // ===== HIỂN THỊ GIAO DIỆN CHI TIẾT PLAYLIST =====
// export function showPlaylistView(playlistId) {
//   const view = document.querySelector(".playlist-view-main");
//   const modal = document.querySelector(".edit-playlist-modal");
//   if (!view || !modal) return;

//   const playlist = window.playlists?.find((p) => p.id === playlistId);
//   if (!playlist) return;

//   const coverImg = view.querySelector("#playlistCoverImg");
//   const playlistName = view.querySelector("#playlistName");
//   const playlistDesc = view.querySelector("#playlistDesc");

//   // Hiển thị thông tin playlist
//   coverImg.src = playlist.coverPath || "./img/placeholder-playlists.png";
//   playlistName.textContent = playlist.name || "My Playlist";
//   playlistDesc.textContent = playlist.description || "";

//   // Hiển thị phần view (ẩn các phần khác nếu cần)
//   view.classList.remove("hidden");

//   // Khi click vào ảnh hoặc tên → mở modal chỉnh sửa
//   [coverImg, playlistName].forEach((el) =>
//     el.addEventListener("click", () => openEditModal(playlist, modal, view))
//   );
// }

// // ===== MỞ MODAL CHỈNH SỬA =====
// function openEditModal(playlist, modal, view) {
//   const coverInput = modal.querySelector("#coverInput");
//   const coverPreview = modal.querySelector("#playlistCoverImg");
//   const nameInput = modal.querySelector("#playlistName");
//   const descInput = modal.querySelector("#playlistDesc");
//   const saveBtn = modal.querySelector("#savePlaylistBtn");
//   const closeBtn = modal.querySelector(".close-modal");

//   // Đổ dữ liệu hiện tại
//   coverPreview.src = playlist.coverPath || "./img/placeholder-playlists.png";
//   nameInput.textContent = playlist.name || "";
//   descInput.textContent = playlist.description || "";

//   modal.classList.add("show");

//   let isChanged = false;

//   [nameInput, descInput].forEach((input) =>
//     input.addEventListener("input", () => (isChanged = true))
//   );

//   // Upload ảnh mới
//   coverInput.onchange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       const { coverPath } = await uploadPlaylistCover(playlist.id, file);
//       if (coverPath) {
//         coverPreview.src = coverPath;
//         playlist.coverPath = coverPath;
//         showToast("Cover updated successfully");
//         isChanged = true;
//       }
//     } catch {
//       showToast("Failed to upload image", "error");
//     }
//   };

//   // Nút Save
//   saveBtn.onclick = async () => {
//     const newName = nameInput.textContent.trim();
//     const newDesc = descInput.textContent.trim();

//     if (!isChanged) {
//       showToast("No changes to save");
//       return;
//     }

//     try {
//       const updated = await updatePlaylistInfo(playlist.id, newName, newDesc);
//       Object.assign(playlist, updated);

//       // Cập nhật view chính
//       view.querySelector("#playlistName").textContent = playlist.name;
//       view.querySelector("#playlistDesc").textContent = playlist.description;
//       view.querySelector("#playlistCoverImg").src = playlist.coverPath;

//       await loadLibraryData();
//       modal.classList.remove("show");
//       showToast("Playlist saved successfully!");
//     } catch {
//       showToast("Failed to update playlist", "error");
//     }
//   };

//   // Đóng modal
//   const handleClose = () => {
//     if (isChanged) {
//       showToast("Press Save to keep your changes", "warning");
//       return;
//     }
//     modal.classList.remove("show");
//   };

//   closeBtn.onclick = handleClose;
//   modal.addEventListener("click", (e) => e.target === modal && handleClose());
// }

import { uploadPlaylistCover, updatePlaylistInfo } from "./createPlaylist.js";
import { loadLibraryData } from "./libraryLoad.js";
import { showToast } from "./toast.js";

// Map để lưu trữ các event listener đã gán, giúp loại bỏ chúng sau này
const listenerMap = new Map();

// ===== HIỂN THỊ GIAO DIỆN CHI TIẾT PLAYLIST =====
export function showPlaylistView(playlistId) {
  // 1. Tìm kiếm View chính bằng ID mới
  const view = document.querySelector("#playlistViewContainer");

  // Tìm kiếm Modal chỉnh sửa (giả định modal này có ID mới)
  const modal = document.querySelector("#editPlaylistModal");

  if (!view || !modal) {
    console.error(
      "Lỗi: Không tìm thấy #playlistViewContainer hoặc #editPlaylistModal"
    );
    return;
  }

  const playlist = window.playlists?.find((p) => p.id === playlistId);
  if (!playlist) return;

  // 2. Tìm kiếm các phần tử Cover, Name, Desc trên View chính bằng ID mới
  const coverImg = view.querySelector("#mainCoverImg");
  const playlistName = view.querySelector("#mainPlaylistName");
  const playlistDesc = view.querySelector("#mainPlaylistDesc");
  const editBtn = view.querySelector("#mainEditBtn"); // Nút Edit mới

  // Hiển thị thông tin playlist
  if (coverImg)
    coverImg.src = playlist.coverPath || "./img/placeholder-playlists.png";
  if (playlistName) playlistName.textContent = playlist.name || "My Playlist";
  if (playlistDesc) playlistDesc.textContent = playlist.description || "";

  // Hiển thị phần view (ẩn các phần khác nếu cần)
  view.classList.remove("hidden");

  // --- XỬ LÝ EVENT LISTENERS (QUAN TRỌNG: PHẢI XÓA CÁC LISTENER CŨ) ---
  const elementsToListen = [coverImg, playlistName, editBtn];

  // 1. Loại bỏ listeners cũ (nếu có)
  elementsToListen.forEach((el) => {
    if (!el) return;
    const oldListener = listenerMap.get(el);
    if (oldListener) {
      el.removeEventListener("click", oldListener);
      listenerMap.delete(el);
    }
  });

  // 2. Định nghĩa và thêm listener mới
  const newListener = () => openEditModal(playlist, modal, view);

  elementsToListen.forEach((el) => {
    if (!el) return;
    el.addEventListener("click", newListener);
    listenerMap.set(el, newListener); // Lưu listener mới vào map
  });
}

// ===== MỞ MODAL CHỈNH SỬA =====
function openEditModal(playlist, modal, view) {
  const coverInput = modal.querySelector("#coverInput");
  const coverPreview = modal.querySelector("#modalCoverPreview"); // Giả định ID cho ảnh xem trước trong Modal
  const nameInput = modal.querySelector("#modalPlaylistNameInput"); // Giả định ID cho input tên trong Modal
  const descInput = modal.querySelector("#modalPlaylistDescInput"); // Giả định ID cho input mô tả trong Modal
  const saveBtn = modal.querySelector("#savePlaylistBtn");
  const closeBtn = modal.querySelector(".close-modal");

  // Giả định: nameInput và descInput bây giờ là <input> hoặc <textarea> (Không phải contenteditable như code cũ)

  // Đổ dữ liệu hiện tại
  if (coverPreview)
    coverPreview.src = playlist.coverPath || "./img/placeholder-playlists.png";
  if (nameInput) nameInput.value = playlist.name || "";
  if (descInput) descInput.value = playlist.description || "";

  // Reset input file
  if (coverInput) coverInput.value = null;

  modal.classList.add("show");

  let isChanged = false;

  // Sử dụng 'change' và 'input' cho các trường nhập
  [nameInput, descInput].forEach((input) => {
    if (input) input.addEventListener("input", () => (isChanged = true));
  });

  // Upload ảnh mới
  if (coverInput) {
    coverInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        // Kiểm tra xem coverPreview có tồn tại không trước khi gán src
        const result = await uploadPlaylistCover(playlist.id, file);
        const coverPath = result?.coverPath;

        if (coverPath) {
          if (coverPreview) coverPreview.src = coverPath;
          playlist.coverPath = coverPath;
          showToast("Cover updated successfully");
          isChanged = true;
        }
      } catch {
        showToast("Failed to upload image", "error");
      }
    };
  }

  // Nút Save
  if (saveBtn) {
    saveBtn.onclick = async () => {
      // Lấy giá trị từ input/textarea
      const newName = nameInput.value.trim();
      const newDesc = descInput.value.trim();

      // Kiểm tra xem có thay đổi nào không, bao gồm cả thay đổi ảnh (isChanged=true)
      const nameChanged = newName !== playlist.name;
      const descChanged = newDesc !== playlist.description;

      if (!isChanged && !nameChanged && !descChanged) {
        showToast("No changes to save");
        return;
      }

      try {
        const updated = await updatePlaylistInfo(playlist.id, newName, newDesc);
        // Cập nhật đối tượng playlist trong window.playlists
        Object.assign(playlist, updated);

        // Cập nhật view chính bằng ID mới
        if (view.querySelector("#mainPlaylistName"))
          view.querySelector("#mainPlaylistName").textContent = playlist.name;
        if (view.querySelector("#mainPlaylistDesc"))
          view.querySelector("#mainPlaylistDesc").textContent =
            playlist.description;
        if (view.querySelector("#mainCoverImg"))
          view.querySelector("#mainCoverImg").src = playlist.coverPath;

        await loadLibraryData(); // Tải lại thư viện để cập nhật sidebar
        modal.classList.remove("show");
        showToast("Playlist saved successfully!");
      } catch {
        showToast("Failed to update playlist", "error");
      }
    };
  }

  // Đóng modal
  const handleClose = () => {
    // Chỉ cần check nếu có thay đổi và chưa lưu
    if (
      isChanged &&
      (nameInput.value.trim() !== playlist.name ||
        descInput.value.trim() !== playlist.description)
    ) {
      showToast(
        "Press Save to keep your changes or close without saving",
        "warning"
      );
      return;
    }
    modal.classList.remove("show");
  };

  if (closeBtn) closeBtn.onclick = handleClose;
  modal.addEventListener("click", (e) => e.target === modal && handleClose());
}
