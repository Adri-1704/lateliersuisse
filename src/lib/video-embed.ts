/**
 * Convertit une URL vidéo "normale" (YouTube, Vimeo, ou fichier direct) en
 * une source embarquable. Volontairement générique — on ne sait pas encore
 * quel hébergeur sera utilisé pour les vidéos de présentation Just-Tag.
 */
export function getVideoEmbed(
  url: string
): { type: "iframe"; src: string } | { type: "video"; src: string } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./, "");

  // YouTube (youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/)
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    let videoId = "";
    if (host === "youtu.be") {
      videoId = u.pathname.slice(1);
    } else if (u.pathname.startsWith("/embed/")) {
      videoId = u.pathname.replace("/embed/", "");
    } else if (u.pathname.startsWith("/shorts/")) {
      videoId = u.pathname.replace("/shorts/", "");
    } else {
      videoId = u.searchParams.get("v") || "";
    }
    videoId = videoId.split("/")[0].split("?")[0];
    if (!videoId) return null;
    return { type: "iframe", src: `https://www.youtube.com/embed/${videoId}` };
  }

  // Vimeo (vimeo.com/12345, player.vimeo.com/video/12345)
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const videoId = u.pathname.split("/").filter(Boolean).pop();
    if (!videoId) return null;
    return { type: "iframe", src: `https://player.vimeo.com/video/${videoId}` };
  }

  // Fichier vidéo direct (Supabase Storage, S3, etc.)
  if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) {
    return { type: "video", src: url };
  }

  // Déjà une URL d'embed (ou hébergeur non reconnu) — on tente telle quelle
  return { type: "iframe", src: url };
}
