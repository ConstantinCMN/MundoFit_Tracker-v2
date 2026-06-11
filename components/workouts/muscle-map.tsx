'use client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MuscleId =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'quads'
  | 'calves'
  | 'traps'
  | 'lats'
  | 'lower_back'
  | 'glutes'
  | 'hamstrings';

export type BodyView = 'front' | 'back';

type MuscleDef = {
  id: MuscleId;
  view: BodyView;
  paths: string[];
};

// ── Body silhouette paths ─────────────────────────────────────────────────────
// viewBox="0 0 200 420"

const BODY_PATH =
  'M88,48 L62,54 L28,62 L14,68 L8,148 L10,206 L24,208 ' +
  'L28,158 L44,84 L62,74 L64,78 L64,188 L58,208 L56,218 ' +
  'L60,308 L58,372 L56,384 L70,386 L76,374 L82,308 L88,222 ' +
  'L100,220 L112,222 L118,308 L124,374 L130,386 L144,384 ' +
  'L142,372 L140,308 L144,218 L142,208 L136,188 L136,78 ' +
  'L138,74 L156,84 L172,158 L176,208 L190,206 L192,148 ' +
  'L186,68 L172,62 L138,54 L112,48 Z';

// ── Muscle path definitions ───────────────────────────────────────────────────

