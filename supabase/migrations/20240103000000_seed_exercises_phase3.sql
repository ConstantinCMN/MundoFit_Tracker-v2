-- ─────────────────────────────────────────────────────────────────────────────
-- 003_seed_exercises_phase3.sql
-- Phase 3: Exercise Library Expansion.
-- Purely additive — 22 new rows, no edits to existing exercises, no schema
-- changes. Closes the advanced-tier gap (10 of 13 muscles had zero advanced
-- exercises) and brings forearms/traps up from the weakest absolute coverage.
-- All exercises are public (is_custom = false, created_by = null).
-- Tri-lingual: name_ro / name_en / name_es
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO exercises (
  name_ro, name_en, name_es,
  description_ro, description_en, description_es,
  muscle_groups, secondary_muscles, equipment,
  difficulty, exercise_type, location,
  is_custom, created_by
) VALUES

-- ── FOREARMS (+4) ───────────────────────────────────────────────────────────

('Flexii pentru încheietură la cablu', 'Cable Wrist Curl',          'Curl de muñeca en polea',
 'Izolare pentru flexorii antebrațului folosind cablul pentru tensiune constantă.',
 'Forearm flexor isolation using cable tension for constant load throughout the range.',
 'Aislamiento de flexores del antebrazo usando la polea para tensión constante.',
 ARRAY['forearms'], NULL, ARRAY['cable machine'],
 'beginner', 'strength', 'gym', false, null),

('Flexii inverse cu bara',              'Reverse Barbell Wrist Curl', 'Curl de muñeca inverso con barra',
 'Lucrează extensorii antebrațului, opusul flexiei clasice de încheietură.',
 'Targets the forearm extensors, the antagonist movement to the classic wrist curl.',
 'Trabaja los extensores del antebrazo, el movimiento antagonista al curl de muñeca clásico.',
 ARRAY['forearms'], NULL, ARRAY['barbell','bench'],
 'intermediate', 'strength', 'gym', false, null),

('Rulou pentru încheietură',            'Wrist Roller',               'Rodillo de muñeca',
 'Înfășoară o coardă cu greutate pe un rulou, alternând flexie și extensie până la epuizare.',
 'Wind a weighted cord onto a roller, alternating flexion and extension to failure.',
 'Enrolla una cuerda con peso en un rodillo, alternando flexión y extensión hasta el fallo.',
 ARRAY['forearms'], ARRAY['biceps'], ARRAY['wrist roller'],
 'advanced', 'strength', 'gym', false, null),

('Priză pe disc (pinch grip)',          'Plate Pinch Hold',           'Pinch grip con disco',
 'Ține două discuri prinse între degete cât mai mult posibil pentru forța de priză.',
 'Hold two plates pinched between your fingers for time to build grip strength.',
 'Sostén dos discos pinzados entre los dedos durante el mayor tiempo posible para la fuerza de agarre.',
 ARRAY['forearms'], NULL, ARRAY['weight plates'],
 'intermediate', 'strength', 'gym', false, null),

-- ── TRAPS (+3) ───────────────────────────────────────────────────────────────

('Ridicări din umeri la cablu',         'Cable Shrugs',               'Encogimientos en polea',
 'Ridicări din umeri cu tensiune constantă din cablu, bune pentru izolarea trapezului superior.',
 'Shoulder shrugs with constant cable tension, good for isolating the upper traps.',
 'Encogimientos de hombros con tensión constante de la polea, ideal para aislar el trapecio superior.',
 ARRAY['traps'], ARRAY['forearms'], ARRAY['cable machine'],
 'beginner', 'strength', 'gym', false, null),

('Ridicări din umeri cu bara la spate', 'Behind-the-Back Barbell Shrugs', 'Encogimientos con barra detrás',
 'Variantă cu bara ținută în spatele corpului, care permite o gamă de mișcare mai naturală pentru trapez.',
 'Barbell shrug variation with the bar held behind the body, allowing a more natural range for the traps.',
 'Variante con la barra sostenida detrás del cuerpo, que permite un rango más natural para el trapecio.',
 ARRAY['traps'], ARRAY['forearms'], ARRAY['barbell'],
 'intermediate', 'strength', 'gym', false, null),

('Deadlift cu bara hexagonală',         'Trap Bar Deadlift',          'Peso muerto con barra hexagonal',
 'Deadlift compus care reduce stresul pe spatele inferior și accentuează trapezul prin poziția de priză.',
 'Compound deadlift that reduces lower-back stress and emphasizes the traps through the neutral grip position.',
 'Peso muerto compuesto que reduce el estrés lumbar y enfatiza el trapecio por la posición de agarre.',
 ARRAY['traps'], ARRAY['quads','glutes','hamstrings','lower_back'], ARRAY['trap bar'],
 'advanced', 'strength', 'gym', false, null),

