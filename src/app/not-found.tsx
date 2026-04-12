import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6 py-16 max-w-md mx-auto">
          {/* Swiss cross icon */}
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="16" y="6" width="8" height="28" rx="1" fill="white" />
              <rect x="6" y="16" width="28" height="8" rx="1" fill="white" />
            </svg>
          </div>

          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Page introuvable
          </h2>

          <p className="text-gray-500 mb-8 leading-relaxed">
            La page que vous recherchez n&apos;existe pas ou a ete deplacee.
          </p>

          <Link
            href="/fr"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white font-medium transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Retour a l&apos;accueil
          </Link>

          <p className="mt-12 text-sm text-gray-400">
            Just-Tag.app — Les meilleurs restaurants de Suisse
          </p>
        </div>
      </body>
    </html>
  );
}