const MUSCLES: MuscleDef[] = [
  // ── FRONT ──────────────────────────────────────────────────────────────────
  {
    id: 'chest',
    view: 'front',
    paths: [
      // Left pec
      'M64,78 Q55,78 53,89 L55,110 Q62,120 80,118 L82,86 Q78,78 64,78 Z',
      // Right pec
      'M136,78 Q145,78 147,89 L145,110 Q138,120 120,118 L118,86 Q122,78 136,78 Z',
    ],
  },
  {
    id: 'shoulders',
    view: 'front',
    paths: [
      // Left anterior deltoid
      'M28,62 Q14,64 10,78 L12,100 Q22,108 40,103 L48,82 Q46,62 28,62 Z',
      // Right anterior deltoid
      'M172,62 Q186,64 190,78 L188,100 Q178,108 160,103 L152,82 Q154,62 172,62 Z',
    ],
  },
  {
    id: 'biceps',
    view: 'front',
    paths: [
      // Left
      'M14,110 Q6,114 6,132 L8,155 Q16,162 30,158 L36,134 Q38,110 26,108 Z',
      // Right
      'M186,110 Q194,114 194,132 L192,155 Q184,162 170,158 L164,134 Q162,110 174,108 Z',
    ],
  },
  {
    id: 'forearms',
    view: 'front',
    paths: [
      // Left
      'M10,168 Q4,172 4,186 L6,204 Q14,209 26,207 L30,188 Q32,168 22,166 Z',
      // Right
      'M190,168 Q196,172 196,186 L194,204 Q186,209 174,207 L170,188 Q168,168 178,166 Z',
    ],
  },
  {
    id: 'abs',
    view: 'front',
    paths: [
      'M76,122 Q72,122 72,126 L72,188 Q72,192 76,192 L124,192 Q128,192 128,188 L128,126 Q128,122 124,122 Z',
    ],
  },
  {
    id: 'quads',
    view: 'front',
    paths: [
      // Left
      'M60,222 Q50,226 48,244 L50,302 Q58,310 78,307 L84,244 Q88,222 72,220 Z',
      // Right
      'M140,222 Q150,226 152,244 L150,302 Q142,310 122,307 L116,244 Q112,222 128,220 Z',
    ],
  },
  {
    id: 'calves',
    view: 'front',
    paths: [
      // Left
      'M52,316 Q44,320 44,338 L48,366 Q56,372 74,369 L78,342 Q80,316 66,314 Z',
      // Right
      'M148,316 Q156,320 156,338 L152,366 Q144,372 126,369 L122,342 Q120,316 134,314 Z',
    ],
  },

  // ── BACK ───────────────────────────────────────────────────────────────────
  {
    id: 'traps',
    view: 'back',
    paths: [
      'M76,56 Q62,58 58,72 L60,96 Q70,106 100,108 Q130,106 140,96 L142,72 Q138,58 124,56 Z',
    ],
  },
  {
    id: 'shoulders',
    view: 'back',
    paths: [
      // Left posterior deltoid
      'M28,62 Q14,64 10,78 L12,100 Q22,108 40,103 L48,82 Q46,62 28,62 Z',
      // Right posterior deltoid
      'M172,62 Q186,64 190,78 L188,100 Q178,108 160,103 L152,82 Q154,62 172,62 Z',
    ],
  },
  {
    id: 'lats',
    view: 'back',
    paths: [
      // Left lat
      'M64,108 Q52,112 50,130 L52,180 Q60,192 82,190 L88,130 Q90,110 76,106 Z',
      // Right lat
      'M136,108 Q148,112 150,130 L148,180 Q140,192 118,190 L112,130 Q110,110 124,106 Z',
    ],
  },
  {
    id: 'triceps',
    view: 'back',
    paths: [
      // Left
      'M16,110 Q8,114 8,132 L10,155 Q18,162 32,158 L38,134 Q40,110 28,108 Z',
      // Right
      'M184,110 Q192,114 192,132 L190,155 Q182,162 168,158 L162,134 Q160,110 172,108 Z',
    ],
  },
  {
    id: 'lower_back',
    view: 'back',
    paths: [
      'M74,194 Q68,194 68,200 L68,228 Q70,234 78,234 L122,234 Q130,234 132,228 L132,200 Q132,194 126,194 Z',
    ],
  },
  {
    id: 'glutes',
    view: 'back',
    paths: [
      // Left
      'M60,222 Q50,226 48,244 L50,268 Q58,278 82,274 L86,246 Q90,222 74,220 Z',
      // Right
      'M140,222 Q150,226 152,244 L150,268 Q142,278 118,274 L114,246 Q110,222 126,220 Z',
    ],
  },
  {
    id: 'hamstrings',
    view: 'back',
    paths: [
      // Left
      'M52,278 Q44,282 42,298 L44,308 Q52,315 74,311 L80,298 Q82,280 68,276 Z',
      // Right
      'M148,278 Q156,282 158,298 L156,308 Q148,315 126,311 L120,298 Q118,280 132,276 Z',
    ],
  },
  {
    id: 'calves',
    view: 'back',
    paths: [
      // Left
      'M52,316 Q44,320 44,338 L48,366 Q56,372 74,369 L78,342 Q80,316 66,314 Z',
      // Right
      'M148,316 Q156,320 156,338 L152,366 Q144,372 126,369 L122,342 Q120,316 134,314 Z',
    ],
  },
  {
    id: 'forearms',
    view: 'back',
    paths: [
      // Left
      'M10,168 Q4,172 4,186 L6,204 Q14,209 26,207 L30,188 Q32,168 22,166 Z',
      // Right
      'M190,168 Q196,172 196,186 L194,204 Q186,209 174,207 L170,188 Q168,168 178,166 Z',
    ],
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

type MuscleMapProps = {
  view: BodyView;
  selected: Set<MuscleId>;
  onToggle: (id: MuscleId) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function MuscleMap({ view, selected, onToggle }: MuscleMapProps) {
  const visibleMuscles = MUSCLES.filter((m) => m.view === view);

  // Merge bilateral muscles so each ID is only clickable once
  const uniqueIds = [...new Set(visibleMuscles.map((m) => m.id))];

  return (
    <svg
      viewBox="0 0 200 420"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      style={{ maxHeight: '340px' }}
    >
      <defs>
        <filter id="muscle-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Body silhouette */}
      <circle
        cx="100"
        cy="27"
        r="21"
        fill="#1c1c1c"
        stroke="#2e2e2e"
        strokeWidth="1.5"
      />
      <path
        d={BODY_PATH}
        fill="#1c1c1c"
        stroke="#2e2e2e"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Muscle zones — rendered per unique ID so groups share selection state */}
      {uniqueIds.map((id) => {
        const isSelected = selected.has(id);
        const defs = visibleMuscles.filter((m) => m.id === id);

        return (
          <g
            key={`${view}-${id}`}
            onClick={() => onToggle(id)}
            style={{ cursor: 'pointer' }}
          >
            {defs.flatMap((def, di) =>
              def.paths.map((d, pi) => (
                <path
                  key={`${di}-${pi}`}
                  d={d}
                  fill={isSelected ? '#aaff00' : 'rgba(255,255,255,0.09)'}
                  stroke={isSelected ? '#aaff00' : 'rgba(255,255,255,0.18)'}
                  strokeWidth="0.8"
                  style={{
                    transition: 'fill 0.18s ease, stroke 0.18s ease',
                    filter: isSelected ? 'url(#muscle-glow)' : 'none',
                  }}
                />
              ))
            )}
            {/* Invisible hit-area overlay for easier tapping */}
            {defs.flatMap((def, di) =>
              def.paths.map((d, pi) => (
                <path
                  key={`hit-${di}-${pi}`}
                  d={d}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: 'pointer' }}
                />
              ))
            )}
          </g>
        );
      })}
    </svg>
  );
}
