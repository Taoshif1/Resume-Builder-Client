export function downloadBlob(blob, filename) {
  if (!(blob instanceof Blob) || blob.size === 0)
    throw new Error("The download is empty. Please try again.");

  let url;
  let link;
  try {
    url = URL.createObjectURL(blob);
    link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
  } catch {
    throw new Error("Unable to start the download. Please try again.");
  } finally {
    link?.remove();
    if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
