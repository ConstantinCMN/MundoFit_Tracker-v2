'use client';

// ─────────────────────────────────────────────────────────────────────────────
// MuscleMap — SVG-asset-driven interactive body map
//
// HOW IT WORKS
// ────────────
// This component fetches a pre-built anatomical SVG from the public folder,
// injects it inline, then wires up interaction by querying data-muscle attrs.
// No path data lives in this file — all anatomy comes from the SVG assets.
//
// TO ACTIVATE WITH REAL ANATOMY
// ──────────────────────────────
// 1. Place your SVG files here:
//      public/anatomy/front.svg   (anterior view)
//      public/anatomy/back.svg    (posterior view)
//
// 2. Tag every interactive muscle region with:
//      data-muscle="<muscleId>"
//
//    Supported muscle IDs and which view they belong to:
//
//    FRONT view              BACK view
//    ──────────────────      ──────────────────────
//    chest                   traps
//    shoulders               shoulders  (rear delt)
//    biceps                  triceps
//    forearms                forearms
//    abs                     lats
//    quads                   lower_back
//    calves                  glutes
//                            hamstrings
//                            calves
//
// 3. Multiple <path> elements may share the same data-muscle value
//    (e.g., left pec and right pec both get data-muscle="chest").
//
// 4. Elements WITHOUT data-muscle are decorative — they render normally
//    and receive no click handling or highlight styling.
//
// VISUAL CONTRACT
// ───────────────
// The component applies inline styles to [data-muscle] elements only.
// Your SVG controls everything else: body colour, stroke, gradients, etc.
// Selected muscles receive:
//   fill   → #aaff00
//   stroke → rgba(170,255,0,0.55)
//   filter → drop-shadow glow
// Unselected muscles receive:
//   fill   → rgba(255,255,255,0.11)
//   stroke → rgba(255,255,255,0.20)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';

// ── Public types (consumed by generator-client.tsx — do not rename) ───────────

export type MuscleId =
  | 'chest' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'abs'   | 'quads'     | 'calves'
  | 'traps' | 'lats'      | 'lower_back' | 'glutes' | 'hamstrings';

export type BodyView = 'front' | 'back';

// ── Muscle ID registry ────────────────────────────────────────────────────────
// Every data-muscle value the component will recognise and route to onToggle.

const VALID_IDS = new Set<MuscleId>([
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs',   'quads',     'calves',
  'traps', 'lats',      'lower_back', 'glutes', 'hamstrings',
]);

// ── Visual tokens ─────────────────────────────────────────────────────────────

const SEL_FILL    = '#aaff00';
const UNSEL_FILL  = 'rgba(255,255,255,0.11)';
const SEL_STROKE  = 'rgba(170,255,0,0.55)';
const UNSEL_STROKE= 'rgba(255,255,255,0.20)';
const SEL_FILTER  = 'drop-shadow(0 0 7px rgba(170,255,0,0.65))';
const TRANSITION  = 'fill 0.18s ease, stroke 0.18s ease, filter 0.18s ease';

// ── Component ─────────────────────────────────────────────────────────────────

type MuscleMapProps = {
  view: BodyView;
  selected: Set<MuscleId>;
  onToggle: (id: MuscleId) => void;
};

export function MuscleMap({ view, selected, onToggle }: MuscleMapProps) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const toggleRef  = useRef(onToggle);
  const selectedRef= useRef(selected);

  useEffect(() => { toggleRef.current  = onToggle;  });
  useEffect(() => { selectedRef.current = selected; });

  // 1. Fetch and inject SVG on mount.
  //    Parent uses key={view} on the wrapping motion.div, so this component
  //    fully unmounts/remounts on view change — [view] dependency is for safety.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let cancelled = false;

    fetch(`/anatomy/${view}.svg`)
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(html => {
        if (cancelled) return;
        wrap.innerHTML = html;
        const svgEl = wrap.querySelector('svg');
        if (svgEl) {
          svgEl.setAttribute('width',  '100%');
          svgEl.setAttribute('height', '100%');
          svgEl.style.display = 'block';
        }
        applyStyles(wrap, selectedRef.current);
      })
      .catch(() => {
        if (!cancelled) wrap.innerHTML = makePlaceholder(view);
      });

    return () => { cancelled = true; };
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Re-apply styles whenever selection changes (no re-fetch).
  useEffect(() => {
    if (wrapRef.current) applyStyles(wrapRef.current, selected);
  }, [selected]);

  // 3. Delegated click handler — attached once, reads latest onToggle via ref.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const handle = (e: MouseEvent) => {
      const hit = (e.target as Element).closest('[data-muscle]');
      if (!hit) return;
      const id = hit.getAttribute('data-muscle') as MuscleId;
      if (VALID_IDS.has(id)) toggleRef.current(id);
    };
    wrap.addEventListener('click', handle);
    return () => wrap.removeEventListener('click', handle);
  }, []); // no deps — stable via ref

  return (
    <div
      ref={wrapRef}
      className="w-full select-none flex items-center justify-center"
      style={{ height: '390px' }}
    />
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyStyles(container: HTMLElement, selected: Set<MuscleId>) {
  container.querySelectorAll<SVGElement>('[data-muscle]').forEach(el => {
    const id  = el.getAttribute('data-muscle') as MuscleId;
    const sel = selected.has(id);
    el.style.fill       = sel ? SEL_FILL    : UNSEL_FILL;
    el.style.stroke     = sel ? SEL_STROKE  : UNSEL_STROKE;
    el.style.filter     = sel ? SEL_FILTER  : 'none';
    el.style.cursor     = 'pointer';
    el.style.transition = TRANSITION;
  });
}

// Shown when /public/anatomy/{view}.svg has not been placed yet.
function makePlaceholder(view: BodyView): string {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;
      justify-content:center;gap:14px;height:390px;border-radius:16px;
      border:1px dashed rgba(255,255,255,0.09);
      background:rgba(255,255,255,0.02);">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.20)" stroke-width="1.5" stroke-linecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
      <p style="font-size:11px;color:rgba(255,255,255,0.22);text-align:center;
        max-width:180px;line-height:1.7;margin:0;">
        Place anatomy asset at<br>
        <span style="color:rgba(255,255,255,0.40);font-family:monospace;">
          public/anatomy/${view}.svg
        </span>
      </p>
    </div>`;
}
