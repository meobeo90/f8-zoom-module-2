import httpRequest from "./httpRequest.js";
import { setupActionButton } from "./libraryActions.js";
import { formatDuration, escapeHTML } from "./utils.js";

// ===================== RENDER SECTIONS =====================
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

// ===================== LOAD CREATED PLAYLISTS (SIDEBAR) =====================
export async function loadCreatedPlaylists(container) {
  try {
    const res = await httpRequest.get("me/playlists");
    const playlists = res.data?.playlists || res.data || [];

    // Xóa nội dung cũ trước khi render lại
    container.innerHTML = "";

    // Nếu chưa có playlist nào → hiển thị mặc định “Liked Songs”
    if (!playlists.length) {
      container.innerHTML = `
        <div class="library-item created-playlist tooltip-btn"
             data-tooltip="Your Liked Songs"
             data-placement="top"
             data-type="liked">
          <div class="item-icon playlist-icon">
            <img src="./img/liked-songs.png" alt="Liked Songs">
          </div>
          <div class="item-info">
            <div class="item-title">Liked Songs</div>
            <div class="item-subtitle">Playlist by You</div>
          </div>
        </div>`;
      return;
    }

    // Có playlist → render toàn bộ
    playlists.forEach((playlist) => {
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

// ===================== LOAD PLAYLIST DETAIL =====================
export async function loadPlaylistDetail(id) {
  try {
    const playlistRes = await httpRequest.get(`playlists/${id}`);
    const playlist = playlistRes.data?.playlist || playlistRes.data;
    if (!playlist) return;

    const tracksRes = await httpRequest.get(`playlists/${id}/tracks`);
    const tracks = tracksRes.data?.tracks || tracksRes.data;
    playlist.total_tracks = tracks.length;
    playlist.tracks = tracks;

    toggleSections({
      show: [".playlist-hero", ".playlist-controls", ".popular-section"],
      hide: [
        ".artists-section",
        ".hits-section",
        ".artist-hero",
        ".artist-controls",
      ],
    });

    updatePlaylistDetail(playlist);
  } catch (error) {
    console.error("Error loading playlist detail:", error);
  }
}

// ===================== LOAD ARTIST DETAIL =====================
export async function loadArtistDetail(id) {
  try {
    const artistRes = await httpRequest.get(`artists/${id}`);
    const artist = artistRes.data?.artist || artistRes.data;

    const tracksRes = await httpRequest.get(`artists/${id}/tracks/popular`);
    const tracks = tracksRes.data?.tracks || [];

    artist.tracks = tracks;

    toggleSections({
      show: [".artist-hero", ".artist-controls", ".popular-section"],
      hide: [
        ".artists-section",
        ".hits-section",
        ".playlist-hero",
        ".playlist-controls",
      ],
    });

    updateArtistDetail(artist);
  } catch (error) {
    console.error("Error loading artist detail:", error);
  }
}

// ===================== UPDATE PLAYLIST DETAIL =====================
export function updatePlaylistDetail(playlist) {
  const playlistHero = document.querySelector(".playlist-hero");
  const heroImg = playlistHero?.querySelector(".hero-image");
  const playlistTitle = playlistHero?.querySelector(".playlist-title");
  const trackList = document.querySelector(".track-list");
  const playlistCreator = playlistHero?.querySelector(".playlist-creator-name");
  const saveBtn = document.querySelector("#playlist-save-btn");

  if (heroImg) {
    heroImg.src = playlist.image_url || "./img/placeholder-playlists.png";
    heroImg.onerror = function () {
      this.onerror = null;
      this.src = "./img/placeholder-playlists.png";
    };
  }

  if (playlistTitle) playlistTitle.textContent = playlist.name || "Playlist";

  if (playlistCreator)
    playlistCreator.textContent = `Creator: ${
      playlist.user_display_name || playlist.user_username || "Unknown"
    }`;

  setupActionButton(saveBtn, "playlist", playlist.id, playlist.is_following);

  const tracks = playlist.tracks || [];
  renderPlaylistsTracks(trackList, tracks);
}

function renderPlaylistsTracks(tracksList, tracks) {
  if (!tracksList) return;
  if (tracks.length === 0) {
    tracksList.innerHTML = `<p>No tracks available</p>`;
    return;
  }

  tracksList.innerHTML = tracks
    .map(
      (track, index) =>
        `<div class="track-item">
          <div class="track-number">${index + 1}</div>
          <div class="track-image">
            <img
              src="${
                track.track_image_url || "./img/placeholder-playlists.png"
              }"
              alt="${escapeHTML(track.track_title)}"
              onerror="this.onerror=null; this.src='./img/placeholder-playlists.png'">
          </div>
          <div class="track-info">
            <div class="track-name">${escapeHTML(track.track_title)}</div>
            <div class="track-artist">${escapeHTML(
              track.artist_name || ""
            )}</div>
          </div>
          <div class="track-plays">${
            track.track_play_count?.toLocaleString() || 0
          }</div>
          <div class="track-duration">${formatDuration(
            track.track_duration
          )}</div>
        </div>`
    )
    .join("");
}

function updateArtistDetail(artist) {
  const heroImg = document.querySelector(".artist-hero .hero-image");
  const artistName = document.querySelector(".artist-hero .artist-name");
  const monthlyListeners = document.querySelector(
    ".artist-hero .monthly-listeners"
  );
  const followBtn = document.querySelector("#artist-follow-btn");

  if (heroImg) {
    heroImg.src = artist.background_image_url || "placeholder.svg";
    heroImg.onerror = () => (heroImg.src = "placeholder.svg");
  }

  if (artistName) artistName.textContent = artist.name;
  if (monthlyListeners)
    monthlyListeners.textContent = `${
      artist.monthly_listeners?.toLocaleString() || 0
    } monthly listeners`;

  setupActionButton(followBtn, "artist", artist.id, artist.is_following);

  const trackList = document.querySelector(".track-list");
  const tracks = artist.tracks || [];

  if (!trackList) return;

  if (!tracks.length) {
    trackList.innerHTML = `<p>No tracks available</p>`;
    return;
  }

  trackList.innerHTML = tracks
    .map(
      (track, index) =>
        `<div class="track-item">
          <div class="track-number">${index + 1}</div>
          <div class="track-image">
            <img src="${track.image_url || "./img/placeholder-playlists.png"}"
                 onerror="this.src='./img/placeholder-playlists.png'"
                 alt="${escapeHTML(track.title)}" />
          </div>
          <div class="track-info">
            <div class="track-name">${escapeHTML(track.title)}</div>
          </div>
          <div class="track-plays">${
            track.play_count?.toLocaleString() || 0
          }</div>
          <div class="track-duration">${formatDuration(
            track.track_duration || track.duration
          )}</div>
        </div>`
    )
    .join("");
}
