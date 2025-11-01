import httpRequest from "./httpRequest.js";
import { escapeHTML } from "./utils.js";
import { initTooltip } from "./tooltips.js";

let isLibraryLoading = false;
export async function loadLibraryData() {
  if (isLibraryLoading) return;
  isLibraryLoading = true;

  const libraryContainer = document.querySelector(".library-content");
  if (!libraryContainer) return;

  const token = localStorage.getItem("access_token");
  const userString = localStorage.getItem("user");

  let user = null;
  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }
  }

  // Nếu chưa đăng nhập
  if (!token || !user) {
    libraryContainer.innerHTML = `
      <div class="library-empty">
        <p>Log in to create and share playlists.</p>
      </div>`;
    isLibraryLoading = false;
    return;
  }

  // Nếu đã đăng nhập → Clear container một lần duy nhất
  libraryContainer.innerHTML = "";

  // Load theo thứ tự cố định
  await loadLikedTracks(libraryContainer);
  await loadCreatedPlaylists(libraryContainer, user);
  await loadFollowedPlaylists(libraryContainer);
  await loadFollowedArtists(libraryContainer);

  // Gắn tooltip lại
  initTooltip(".tooltip-btn");
  isLibraryLoading = false;
}

// ===================== 1. LIKED SONGS =====================
async function loadLikedTracks(container) {
  try {
    const res = await httpRequest.get("me/tracks/liked");
    const tracks = res.data?.tracks || res.data || [];
    const total = res.data?.total || tracks.length || 0;

    const html = `
      <div class="library-item liked-songs-list tooltip-btn"
           data-tooltip="Play Liked Songs"
           data-placement="top"
           data-type="liked_tracks">
          <div class="item-icon liked-songs">
            <i class="fas fa-heart"></i>
          </div>
        <div class="item-info">
          <div class="item-title">Liked Songs</div>
          <div class="item-subtitle">
            <i class="fas fa-thumbtack"></i> Playlist • ${total} songs
          </div>
        </div>
      </div>`;
    container.insertAdjacentHTML("beforeend", html);
  } catch (error) {
    console.error("Error loading liked songs:", error);
  }
}

