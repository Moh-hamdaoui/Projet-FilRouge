import Link from "next/link";

export default function BackHome() {
  return (
    <div>
      <Link
        href="/"
        className="group inline-flex items-center gap-2 mb-4 text-gray-400 hover:text-gray-200 text-md font-semibold transition-colors"
        aria-label="Retour à l’accueil"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 "
        >
          <path d="M9 15L3 9m0 0 6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>

        <span>Retour à l’accueil</span>
      </Link>
    </div>
  );
}