-- ── CALVES (+2) ──────────────────────────────────────────────────────────────

('Ridicări pe vârfuri tip "donkey"',    'Donkey Calf Raise',          'Elevación de talón "donkey"',
 'Variantă de ridicare pe vârfuri cu trunchiul aplecat înainte, care maximizează întinderea gambei.',
 'Calf raise variation with the torso bent forward, maximizing the stretch on the calf.',
 'Variante de elevación de talón con el torso inclinado hacia adelante, maximizando el estiramiento de la pantorrilla.',
 ARRAY['calves'], NULL, ARRAY['calf raise machine'],
 'intermediate', 'strength', 'gym', false, null),

('Ridicări pe un picior cu gantere',    'Single-Leg Weighted Calf Raise', 'Elevación de talón a una pierna con peso',
 'Ridicare pe vârfuri pe un singur picior cu greutate adițională, pentru forță și echilibru avansat.',
 'Single-leg calf raise with added weight, for advanced strength and balance.',
 'Elevación de talón a una pierna con peso adicional, para fuerza y equilibrio avanzado.',
 ARRAY['calves'], NULL, ARRAY['dumbbells'],
 'advanced', 'strength', 'both', false, null),

-- ── LOWER BACK (+2) ──────────────────────────────────────────────────────────

('Hiperextensie inversă',               'Reverse Hyperextension',     'Hiperextensión inversa',
 'Trunchiul rămâne fix pe bancă în timp ce picioarele se ridică, protejând coloana lombară.',
 'The torso stays fixed on the bench while the legs lift, protecting the lumbar spine.',
 'El torso permanece fijo en el banco mientras las piernas se elevan, protegiendo la columna lumbar.',
 ARRAY['lower_back'], ARRAY['glutes','hamstrings'], ARRAY['hyperextension bench'],
 'intermediate', 'strength', 'gym', false, null),

('Jefferson curl',                      'Jefferson Curl',             'Jefferson curl',
 'Flexie controlată a coloanei, vertebră cu vertebră, cu o greutate ușoară pentru mobilitate și forță lombară.',
 'Controlled vertebra-by-vertebra spinal flexion with a light weight, for lumbar mobility and strength.',
 'Flexión controlada de la columna, vértebra por vértebra, con peso ligero para movilidad y fuerza lumbar.',
 ARRAY['lower_back'], ARRAY['hamstrings'], ARRAY['barbell'],
 'advanced', 'strength', 'gym', false, null),

-- ── GLUTES (+2) ──────────────────────────────────────────────────────────────

('Abducție de șold la cablu',           'Cable Hip Abduction',        'Abducción de cadera en polea',
 'Izolare pentru fesierul mijlociu, mișcând piciorul lateral împotriva rezistenței cablului.',
 'Glute medius isolation, moving the leg laterally against cable resistance.',
 'Aislamiento del glúteo medio, moviendo la pierna lateralmente contra la resistencia de la polea.',
 ARRAY['glutes'], NULL, ARRAY['cable machine'],
 'beginner', 'strength', 'gym', false, null),

('Hip thrust cu bara pe un picior',     'Single-Leg Barbell Hip Thrust', 'Hip thrust a una pierna con barra',
 'Variantă unilaterală a hip thrust-ului care cere mai multă forță și stabilitate per picior.',
 'Unilateral hip thrust variation that demands more strength and stability per leg.',
 'Variante unilateral del hip thrust que exige más fuerza y estabilidad por pierna.',
 ARRAY['glutes'], ARRAY['hamstrings'], ARRAY['barbell','bench'],
 'advanced', 'strength', 'gym', false, null),

-- ── CHEST (+1) ───────────────────────────────────────────────────────────────

('Dips cu greutate adițională',         'Weighted Dips',              'Fondos con peso adicional',
 'Dips clasice cu o centură de greutate, pentru sportivi care au depășit nivelul cu propria greutate.',
 'Classic dips with a weight belt added, for lifters who have outgrown bodyweight reps.',
 'Fondos clásicos con un cinturón de peso añadido, para quienes ya superaron el peso corporal.',
 ARRAY['chest'], ARRAY['triceps','shoulders'], ARRAY['parallel bars','dip belt'],
 'advanced', 'strength', 'gym', false, null),

-- ── SHOULDERS (+1) ───────────────────────────────────────────────────────────

