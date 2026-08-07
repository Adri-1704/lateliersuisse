export interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  /** URL YouTube, Vimeo, ou lien direct vers un fichier vidéo (.mp4...). */
  url: string;
}

/**
 * Vidéos de présentation de la plateforme, à destination des restaurateurs.
 * Liste tenue à jour manuellement — ajouter une entrée ici (via Claude Code
 * ou directement) à chaque nouvelle vidéo produite par Adrien.
 */
export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  // Exemple, à dupliquer/adapter pour chaque nouvelle vidéo :
  // {
  //   id: "prise-en-main",
  //   title: "Prise en main de Just-Tag",
  //   description: "Découvrez votre espace restaurant en 3 minutes : fiche, photos, offres et WhatsApp.",
  //   url: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  // },
];
