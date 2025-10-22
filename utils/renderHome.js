import httpRequest from "./httpRequest.js";
import { loadPlaylistDetail, loadArtistDetail } from "./detailView.js";
import { escapeHTML } from "./utils.js";
import { loadLibraryData } from "./libraryLoad.js";

// ===================== MAIN FUNCTION =====================
export async function initHome() {
  const playlistsContainer = document.querySelector(".hits-grid");
  const artistsContainer = document.querySelector(".artists-grid");

  // Load dữ liệu ban đầu
  await loadHomeData(playlistsContainer, artistsContainer);
  // Thiết lập sự kiện click chi tiết
  setupDetailListeners(playlistsContainer, artistsContainer);
  // Thiết lập sự kiện quay về Home
  setupHomeNavigation();
  // Gọi Library
  await loadLibraryData();
  // Xử lý điều hướng Hash khi F5 hoặc lần đầu load trang
  handleHashNavigation();
}

// ===================== LOAD HOME DATA =====================
async function loadHomeData(playlistsContainer, artistsContainer) {
  // Lấy dữ liệu Playlists
  try {
    const playlistsRes = await httpRequest.get("playlists");
    const playlists = playlistsRes.data?.playlists || [];
    if (playlistsRes.status === 200 && playlists.length) {
      renderPlaylists(playlists, playlistsContainer);
    } else {
      playlistsContainer.innerHTML = `<p>No playlist found</p>`;
    }
  } catch (error) {
    console.error("Error loading Playlists:", error);
  }

  // Lấy dữ liệu Artists
  try {
    const artistsRes = await httpRequest.get("artists");
    const artists = artistsRes.data?.artists || [];
    if (artistsRes.status === 200 && artists.length) {
      renderArtists(artists, artistsContainer);
    } else {
      artistsContainer.innerHTML = `<p>No artist found</p>`;
    }
  } catch (error) {
    console.error("Error loading artists:", error);
  }
}

// ===================== DETAIL LISTENERS =====================
function setupDetailListeners(playlistsContainer, artistsContainer) {
  // Xem chi tiết playlist
  playlistsContainer.addEventListener("click", async (e) => {
    const card = e.target.closest(".hit-card");
    if (!card) return;
    const id = card.dataset.id;
    window.location.hash = `#playlist/${id}`;

    loadPlaylistDetail(id);
  });

  // Xem chi tiết artist
  artistsContainer.addEventListener("click", async (e) => {
    const card = e.target.closest(".artist-card");
    if (!card) return;
    const id = card.dataset.id;
    window.location.hash = `#artist/${id}`;

    loadArtistDetail(id);
  });
}

// ===================== HOME NAVIGATION =====================
function setupHomeNavigation() {
  // Quay về Home khi click nút Logo và Home
  const backHomeBtn = document.querySelectorAll(".logo i , .home-btn");
  backHomeBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.hash = ""; // Xóa hash
      showHome();
    });
  });
}

// ===================== HASH HANDLER =====================
function handleHashNavigation() {
  const hash = window.location.hash;

  if (hash.startsWith("#playlist/")) {
    const id = hash.split("/")[1];
    loadPlaylistDetail(id);
  } else if (hash.startsWith("#artist/")) {
    const id = hash.split("/")[1];
    loadArtistDetail(id);
  } else {
    if (hash && hash !== "#") {
      // Nếu có hash nhưng không phải format playlist/artist, xóa hash
      window.location.hash = "";
    }
    showHome();
  }
}

// ===================== SHOW HOME =====================
export function showHome() {
  toggleSections({
    show: [".artists-section", ".hits-section"],
    hide: [
      ".artist-hero",
      ".artist-controls",
      ".playlist-hero",
      ".playlist-controls",
      ".popular-section",
    ],
  });
}

// Hàm ẩn/hiện giao diện
function toggleSections({ show = [], hide = [] }) {
  hide.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) el.classList.add("hidden");
  });

  show.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) el.classList.remove("hidden");
  });
}

// ===================== RENDER HOME CARDS =====================

// Hàm render Playlists
function renderPlaylists(playlists, containter) {
  if (!containter) return;
  containter.innerHTML = playlists
    .map(
      (playlist) =>
        `<div class="hit-card" data-id="${playlist.id}">
          <div class="hit-card-cover">
            <img
              src="${playlist.image_url || "./img/placeholder-playlists.png"}"
              alt="${escapeHTML(playlist.name)}"
              onerror="this.onerror=null; this.src='./img/placeholder-playlists.png'"
            />
            <button class="hit-play-btn" type="button"><i class="fas fa-play"></i></button>
          </div>
          <div class="hit-card-info">
            <h3 class="hit-card-title">${escapeHTML(playlist.name)}</h3>
            <p class="hit-card-artist">${escapeHTML(
              playlist.user_display_name || playlist.user_username || "Unknown"
            )}</p>
          </div>
        </div>`
    )
    .join("");
}

function renderArtists(artists, containter) {
  if (!containter) return;
  containter.innerHTML = artists
    .map(
      (artist) =>
        `<div class="artist-card" data-id="${artist.id}">
          <div class="artist-card-cover">
            <img
              src="${artist.image_url || "./img/person-placeholder.jpg"}"
              alt="${escapeHTML(artist.name)}"
              onerror="this.onerror=null; this.src='./img/person-placeholder.jpg'"
            />
            <button class="artist-play-btn" type="button"><i class="fas fa-play"></i></button>
          </div>
          <div class="artist-card-info">
            <h3 class="artist-card-name">${escapeHTML(artist.name)}</h3>
            <p class="artist-card-type">Artist</p>
          </div>
        </div>`
    )
    .join("");
}