('Împins cu o gantera deasupra capului', 'Single-Arm Dumbbell Overhead Press', 'Press de hombro a una mano',
 'Press unilateral care cere stabilizare suplimentară din partea trunchiului și a umărului.',
 'Unilateral press that demands extra core and shoulder stabilization.',
 'Press unilateral que exige estabilización adicional del core y del hombro.',
 ARRAY['shoulders'], ARRAY['triceps','traps'], ARRAY['dumbbells'],
 'advanced', 'strength', 'both', false, null),

-- ── BICEPS (+1) ──────────────────────────────────────────────────────────────

('Flexii "spider"',                     'Spider Curl',                'Curl araña',
 'Flexii de biceps executate cu pieptul pe o bancă înclinată, eliminând orice compensare din umăr.',
 'Bicep curls performed chest-down on an incline bench, removing any shoulder compensation.',
 'Curl de bíceps realizado con el pecho apoyado en un banco inclinado, eliminando compensación del hombro.',
 ARRAY['biceps'], NULL, ARRAY['dumbbells','preacher bench'],
 'advanced', 'strength', 'gym', false, null),

-- ── TRICEPS (+2) ─────────────────────────────────────────────────────────────

('Împins cu priză îngustă',             'Close-Grip Bench Press',     'Press de banca con agarre cerrado',
 'Variantă a împinsului la bancă cu priza îngustă, care deplasează accentul către triceps.',
 'Bench press variation with a narrow grip, shifting the emphasis onto the triceps.',
 'Variante del press de banca con agarre cerrado, que desplaza el énfasis hacia el tríceps.',
 ARRAY['triceps'], ARRAY['chest','shoulders'], ARRAY['barbell','bench'],
 'intermediate', 'strength', 'gym', false, null),

('Dips pentru triceps cu greutate',     'Weighted Tricep Dips',       'Fondos de tríceps con peso',
 'Dips cu trunchiul vertical și greutate adițională, pentru suprasolicitare progresivă a tricepsului.',
 'Dips with an upright torso and added weight, for progressive triceps overload.',
 'Fondos con el torso vertical y peso adicional, para sobrecarga progresiva del tríceps.',
 ARRAY['triceps'], ARRAY['chest','shoulders'], ARRAY['parallel bars','dip belt'],
 'advanced', 'strength', 'gym', false, null),

-- ── LATS (+1) ────────────────────────────────────────────────────────────────

('Tracțiuni cu greutate adițională',    'Weighted Pull-Up',           'Dominada con peso adicional',
 'Tracțiuni clasice cu o centură de greutate, pentru sportivi care au depășit nivelul cu propria greutate.',
 'Classic pull-ups with a weight belt added, for lifters who have outgrown bodyweight reps.',
 'Dominadas clásicas con un cinturón de peso añadido, para quienes ya superaron el peso corporal.',
 ARRAY['lats'], ARRAY['biceps','forearms'], ARRAY['pull-up bar','dip belt'],
 'advanced', 'strength', 'gym', false, null),

-- ── ABS (+1) ─────────────────────────────────────────────────────────────────

('Dragon flag',                         'Dragon Flag',                'Dragon flag',
 'Mișcare avansată de control total al trunchiului, ținând corpul drept din umeri în jos, sprijinit doar pe omoplați.',
 'Advanced full-body control move, keeping the body straight from the shoulders down, supported only on the shoulder blades.',
 'Movimiento avanzado de control total del tronco, manteniendo el cuerpo recto apoyado solo en los omóplatos.',
 ARRAY['abs'], ARRAY['lower_back'], ARRAY['bench'],
 'advanced', 'strength', 'home', false, null),

-- ── HAMSTRINGS (+2) ──────────────────────────────────────────────────────────

('Glute-ham raise',                     'Glute-Ham Raise',            'Glute-ham raise',
 'Exercițiu avansat care lucrează ischiogambierii pe toată raza de mișcare, de la genunchi la șold.',
 'Advanced exercise that works the hamstrings through their full range, from the knee to the hip.',
 'Ejercicio avanzado que trabaja los isquiotibiales en todo su rango, desde la rodilla hasta la cadera.',
 ARRAY['hamstrings'], ARRAY['glutes','lower_back'], ARRAY['GHD machine'],
 'advanced', 'strength', 'gym', false, null),

('Deadlift românesc pe un picior',      'Single-Leg Romanian Deadlift', 'Peso muerto rumano a una pierna',
 'Variantă unilaterală a deadlift-ului românesc care adaugă o componentă puternică de echilibru.',
 'Unilateral Romanian deadlift variation that adds a strong balance component.',
 'Variante unilateral del peso muerto rumano que añade un fuerte componente de equilibrio.',
 ARRAY['hamstrings'], ARRAY['glutes','lower_back'], ARRAY['dumbbells'],
 'intermediate', 'strength', 'both', false, null);
