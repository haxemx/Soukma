export function ZelligeBackground({ opacity = 0.12 }: { opacity?: number }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity }}
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="zp" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="#fff8f0"/>
            {/* Étoile à 8 branches - couche rouge */}
            <polygon points="50,2 58,22 78,14 70,34 90,42 70,50 78,70 58,62 50,82 42,62 22,70 30,50 10,42 30,34 22,14 42,22" fill="#e63946" opacity="0.85"/>
            {/* Étoile à 8 branches - couche jaune */}
            <polygon points="50,12 57,28 73,22 67,38 83,44 67,50 73,66 57,60 50,76 43,60 27,66 33,50 17,44 33,38 27,22 43,28" fill="#ffd60a" opacity="0.85"/>
            {/* Étoile à 8 branches - couche turquoise */}
            <polygon points="50,22 56,34 68,30 64,42 76,47 64,52 68,64 56,60 50,72 44,60 32,64 36,52 24,47 36,42 32,30 44,34" fill="#00b4d8" opacity="0.85"/>
            {/* Étoile à 8 branches - couche bleue */}
            <polygon points="50,30 55,40 65,37 61,47 71,51 61,55 65,63 55,60 50,70 45,60 35,63 39,55 29,51 39,47 35,37 45,40" fill="#3a0ca3" opacity="0.7"/>
            {/* Centre orange */}
            <polygon points="50,38 54,46 62,44 58,52 62,56 54,54 50,62 46,54 38,56 42,52 38,44 46,46" fill="#f4a261" opacity="0.9"/>
            {/* Centre rouge vif */}
            <circle cx="50" cy="50" r="6" fill="#e63946" opacity="0.9"/>
            {/* Lignes blanches de séparation */}
            <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.8" opacity="0.6"/>
            <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.8" opacity="0.6"/>
            <line x1="0" y1="0" x2="100" y2="100" stroke="white" strokeWidth="0.8" opacity="0.4"/>
            <line x1="100" y1="0" x2="0" y2="100" stroke="white" strokeWidth="0.8" opacity="0.4"/>
            {/* Petites étoiles aux coins */}
            <polygon points="0,0 4,10 14,6 10,16 20,20 10,24 14,34 4,30 0,40 -4,30 -14,34 -10,24 -20,20 -10,16 -14,6 -4,10" fill="#e63946" opacity="0.85"/>
            <polygon points="100,0 104,10 114,6 110,16 120,20 110,24 114,34 104,30 100,40 96,30 86,34 90,24 80,20 90,16 86,6 96,10" fill="#e63946" opacity="0.85"/>
            <polygon points="0,100 4,110 14,106 10,116 20,120 10,124 14,134 4,130 0,140 -4,130 -14,134 -10,124 -20,120 -10,116 -14,106 -4,110" fill="#e63946" opacity="0.85"/>
            <polygon points="100,100 104,110 114,106 110,116 120,120 110,124 114,134 104,130 100,140 96,130 86,134 90,124 80,120 90,116 86,106 96,110" fill="#e63946" opacity="0.85"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zp)"/>
      </svg>
    </div>
  );
}
