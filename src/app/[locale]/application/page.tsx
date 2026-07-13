import Image from "next/image";

const slides = [
  {
    src: "/pitch/Tableau de bord.png",
    title: "Tableau de bord",
    caption: "Vue d'ensemble de votre activité — statistiques, abonnés, historique des envois.",
  },
  {
    src: "/pitch/Message Whasapp.png",
    title: "Envoi WhatsApp",
    caption: "Rédigez votre message, ajoutez une photo, choisissez vos destinataires et envoyez en un clic.",
  },
  {
    src: "/pitch/QR code.png",
    title: "QR Code d'inscription",
    caption: "Chaque restaurant dispose de son QR code unique. Le client scanne, s'inscrit en 10 secondes.",
  },
  {
    src: "/pitch/Happy hours du jour.png",
    title: "Happy Hours",
    caption: "Publiez vos offres happy hours directement depuis le dashboard.",
  },
  {
    src: "/pitch/Offres du moment.png",
    title: "Offres du moment",
    caption: "Mettez en avant vos promotions et événements en temps réel.",
  },
  {
    src: "/pitch/Carte du restaurant.png",
    title: "Carte du restaurant",
    caption: "Votre menu en ligne, toujours à jour, visible par vos clients.",
  },
  {
    src: "/pitch/Inspiration IA.png",
    title: "Inspiration IA",
    caption: "Des suggestions de contenus générées par l'IA pour alimenter votre communication.",
  },
  {
    src: "/pitch/Photos.png",
    title: "Gestion des photos",
    caption: "Ajoutez et organisez les photos de votre restaurant pour attirer vos clients.",
  },
];

export default function PitchPage() {
  return (
    <main style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "60px 24px 40px" }}>
        <div style={{ display: "inline-block", background: "#18cb96", borderRadius: "12px", padding: "10px 20px", marginBottom: "24px" }}>
          <span style={{ color: "#000", fontWeight: 700, fontSize: "15px", letterSpacing: "0.05em" }}>JUST-TAG</span>
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.2 }}>
          Comment remplir les tables de son restaurant avec Just-Tag.app ?
        </h1>
        <p style={{ color: "#888", fontSize: "18px", maxWidth: "560px", margin: "0 auto 8px" }}>
          Connectez-vous directement à vos clients, sans algorithme.
        </p>
        <a
          href="https://just-tag.app"
          style={{ color: "#18cb96", fontSize: "15px", textDecoration: "none", fontWeight: 500 }}
        >
          just-tag.app →
        </a>
      </div>

      {/* Slides */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: "80px" }}>
        {slides.map((slide, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#18cb96", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 600, margin: 0 }}>{slide.title}</h2>
            </div>
            <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #222", background: "#111" }}>
              <Image
                src={slide.src}
                alt={slide.title}
                width={1920}
                height={1080}
                style={{ width: "100%", height: "auto", display: "block" }}
                unoptimized
              />
            </div>
            <p style={{ color: "#999", fontSize: "16px", margin: 0, lineHeight: 1.6 }}>{slide.caption}</p>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ textAlign: "center", padding: "60px 24px", borderTop: "1px solid #1a1a1a" }}>
        <p style={{ color: "#555", fontSize: "14px", marginBottom: "16px" }}>Intéressé par Just-Tag pour votre réseau ?</p>
        <a
          href="mailto:adrien@apiant.com"
          style={{
            display: "inline-block",
            background: "#18cb96",
            color: "#000",
            fontWeight: 700,
            fontSize: "15px",
            padding: "14px 32px",
            borderRadius: "10px",
            textDecoration: "none",
          }}
        >
          Contacter Adrien
        </a>
      </div>
    </main>
  );
}
