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
  const user = localStorage.getItem("user");

  // Nếu chưa đăng nhập
  if (!token || !user) {
    libraryContainer.innerHTML = `
      <div class="library-empty">
        <p>Log in to create and share playlists.</p>
      </div>`;
    isLibraryLoading = false;
    return;
  }

  // Nếu đã đăng nhập → Clear trước để tránh trùng
  libraryContainer.innerHTML = "";

  // Load theo thứ tự cố định
  await loadLikedTracks(libraryContainer);
  await loadCreatedPlaylists(libraryContainer);
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
    const total = tracks.length;

    // Kiểm tra tránh lặp
    if (container.querySelector(".liked-songs-list")) return;

    const html = `
      <div class="library-item liked-songs-list tooltip-btn"
           data-tooltip="Play Liked Songs"
           data-placement="top"
           data-type="likedsongs">
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
async function loadCreatedPlaylists(container) {
  try {
    const res = await httpRequest.get("me/playlists");
    const playlists = res.data?.playlists || res.data || [];

    playlists.forEach((playlist) => {
      const html = `
        <div class="library-item created-playlist tooltip-btn"
             data-tooltip="Play ${playlist.name}"
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
            <div class="item-subtitle">By ${escapeHTML(
              playlist.user_display_name || playlist.user_username || "You"
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

    playlists.forEach((playlist) => {
      const html = `
        <div class="library-item follow-playlist tooltip-btn"
             data-tooltip="Play ${playlist.name}"
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
              playlist.user_display_name || playlist.user_username || "Unknown"
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
