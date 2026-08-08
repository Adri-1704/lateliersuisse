import { Video, PlayCircle } from "lucide-react";
import { TUTORIAL_VIDEOS } from "@/data/tutorial-videos";
import { getVideoEmbed } from "@/lib/video-embed";

export default function VideosPage() {
  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #e85d26, #ff8c5a)" }}>
          <Video className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Prise en main</h1>
          <p className="text-[13px] text-gray-400">
            Vidéos de présentation Just-Tag — découvrez comment tirer le meilleur de la plateforme pour votre restaurant.
          </p>
        </div>
      </div>

      {TUTORIAL_VIDEOS.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white py-16 text-center" style={{ border: "1.5px solid #eaecf0" }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#fff3ee" }}>
            <PlayCircle className="h-7 w-7" style={{ color: "#e85d26" }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Bientôt disponible</h3>
          <p className="max-w-sm text-sm text-gray-400">
            Les premières vidéos de présentation arrivent prochainement — elles apparaîtront ici automatiquement.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {TUTORIAL_VIDEOS.map((video) => {
            const embed = getVideoEmbed(video.url);
            return (
              <div key={video.id} className="overflow-hidden rounded-2xl bg-white" style={{ border: "1.5px solid #eaecf0" }}>
                <div className="relative aspect-video bg-gray-900">
                  {embed?.type === "iframe" ? (
                    <iframe
                      src={embed.src}
                      title={video.title}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : embed?.type === "video" ? (
                    <video src={embed.src} controls className="absolute inset-0 h-full w-full" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                      Vidéo indisponible
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{video.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{video.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
