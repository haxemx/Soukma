export function ZelligeBackground({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="zellige-full" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Fond blanc */}
            <rect width="120" height="120" fill="white"/>
            {/* Étoile extérieure rouge */}
            <polygon points="60,2 70,30 98,20 88,48 116,58 88,68 98,96 70,86 60,114 50,86 22,96 32,68 4,58 32,48 22,20 50,30" fill="#e63946"/>
            {/* Étoile milieu orange */}
            <polygon points="60,15 68,35 88,28 80,48 100,56 80,64 88,84 68,77 60,97 52,77 32,84 40,64 20,56 40,48 32,28 52,35" fill="#f4a261"/>
            {/* Étoile intérieure turquoise */}
            <polygon points="60,28 66,42 80,37 74,51 88,57 74,63 80,77 66,72 60,86 54,72 40,77 46,63 32,57 46,51 40,37 54,42" fill="#00b4d8"/>
            {/* Carré central bleu */}
            <rect x="52" y="52" width="16" height="16" transform="rotate(45 60 60)" fill="#3a0ca3"/>
            {/* Centre jaune */}
            <circle cx="60" cy="60" r="5" fill="#ffd60a"/>
            {/* Lignes de grille */}
            <line x1="0" y1="0" x2="120" y2="120" stroke="#ccc" strokeWidth="0.4"/>
            <line x1="120" y1="0" x2="0" y2="120" stroke="#ccc" strokeWidth="0.4"/>
            <line x1="60" y1="0" x2="60" y2="120" stroke="#ccc" strokeWidth="0.4"/>
            <line x1="0" y1="60" x2="120" y2="60" stroke="#ccc" strokeWidth="0.4"/>
            {/* Coins - petites étoiles */}
            <polygon points="0,0 5,12 17,7 12,19 24,24 19,12 7,17 12,5" fill="#e63946"/>
            <polygon points="120,0 115,12 103,7 108,19 96,24 101,12 113,17 108,5" fill="#e63946"/>
            <polygon points="0,120 5,108 17,113 12,101 24,96 19,108 7,103 12,115" fill="#e63946"/>
            <polygon points="120,120 115,108 103,113 108,101 96,96 101,108 113,103 108,115" fill="#e63946"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zellige-full)"/>
      </svg>
    </div>
  );
}
