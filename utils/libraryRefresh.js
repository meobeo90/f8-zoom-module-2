import { loadLibraryData } from "./libraryLoad.js";

export function refreshLibrary() {
  const libraryContent = document.querySelector(".library-content");
  if (!libraryContent) return;

  loadLibraryData();
}
