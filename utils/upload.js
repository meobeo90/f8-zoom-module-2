import httpRequest from "./httpRequest.js";
import { showToast } from "./toast.js";

export async function uploadPlaylistCover(playlistId, file) {
  if (!file || !playlistId) {
    console.warn("Missing playlistID or file!");
    return null;
  }

  const formData = new FormData();
  formData.append("cover", file);
  try {
    const res = await httpRequest.post(
      `upload/playlist/${playlistId}/cover`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const fileData = res?.data?.file || res?.file;
    const imageUrl = fileData?.url;
    if (!imageUrl) throw new Error("Missing file URL in response");

    showToast("Playlist cover uploaded successfully", "success");
    return {
      image_url: imageUrl,
      playlist_id: res?.data?.playlist_id || res?.playlist_id || playlistId,
      filename: fileData?.filename || null,
    };
  } catch (error) {
    console.error("Upload cover failed:", error);
    showToast("Failed to upload playlist cover", "error");
    return null;
  }
}
