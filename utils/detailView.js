import httpRequest from "./httpRequest.js";
import { setupActionButton } from "./libraryActions.js";
import { formatDuration, escapeHTML } from "./utils.js";
import { initHome } from "./renderHome.js";
import { showToast } from "./toast.js";
import { initTooltip } from "./tooltips.js";
// ===================== Ẩn / hiện section =====================
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

// ===================== LOAD PLAYLIST DETAIL =====================
export async function loadPlaylistDetail(id) {
  try {
    let playlist;

    // ===== Playlist đặc biệt: Liked Songs =====
    if (id === "liked-songs" || id === "liked_tracks") {
      const currentUser = JSON.parse(localStorage.getItem("user")) || {
        email: "You",
      };

      const likedRes = await httpRequest.get("me/tracks/liked");
      const likedTracks = likedRes.data?.tracks || likedRes.data || [];

      playlist = {
        id: "liked-songs",
        name: "Liked Songs",
        type: "Playlist",
        user_display_name:
          currentUser.display_name || currentUser.email?.split("@")[0],
        is_owner: true,
        is_liked_songs: true,
        tracks: likedTracks,
        total_tracks: likedTracks.length,
      };
    } else {
      // ===== Playlist bình thường =====
      const playlistRes = await httpRequest.get(`playlists/${id}`);
      playlist = playlistRes.data?.playlist || playlistRes.data;
      if (!playlist) return;

      // Nếu user_display_name null thì fallback từ localStorage
      if (!playlist.user_display_name) {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (currentUser) {
          playlist.user_display_name =
            currentUser.display_name ||
            currentUser.username ||
            currentUser.email?.split("@")[0] ||
            "You";
        }
      }

      const tracksRes = await httpRequest.get(`playlists/${id}/tracks`);
      const tracks = tracksRes.data?.tracks || tracksRes.data || [];
      playlist.tracks = tracks;
      playlist.total_tracks = tracks.length;
    }

    // Reset UI trước khi render
    const hero = document.querySelector(".playlist-hero");
    const trackList = document.querySelector(".popular-section .track-list");
    if (hero) hero.innerHTML = "";
    if (trackList) trackList.innerHTML = "";

    // Ẩn phần khác, hiện hero và danh sách bài hát
    toggleSections({
      show: [".playlist-hero", ".popular-section"],
      hide: [
        ".artists-section",
        ".hits-section",
        ".artist-hero",
        ".artist-controls",
      ],
    });

    // Render Hero + Track list
    renderPlaylistHero(playlist);
    renderTracks(playlist.tracks);
  } catch (error) {
    console.error("Error loading playlist detail:", error);
  }
}

// ===================== RENDER PLAYLIST HERO =====================
function renderPlaylistHero(playlist) {
  const hero = document.querySelector(".playlist-hero");
  if (!hero) return;

  const isLikedSongs = playlist.is_liked_songs;
  const isOwner = playlist.is_owner || playlist.is_created_by_user;

  // === Cover cho liked songs ===
  const coverHTML = isLikedSongs
    ? `
      <div class="playlist-cover liked-songs-cover">
        <div class="item-icon liked-songs">
          <i class="fas fa-heart"></i>
        </div>
      </div>`
    : `
      <div class="playlist-cover">
        <img src="${playlist.image_url || "./img/placeholder-playlists.png"}"
             alt="Playlist cover"
             onerror="this.src='./img/placeholder-playlists.png'" />
      </div>`;

  // === Không có action cho liked songs ===
  let actionsHTML = "";
  if (!isLikedSongs && isOwner) {
    actionsHTML = `
      <div class="playlist-actions created-playlist">
        <button class="btn-delete" id="playlist-delete-btn">
          <i class="fa-solid fa-trash tooltip-btn" data-tooltip="Delete playlist" data-placement="bottom"></i>
        </button>
      </div>`;
  } else if (!isLikedSongs && !isOwner) {
    actionsHTML = `
      <div class="playlist-actions followed-playlist">
        <button class="btn-save" id="playlist-save-btn">
          <i class="fa-solid fa-plus tooltip-btn" data-tooltip="Add to my library" data-placement="bottom"></i>
          <i class="fa-solid fa-check tooltip-btn" data-tooltip="Remove from my library" data-placement="bottom"></i>
        </button>
      </div>`;
  }

  hero.innerHTML = `
    <div class="playlist-header">
      ${coverHTML}
      <div class="playlist-info">
        <p class="playlist-type">Playlist</p>
        <h1 class="playlist-title">${playlist.name || "Untitled Playlist"}</h1>
        <p class="playlist-owner">${playlist.user_display_name || "Unknown"}</p>
        ${actionsHTML}
      </div>
    </div>
  `;

  initTooltip(".tooltip-btn");
  // === Thêm đường ngăn cách phía dưới ===
  hero.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
  hero.style.marginBottom = "20px";
  hero.style.paddingBottom = "20px";

  // Gắn sự kiện delete nếu có
  if (isOwner && !isLikedSongs) {
    const deleteBtn = hero.querySelector("#playlist-delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (!confirm("Are you sure to delete this playlist?")) return;
        await httpRequest.delete(`playlists/${playlist.id}`);
        showToast(`${playlist.name} deleted`, "success");
        toggleSections({
          show: [".hits-section", ".artists-section"],
          hide: [".playlist-hero", ".popular-section"],
        });
        initHome();
      });
    }
  }

  // Gắn sự kiện Follow/Unfollow nếu là playlist khác
  if (!isOwner && !isLikedSongs) {
    const saveBtn = hero.querySelector("#playlist-save-btn");
    setupActionButton(saveBtn, "playlist", playlist.id, playlist.is_followed);
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
      show: [".artist-hero", ".popular-section"],
      hide: [".artists-section", ".hits-section", ".playlist-hero"],
    });

    renderArtistHero(artist);
    renderTracks(artist.tracks);
  } catch (error) {
    console.error("Error loading artist detail:", error);
  }
}

// ===================== RENDER ARTIST HERO =====================
function renderArtistHero(artist) {
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
}

// ===================== RENDER TRACKS =====================
function renderTracks(tracks) {
  const trackList = document.querySelector(".popular-section .track-list");
  if (!trackList) return;

  if (!tracks || !tracks.length) {
    trackList.innerHTML = `<p>No tracks available</p>`;
    return;
  }

  trackList.innerHTML = tracks
    .map(
      (track, index) => `
      <div class="track-item">
        <div class="track-number">${index + 1}</div>
        <div class="track-image">
          <img
            src="${
              track.track_image_url ||
              track.image_url ||
              "./img/placeholder-playlists.png"
            }"
            alt="${escapeHTML(track.track_title || track.title)}"
            onerror="this.src='./img/placeholder-playlists.png'"
          />
        </div>
        <div class="track-info">
          <div class="track-name">${escapeHTML(
            track.track_title || track.title
          )}</div>
          <div class="track-artist">${escapeHTML(track.artist_name || "")}</div>
        </div>
        <div class="track-plays">${
          track.track_play_count?.toLocaleString() ||
          track.play_count?.toLocaleString() ||
          0
        }</div>
        <div class="track-duration">${formatDuration(
          track.track_duration || track.duration
        )}</div>
      </div>`
    )
    .join("");
}