// ===================== 2. CREATED PLAYLISTS =====================
export async function loadCreatedPlaylists(container, currentUser) {
  try {
    const res = await httpRequest.get("me/playlists");
    const playlists = res.data?.playlists || res.data || [];

    if (!playlists.length) return;

    const currentUserName =
      currentUser?.display_name || currentUser?.email?.split("@")[0] || "You";

    const filteredPlaylists = playlists.filter((playlist) => {
      const isSystemPlaylist =
        playlist.name === "Liked Songs" || playlist.type === "liked_tracks";

      return !isSystemPlaylist;
    });

    filteredPlaylists.forEach((playlist) => {
      const creatorName =
        playlist.user_display_name || playlist.user_username || currentUserName;

      const html = `
        <div class="library-item created-playlist tooltip-btn"
             data-tooltip="Play ${escapeHTML(playlist.name)}"
             data-placement="top"
             data-type="playlist"
             data-id="${playlist.id}">
          <div class="item-icon playlist-icon">
            <img src="${
              playlist.image_url || "./img/placeholder-playlists.png"
            }"
                 alt="${escapeHTML(playlist.name)}"
                 onerror="this.onerror=null; this.src='./img/placeholder-playlists.png'">
          </div>
          <div class="item-info">
            <div class="item-title">${escapeHTML(playlist.name)}</div>
            <div class="item-subtitle">Playlist • ${escapeHTML(
              creatorName
            )}</div>
          </div>
        </div>`;
      container.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    console.error("Error loading created playlists:", error);
  }
}

// ===================== 3. FOLLOWED PLAYLISTS =====================
async function loadFollowedPlaylists(container) {
  try {
    const res = await httpRequest.get("me/playlists/followed");
    const playlists = res.data?.playlists || res.data || [];

    const filteredPlaylists = playlists.filter((playlist) => {
      const isSystemPlaylist =
        playlist.name === "Liked Songs" || playlist.type === "liked_tracks";

      return !isSystemPlaylist;
    });

    filteredPlaylists.forEach((playlist) => {
      // Xử lý tên người tạo cho playlist Followed
      const creatorName =
        playlist.user_display_name || playlist.user_username || "Unknown";

      const html = `
        <div class="library-item follow-playlist tooltip-btn"
             data-tooltip="Play ${escapeHTML(playlist.name)}"
             data-placement="top"
             data-type="playlist"
             data-id="${playlist.id}">
          <div class="item-icon playlist-icon">
            <img src="${
              playlist.image_url || "./img/placeholder-playlists.png"
            }"
                 alt="${escapeHTML(playlist.name)}"
                 onerror="this.onerror=null; this.src='./img/placeholder-playlists.png'">
          </div>
          <div class="item-info">
            <div class="item-title">${escapeHTML(playlist.name)}</div>
            <div class="item-subtitle">Playlist • ${escapeHTML(
              creatorName
            )}</div>
          </div>
        </div>`;
      container.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    console.error("Error loading followed playlists:", error);
  }
}

// ===================== 4. FOLLOWED ARTISTS =====================
async function loadFollowedArtists(container) {
  try {
    const res = await httpRequest.get("me/following");
    const artists = res.data?.artists || res.data || [];

    artists.forEach((artist) => {
      const html = `
        <div class="library-item follow-artist tooltip-btn"
             data-tooltip="Play ${artist.name}"
             data-placement="top"
             data-type="artist"
             data-id="${artist.id}">
          <div class="item-icon artist-icon">
            <img src="${artist.image_url || "./img/person-placeholder.jpg"}"
                 alt="${escapeHTML(artist.name)}"
                 onerror="this.onerror=null; this.src='./img/person-placeholder.jpg'">
          </div>
          <div class="item-info">
            <div class="item-title">${escapeHTML(artist.name)}</div>
            <div class="item-subtitle">Artist</div>
          </div>
        </div>`;
      container.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    console.error("Error loading followed artists:", error);
  }
}

// // ===================== 5. GẮN SỰ KIỆN CLICK CHO SIDEBAR =====================
// import { loadPlaylistDetail } from "./detailView.js";
// import { loadArtistDetail } from "./detailView.js"; // nếu bạn cũng dùng chung trong đó
// import { showToast } from "./toast.js";

// document.addEventListener("click", async (e) => {
//   const item = e.target.closest(".library-item");
//   if (!item) return;

//   const type = item.dataset.type;
//   const id = item.dataset.id;

//   // Lưu trạng thái để reload lại sau khi F5
//   localStorage.setItem("last_view", JSON.stringify({ type, id }));

//   try {
//     // === Playlist người dùng hoặc playlist follow ===
//     if (
//       type === "playlist" ||
//       type === "created_playlist" ||
//       type === "followed_playlist"
//     ) {
//       await loadPlaylistDetail(id);
//     }
//     // === Playlist "Liked Songs" ===
//     else if (type === "liked_tracks") {
//       const fakePlaylist = {
//         id: "liked_songs",
//         name: "Liked Songs",
//         image_url: "./img/liked-songs-cover.png",
//         user_display_name: "You",
//         is_public: 1,
//         tracks: [],
//       };
//       await loadPlaylistDetail(fakePlaylist.id);
//     }
//     // === Artist ===
//     else if (type === "artist") {
//       await loadArtistDetail(id);
//     }
//   } catch (error) {
//     console.error("Error loading item detail:", error);
//     showToast("Error loading content. Please try again.", "error");
//   }
// });

// ===================== 5. GẮN SỰ KIỆN CLICK CHO SIDEBAR =====================
import { loadPlaylistDetail, loadArtistDetail } from "./detailView.js";
import { showToast } from "./toast.js";

document.addEventListener("click", async (e) => {
  const item = e.target.closest(".library-item");
  if (!item) return;

  const type = item.dataset.type;
  const id = item.dataset.id;

  // Lưu trạng thái để reload lại sau khi F5
  localStorage.setItem("last_view", JSON.stringify({ type, id }));

  try {
    // === Playlist người dùng hoặc playlist follow ===
    if (
      type === "playlist" ||
      type === "created_playlist" ||
      type === "followed_playlist"
    ) {
      await loadPlaylistDetail(id);
    }

    // === Playlist "Liked Songs" ===
    else if (type === "liked_tracks") {
      await loadPlaylistDetail("liked_tracks");
    }

    // === Artist ===
    else if (type === "artist") {
      await loadArtistDetail(id);
    }
  } catch (error) {
    console.error("Error loading item detail:", error);
    showToast("Error loading content. Please try again.", "error");
  }
});
