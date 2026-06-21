-- ─────────────────────────────────────────────────────────────────────────────
-- 002_seed_exercises.sql
-- Seed the global exercise library with ~80 exercises.
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

-- ── CHEST ─────────────────────────────────────────────────────────────────────

('Împins cu bara la bancă plat',   'Barbell Bench Press',          'Press de banca con barra',
 'Exercițiu compus clasic pentru piept. Culcat pe bancă, coborî bara la piept și împinge exploziv.',
 'Classic compound chest exercise. Lie on bench, lower bar to chest, press explosively.',
 'Ejercicio compuesto clásico de pecho. Tumbado en banco, baja la barra al pecho y empuja explosivamente.',
 ARRAY['chest'], ARRAY['triceps','shoulders'], ARRAY['barbell','bench'],
 'intermediate', 'strength', 'gym', false, null),

('Împins cu gantere la bancă plat', 'Dumbbell Bench Press',         'Press de banca con mancuernas',
 'Alternativă cu gantere la împins cu bara. Permite o gamă mai mare de mișcare și activare bilaterală independentă.',
 'Dumbbell alternative to barbell press. Allows greater range of motion and independent bilateral activation.',
 'Alternativa con mancuernas al press de banca. Permite mayor rango de movimiento y activación bilateral independiente.',
 ARRAY['chest'], ARRAY['triceps','shoulders'], ARRAY['dumbbells','bench'],
 'beginner', 'strength', 'gym', false, null),

('Împins înclinat cu bara',        'Incline Barbell Press',        'Press inclinado con barra',
 'Variantă înclinată care accentuează porțiunea superioară a pieptului.',
 'Incline variation that emphasizes the upper chest.',
 'Variante inclinada que enfatiza la parte superior del pecho.',
 ARRAY['chest'], ARRAY['triceps','shoulders'], ARRAY['barbell','bench'],
 'intermediate', 'strength', 'gym', false, null),

('Fluturări cu gantere',           'Dumbbell Flyes',               'Aperturas con mancuernas',
 'Exercițiu de izolare pentru piept. Menține coatele ușor flexate pe toată mișcarea.',
 'Chest isolation exercise. Keep elbows slightly bent throughout the movement.',
 'Ejercicio de aislamiento para pecho. Mantén los codos ligeramente flexionados durante todo el movimiento.',
 ARRAY['chest'], ARRAY['shoulders'], ARRAY['dumbbells','bench'],
 'beginner', 'strength', 'gym', false, null),

('Flotări',                        'Push-Ups',                     'Flexiones',
 'Exercițiu de bază fără echipament pentru piept. Menține corpul drept pe toată execuția.',
 'Foundational bodyweight chest exercise. Keep body straight throughout.',
 'Ejercicio básico de peso corporal para pecho. Mantén el cuerpo recto durante toda la ejecución.',
 ARRAY['chest'], ARRAY['triceps','shoulders'], ARRAY['bodyweight'],
 'beginner', 'strength', 'home', false, null),

('Flotări decline',                'Decline Push-Ups',             'Flexiones en declive',
 'Flotări cu picioarele ridicate, care activează mai mult porțiunea superioară a pieptului.',
 'Push-ups with feet elevated, increasing upper chest activation.',
 'Flexiones con los pies elevados, aumentando la activación del pecho superior.',
 ARRAY['chest'], ARRAY['triceps','shoulders'], ARRAY['bodyweight'],
 'intermediate', 'strength', 'home', false, null),

('Crossover cu cabluri',           'Cable Crossover',              'Cruce de poleas',
 'Exercițiu de izolare la cables pentru piept. Mișcarea arcuită maximizează contracția.',
 'Cable isolation exercise for chest. The arcing motion maximizes contraction.',
 'Ejercicio de aislamiento con cables para pecho. El movimiento en arco maximiza la contracción.',
 ARRAY['chest'], ARRAY['shoulders'], ARRAY['cable machine'],
 'intermediate', 'strength', 'gym', false, null),

('Dips pentru piept',              'Chest Dips',                   'Fondos para pecho',
 'Dips cu trunchiul înclinat înainte pentru a accentua pieptul față de triceps.',
 'Dips with torso leaning forward to emphasize chest over triceps.',
 'Fondos con el torso inclinado hacia adelante para enfatizar el pecho sobre los tríceps.',
 ARRAY['chest'], ARRAY['triceps','shoulders'], ARRAY['parallel bars'],
 'intermediate', 'strength', 'gym', false, null),

-- ── SHOULDERS ─────────────────────────────────────────────────────────────────

('Împins military cu bara',        'Military Press',               'Press militar con barra',
 'Exercițiu compus pentru umeri. Stând în picioare, împinge bara de la umeri deasupra capului.',
 'Compound shoulder exercise. Standing, press bar from shoulders overhead.',
 'Ejercicio compuesto para hombros. De pie, empuja la barra de los hombros sobre la cabeza.',
 ARRAY['shoulders'], ARRAY['triceps','traps'], ARRAY['barbell'],
 'intermediate', 'strength', 'gym', false, null),

('Împins cu gantere pentru umeri', 'Dumbbell Shoulder Press',      'Press de hombros con mancuernas',
 'Press pentru umeri cu gantere care permite o gamă mai naturală de mișcare.',
 'Shoulder press with dumbbells allowing a more natural range of motion.',
 'Press de hombros con mancuernas que permite un rango de movimiento más natural.',
 ARRAY['shoulders'], ARRAY['triceps'], ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

('Ridicări laterale cu gantere',   'Lateral Raises',               'Elevaciones laterales',
 'Exercițiu de izolare pentru deltoidul mediu. Ridică ganterele lateral până la nivelul umerilor.',
 'Isolation exercise for the medial deltoid. Raise dumbbells out to shoulder height.',
 'Ejercicio de aislamiento para el deltoides medial. Eleva las mancuernas lateralmente hasta la altura de los hombros.',
 ARRAY['shoulders'], NULL, ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

('Ridicări frontale cu gantere',   'Front Raises',                 'Elevaciones frontales',
 'Izolare pentru deltoidul anterior. Ridică ganterele în față alternativ sau simultan.',
 'Anterior deltoid isolation. Raise dumbbells to front alternately or simultaneously.',
 'Aislamiento del deltoides anterior. Eleva las mancuernas al frente de forma alterna o simultánea.',
 ARRAY['shoulders'], NULL, ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

('Tracțiuni înapoi cu cablu',      'Cable Face Pull',              'Jalón al cuello en polea',
 'Exercițiu pentru deltoidul posterior și rotatorii umărului. Esențial pentru sănătatea umărului.',
 'Rear deltoid and shoulder rotator exercise. Essential for shoulder health.',
 'Ejercicio para el deltoides posterior y los rotadores del hombro. Esencial para la salud del hombro.',
 ARRAY['shoulders'], ARRAY['traps'], ARRAY['cable machine'],
 'beginner', 'strength', 'gym', false, null),

('Arnold Press',                   'Arnold Press',                 'Arnold Press',
 'Variantă de press cu rotație, numită după Arnold Schwarzenegger. Activează toate capetele deltoidului.',
 'Press variation with rotation, named after Arnold Schwarzenegger. Activates all deltoid heads.',
 'Variante de press con rotación, nombrada por Arnold Schwarzenegger. Activa todas las cabezas del deltoides.',
 ARRAY['shoulders'], ARRAY['triceps'], ARRAY['dumbbells'],
 'intermediate', 'strength', 'both', false, null),

-- ── BICEPS ────────────────────────────────────────────────────────────────────

('Curl cu bara',                   'Barbell Curl',                 'Curl de bíceps con barra',
 'Exercițiu clasic de bază pentru biceps. Ridică bara în arc cu coatele fixe pe lângă corp.',
 'Classic foundational bicep exercise. Curl bar in an arc with elbows fixed at sides.',
 'Ejercicio clásico fundamental para bíceps. Curla la barra en arco con los codos fijos a los costados.',
 ARRAY['biceps'], ARRAY['forearms'], ARRAY['barbell'],
 'beginner', 'strength', 'gym', false, null),

('Curl cu gantere alternativ',     'Alternating Dumbbell Curl',    'Curl alternado con mancuernas',
 'Curl cu gantere executat alternativ pentru a permite o supinație completă a antebrațului.',
 'Alternating dumbbell curl allowing full forearm supination.',
 'Curl con mancuernas alternado que permite una supinación completa del antebrazo.',
 ARRAY['biceps'], ARRAY['forearms'], ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

('Curl hammer',                    'Hammer Curl',                  'Curl martillo',
 'Priza neutră (hammer) activează brahioradialul și brahialul. O variantă excelentă pentru grosimea brațului.',
 'Neutral grip activates brachioradialis and brachialis. Excellent for arm thickness.',
 'Agarre neutro activa el braquiorradial y el braquial. Excelente para el grosor del brazo.',
 ARRAY['biceps'], ARRAY['forearms'], ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

('Curl concentrat',                'Concentration Curl',           'Curl concentrado',
 'Exercițiu de izolare pentru biceps executat cu cotul sprijinit pe coapsă. Maximizează contracția.',
 'Bicep isolation with elbow braced on thigh. Maximizes contraction.',
 'Aislamiento de bíceps con el codo apoyado en el muslo. Maximiza la contracción.',
 ARRAY['biceps'], NULL, ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

('Curl cu scripete jos',           'Cable Curl',                   'Curl en polea baja',
 'Curl la cablul jos menține tensiunea constantă pe tot parcursul mișcării, spre deosebire de gantere.',
 'Low cable curl maintains constant tension throughout the movement, unlike free weights.',
 'Curl en polea baja mantiene tensión constante durante todo el movimiento, a diferencia de las pesas libres.',
 ARRAY['biceps'], ARRAY['forearms'], ARRAY['cable machine'],
 'beginner', 'strength', 'gym', false, null),

('Curl inclinat cu gantere',       'Incline Dumbbell Curl',        'Curl inclinado con mancuernas',
 'Executat pe o bancă înclinată, accentuează capul lung al bicepsului prin stretching la bază.',
 'Performed on incline bench, emphasizes long head of bicep through stretch at base.',
 'Realizado en banco inclinado, enfatiza la cabeza larga del bíceps a través del estiramiento en la base.',
 ARRAY['biceps'], NULL, ARRAY['dumbbells','bench'],
 'intermediate', 'strength', 'gym', false, null),

-- ── TRICEPS ───────────────────────────────────────────────────────────────────

('Extensii triceps cu scripete',   'Cable Tricep Pushdown',        'Jalón de tríceps en polea',
 'Exercițiu de izolare pentru triceps la cablu. Coatele fixe lângă corp, împinge mânerul jos.',
 'Tricep isolation at cable. Elbows fixed at sides, push handle down.',
 'Aislamiento de tríceps en polea. Codos fijos a los costados, empuja el mango hacia abajo.',
 ARRAY['triceps'], NULL, ARRAY['cable machine'],
 'beginner', 'strength', 'gym', false, null),

('Scufundări la bancă',            'Bench Dips',                   'Fondos en banco',
 'Triceps la greutatea corpului. Mâinile pe bancă, coborî și ridică corpul flexând coatele.',
 'Bodyweight triceps exercise. Hands on bench, lower and raise body by flexing elbows.',
 'Ejercicio de tríceps con peso corporal. Manos en banco, baja y sube el cuerpo flexionando los codos.',
 ARRAY['triceps'], ARRAY['chest','shoulders'], ARRAY['bench'],
 'beginner', 'strength', 'both', false, null),

('Skull Crushers',                 'Skull Crushers',               'Rompecráneos',
 'Extensii pentru triceps culcat pe bancă cu bara EZ. Coatele fixe, coboară bara spre frunte.',
 'Lying tricep extension with EZ bar. Fixed elbows, lower bar toward forehead.',
 'Extensión de tríceps tumbado con barra EZ. Codos fijos, baja la barra hacia la frente.',
 ARRAY['triceps'], NULL, ARRAY['ez bar','bench'],
 'intermediate', 'strength', 'gym', false, null),

('Extensii triceps deasupra capului', 'Overhead Tricep Extension', 'Extensión de tríceps sobre la cabeza',
 'Extensie deasupra capului cu gantera sau cablu. Accentuează capul lung al tricepsului.',
 'Overhead extension with dumbbell or cable. Emphasizes long head of triceps.',
 'Extensión sobre la cabeza con mancuerna o polea. Enfatiza la cabeza larga del tríceps.',
 ARRAY['triceps'], NULL, ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

('Flotări cu prize îngustă',       'Diamond Push-Ups',             'Flexiones diamante',
 'Flotări cu mâinile aproape, formând un diamant. Activează intensiv tricepsul.',
 'Push-ups with hands close together forming a diamond. Intensely activates triceps.',
 'Flexiones con las manos juntas formando un diamante. Activa intensamente el tríceps.',
 ARRAY['triceps'], ARRAY['chest'], ARRAY['bodyweight'],
 'intermediate', 'strength', 'home', false, null),

-- ── FOREARMS ──────────────────────────────────────────────────────────────────

('Curl de încheietură cu bara',    'Wrist Curl',                   'Curl de muñeca',
 'Exercițiu de izolare pentru flexorii antebrațului. Executat cu antebrațele sprijinite.',
 'Forearm flexor isolation exercise. Performed with forearms supported.',
 'Ejercicio de aislamiento para los flexores del antebrazo. Realizado con antebrazos apoyados.',
 ARRAY['forearms'], NULL, ARRAY['barbell'],
 'beginner', 'strength', 'gym', false, null),

('Farmer''s Walk',                 'Farmer''s Walk',               'Caminata del granjero',
 'Mers cu gantere grele în mâini. Excelent pentru forța și hipertrofia antebrațelor.',
 'Walking with heavy dumbbells in hands. Excellent for forearm strength and hypertrophy.',
 'Caminar con mancuernas pesadas en las manos. Excelente para la fuerza e hipertrofia del antebrazo.',
 ARRAY['forearms'], ARRAY['traps','glutes'], ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

-- ── ABS ───────────────────────────────────────────────────────────────────────

('Abdomene clasice',               'Crunches',                     'Abdominales',
 'Exercițiu de bază pentru abdomen. Contractă mușchii abdominali ridicând umerii de pe sol.',
 'Basic abdominal exercise. Contract abs by raising shoulders off the floor.',
 'Ejercicio básico para abdomen. Contrae los abdominales levantando los hombros del suelo.',
 ARRAY['abs'], NULL, ARRAY['bodyweight'],
 'beginner', 'strength', 'home', false, null),

('Planșă',                         'Plank',                        'Plancha',
 'Exercițiu izometric de bază. Menține corpul drept în poziție de flotare pe coate.',
 'Core isometric exercise. Hold body straight in push-up position on forearms.',
 'Ejercicio isométrico de core. Mantén el cuerpo recto en posición de flexión sobre antebrazos.',
 ARRAY['abs'], ARRAY['shoulders','glutes'], ARRAY['bodyweight'],
 'beginner', 'strength', 'home', false, null),

('Ridicări de picioare',           'Leg Raises',                   'Elevaciones de piernas',
 'Culcat pe spate, ridică picioarele drepte până la 90°. Accentuează abdomenul inferior.',
 'Lying flat, raise straight legs to 90°. Emphasizes lower abs.',
 'Tumbado boca arriba, eleva las piernas rectas hasta 90°. Enfatiza el abdomen inferior.',
 ARRAY['abs'], ARRAY['hip flexors'], ARRAY['bodyweight'],
 'beginner', 'strength', 'home', false, null),

('Rulouri cu roată abdominală',    'Ab Wheel Rollout',             'Rueda abdominal',
 'Exercițiu avansat pentru tot abdomenul. Rulează roata înainte din genunchi menținând coloana neutră.',
 'Advanced full-core exercise. Roll wheel forward from knees keeping spine neutral.',
 'Ejercicio avanzado para todo el core. Rueda la rueda hacia adelante desde rodillas manteniendo la columna neutra.',
 ARRAY['abs'], ARRAY['shoulders','lower_back'], ARRAY['ab wheel'],
 'advanced', 'strength', 'both', false, null),

('Mountain Climbers',              'Mountain Climbers',            'Escaladores',
 'Din poziția de flotare, alternează genunchii spre piept rapid. Cardio și core combinate.',
 'From push-up position, alternate knees to chest rapidly. Combined cardio and core.',
 'Desde posición de flexión, alterna las rodillas al pecho rápidamente. Cardio y core combinados.',
 ARRAY['abs'], ARRAY['shoulders','quads'], ARRAY['bodyweight'],
 'beginner', 'strength', 'home', false, null),

('Tocuri la bara',                 'Hanging Knee Raises',          'Elevaciones de rodillas en barra',
 'Atârnat de bară, ridică genunchii spre piept. Excelent pentru abdomenul inferior.',
 'Hanging from bar, raise knees to chest. Excellent for lower abs.',
 'Colgado de la barra, eleva las rodillas al pecho. Excelente para el abdomen inferior.',
 ARRAY['abs'], ARRAY['forearms'], ARRAY['pull-up bar'],
 'intermediate', 'strength', 'both', false, null),

('Bicicletă abdominală',           'Bicycle Crunches',             'Abdominales en bicicleta',
 'Alternează cotul cu genunchiul opus în mișcare de pedalare. Activează oblicii și dreptul abdominal.',
 'Alternate elbow to opposite knee in pedaling motion. Activates obliques and rectus abdominis.',
 'Alterna el codo con la rodilla opuesta en movimiento de pedaleo. Activa los oblicuos y el recto abdominal.',
 ARRAY['abs'], NULL, ARRAY['bodyweight'],
 'beginner', 'strength', 'home', false, null),

-- ── QUADS ─────────────────────────────────────────────────────────────────────

('Genuflexiuni cu bara',           'Back Squat',                   'Sentadilla con barra',
 'Regele exercițiilor pentru picioare. Bara pe umeri, coboară până la 90° sau mai mult.',
 'The king of leg exercises. Bar on shoulders, squat down to 90° or deeper.',
 'El rey de los ejercicios de piernas. Barra en hombros, desciende hasta 90° o más.',
 ARRAY['quads'], ARRAY['glutes','hamstrings','lower_back'], ARRAY['barbell','squat rack'],
 'intermediate', 'strength', 'gym', false, null),

('Genuflexiuni frontale',          'Front Squat',                  'Sentadilla frontal',
 'Bara ținută în față pe umeri. Accentuează cvadricepșii mai mult decât genuflexiunea clasică.',
 'Bar held in front on shoulders. Emphasizes quads more than back squat.',
 'Barra sostenida al frente sobre los hombros. Enfatiza más los cuádriceps que la sentadilla clásica.',
 ARRAY['quads'], ARRAY['glutes','abs'], ARRAY['barbell','squat rack'],
 'advanced', 'strength', 'gym', false, null),

('Presa la picioare',              'Leg Press',                    'Prensa de piernas',
 'Aparat pentru cvadricepși, fesieri și ischiogambieri. Reglează poziția picioarelor pentru variante.',
 'Machine for quads, glutes and hamstrings. Adjust foot position for variations.',
 'Máquina para cuádriceps, glúteos e isquiotibiales. Ajusta la posición de los pies para variantes.',
 ARRAY['quads'], ARRAY['glutes','hamstrings'], ARRAY['leg press machine'],
 'beginner', 'strength', 'gym', false, null),

('Extensii cvadricepși la aparat', 'Leg Extension',                'Extensión de cuádriceps',
 'Izolare pentru cvadricepși la aparat. Extinde complet genunchiul în vârf.',
 'Quad isolation on machine. Fully extend knee at the top.',
 'Aislamiento de cuádriceps en máquina. Extiende completamente la rodilla en la cima.',
 ARRAY['quads'], NULL, ARRAY['leg extension machine'],
 'beginner', 'strength', 'gym', false, null),

('Fandare',                        'Lunges',                       'Zancadas',
 'Fandare cu un picior înainte. Excelent pentru echilibru, forța unilaterală și mobilitate.',
 'Step forward with one leg. Excellent for balance, unilateral strength and mobility.',
 'Da un paso hacia adelante con una pierna. Excelente para el equilibrio, fuerza unilateral y movilidad.',
 ARRAY['quads'], ARRAY['glutes','hamstrings'], ARRAY['bodyweight'],
 'beginner', 'strength', 'both', false, null),

('Fandare cu gantere',             'Dumbbell Lunges',              'Zancadas con mancuernas',
 'Fandare cu gantere pentru rezistență suplimentară. Menține trunchiul drept.',
 'Lunges with dumbbells for extra resistance. Keep torso upright.',
 'Zancadas con mancuernas para resistencia adicional. Mantén el tronco erguido.',
 ARRAY['quads'], ARRAY['glutes','hamstrings'], ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

('Genuflexiuni bulgărești cu o mână',  'Bulgarian Split Squat',    'Sentadilla búlgara',
 'Piciorul posterior pe bancă. Exercițiu excelent de forță și mobilitate unilaterală.',
 'Rear foot elevated on bench. Excellent unilateral strength and mobility exercise.',
 'Pie trasero elevado en banco. Excelente ejercicio de fuerza y movilidad unilateral.',
 ARRAY['quads'], ARRAY['glutes','hamstrings'], ARRAY['bench'],
 'intermediate', 'strength', 'both', false, null),

('Hack Squat',                     'Hack Squat',                   'Hack Squat',
 'Genuflexiune la aparatul hack squat sau cu bara la spate. Accentuează cvadricepșii.',
 'Squat on hack squat machine or with bar behind. Emphasizes quads.',
 'Sentadilla en máquina hack squat o con barra detrás. Enfatiza los cuádriceps.',
 ARRAY['quads'], ARRAY['glutes'], ARRAY['hack squat machine'],
 'intermediate', 'strength', 'gym', false, null),

-- ── HAMSTRINGS ────────────────────────────────────────────────────────────────

('Deadlift românesc',              'Romanian Deadlift',            'Peso muerto rumano',
 'Deadlift cu genunchii ușor flexați, bazat pe articulația șoldului. Accentuează ischiogambierii și fesierii.',
 'Deadlift with slight knee bend, hip hinge based. Emphasizes hamstrings and glutes.',
 'Peso muerto con ligera flexión de rodilla, basado en bisagra de cadera. Enfatiza isquiotibiales y glúteos.',
 ARRAY['hamstrings'], ARRAY['glutes','lower_back'], ARRAY['barbell'],
 'intermediate', 'strength', 'gym', false, null),

('Curl femural la aparat culcat',  'Lying Leg Curl',               'Curl femoral tumbado',
 'Izolare pentru ischiogambieri la aparatul de curl femural culcat.',
 'Hamstring isolation on lying leg curl machine.',
 'Aislamiento de isquiotibiales en máquina de curl femoral tumbado.',
 ARRAY['hamstrings'], NULL, ARRAY['leg curl machine'],
 'beginner', 'strength', 'gym', false, null),

('Curl femural la aparat așezat',  'Seated Leg Curl',              'Curl femoral sentado',
 'Variantă de curl femural în poziție șezând. Activare ușor diferită față de varianta culcată.',
 'Leg curl variation in seated position. Slightly different activation than lying version.',
 'Variante de curl femoral en posición sentada. Activación ligeramente diferente a la versión tumbada.',
 ARRAY['hamstrings'], NULL, ARRAY['leg curl machine'],
 'beginner', 'strength', 'gym', false, null),

('Good Morning',                   'Good Morning',                 'Buenos días',
 'Bara pe umeri, înclină trunchiul înainte din șolduri cu genunchii ușor flexați. Forță și mobilitate.',
 'Bar on shoulders, hinge torso forward from hips with slight knee bend. Strength and mobility.',
 'Barra en hombros, inclina el torso hacia adelante desde las caderas con ligera flexión de rodilla.',
 ARRAY['hamstrings'], ARRAY['lower_back','glutes'], ARRAY['barbell'],
 'intermediate', 'strength', 'gym', false, null),

('Nordic Curl',                    'Nordic Curl',                  'Curl nórdico',
 'Partener ține gleznele, coboară trunchiul cu forța ischiogambierilor. Exercițiu avansat de forță excentrică.',
 'Partner holds ankles, lower torso using hamstring strength. Advanced eccentric strength exercise.',
 'El compañero sujeta los tobillos, baja el torso con la fuerza de los isquiotibiales. Ejercicio avanzado.',
 ARRAY['hamstrings'], NULL, ARRAY['bodyweight'],
 'advanced', 'strength', 'both', false, null),

-- ── GLUTES ────────────────────────────────────────────────────────────────────

('Hip Thrust cu bara',             'Barbell Hip Thrust',           'Hip thrust con barra',
 'Sprijinit pe bancă, empinge bara cu șoldurile în sus. Cel mai eficient exercițiu pentru fesieri.',
 'Backed against bench, drive bar up with hips. Most effective glute exercise.',
 'Apoyado en banco, empuja la barra hacia arriba con las caderas. El ejercicio más efectivo para glúteos.',
 ARRAY['glutes'], ARRAY['hamstrings'], ARRAY['barbell','bench'],
 'intermediate', 'strength', 'both', false, null),

('Glute Bridge',                   'Glute Bridge',                 'Puente de glúteos',
 'Culcat pe spate, ridică bazinul contractând fesierii. Variantă fără echipament pentru Hip Thrust.',
 'Lying on back, raise hips by contracting glutes. Equipment-free version of Hip Thrust.',
 'Tumbado boca arriba, eleva las caderas contrayendo los glúteos. Versión sin equipo del Hip Thrust.',
 ARRAY['glutes'], ARRAY['hamstrings'], ARRAY['bodyweight'],
 'beginner', 'strength', 'home', false, null),

('Kickback la cablu',              'Cable Kickback',               'Patada trasera en polea',
 'Cu cablu atașat la gleznă, împinge piciorul înapoi contractând fesierul. Izolare excelentă.',
 'With cable attached to ankle, kick leg back contracting glute. Excellent isolation.',
 'Con polea en el tobillo, empuja la pierna hacia atrás contrayendo el glúteo. Aislamiento excelente.',
 ARRAY['glutes'], ARRAY['hamstrings'], ARRAY['cable machine'],
 'beginner', 'strength', 'gym', false, null),

('Sumo Deadlift',                  'Sumo Deadlift',                'Peso muerto sumo',
 'Deadlift cu picioarele depărtate și prizele în interior. Activează mai mult fesierii și adductorii.',
 'Wide-stance deadlift with hands inside feet. More glute and adductor activation.',
 'Peso muerto con postura amplia y manos dentro de los pies. Mayor activación de glúteos y aductores.',
 ARRAY['glutes'], ARRAY['hamstrings','quads'], ARRAY['barbell'],
 'intermediate', 'strength', 'gym', false, null),

-- ── CALVES ────────────────────────────────────────────────────────────────────

('Ridicări pe vârfuri în picioare', 'Standing Calf Raise',         'Elevación de talones de pie',
 'Ridică-te pe vârfuri menținând poziția în vârf. Execuție lentă pentru hipertrofie maximă.',
 'Rise onto toes holding at peak. Slow execution for maximum hypertrophy.',
 'Sube sobre las puntas manteniéndote en la cima. Ejecución lenta para máxima hipertrofia.',
 ARRAY['calves'], NULL, ARRAY['calf raise machine'],
 'beginner', 'strength', 'both', false, null),

('Ridicări pe vârfuri la aparat',  'Seated Calf Raise',            'Elevación de talones sentado',
 'Aparatul de calf raise șezând accentuează mușchiul solear față de gemeni.',
 'Seated calf raise machine emphasizes soleus over gastrocnemius.',
 'La máquina de elevación de talones sentado enfatiza el sóleo sobre el gemelo.',
 ARRAY['calves'], NULL, ARRAY['seated calf raise machine'],
 'beginner', 'strength', 'gym', false, null),

('Ridicări pe vârfuri pe o treaptă', 'Single-Leg Calf Raise',      'Elevación de talón en escalón',
 'Pe o treaptă sau margine, ridică-te pe vârful unui singur picior. Rezistență mare, fără echipament.',
 'On step or edge, raise onto toes of one foot. High resistance, no equipment.',
 'En un escalón o borde, sube sobre las puntas de un solo pie. Alta resistencia, sin equipo.',
 ARRAY['calves'], NULL, ARRAY['bodyweight'],
 'intermediate', 'strength', 'home', false, null),

-- ── TRAPS ─────────────────────────────────────────────────────────────────────

('Ridicări de umeri cu bara',      'Barbell Shrugs',               'Encogimientos con barra',
 'Ridică umerii vertical cât mai sus cu bara în mână. Izolare clasică pentru trapez.',
 'Shrug shoulders vertically as high as possible with bar. Classic trap isolation.',
 'Encoge los hombros verticalmente lo más alto posible con la barra. Aislamiento clásico de trapecio.',
 ARRAY['traps'], NULL, ARRAY['barbell'],
 'beginner', 'strength', 'gym', false, null),

('Ridicări de umeri cu gantere',   'Dumbbell Shrugs',              'Encogimientos con mancuernas',
 'Variantă cu gantere pentru trapez. Permite o gamă mai naturală de mișcare.',
 'Dumbbell trap variation. Allows a more natural range of motion.',
 'Variante con mancuernas para el trapecio. Permite un rango de movimiento más natural.',
 ARRAY['traps'], NULL, ARRAY['dumbbells'],
 'beginner', 'strength', 'both', false, null),

('Deadlift clasic',                'Conventional Deadlift',        'Peso muerto convencional',
 'Exercițiu compus rege. Ridică bara de pe sol cu spatele drept. Activează tot corpul posterior.',
 'King compound exercise. Lift bar from floor with straight back. Activates entire posterior chain.',
 'Ejercicio compuesto rey. Levanta la barra del suelo con la espalda recta. Activa toda la cadena posterior.',
 ARRAY['traps'], ARRAY['lats','lower_back','glutes','hamstrings'], ARRAY['barbell'],
 'intermediate', 'strength', 'gym', false, null),

-- ── LATS ──────────────────────────────────────────────────────────────────────

('Tracțiuni la bara fixă',         'Pull-Ups',                     'Dominadas',
 'Exercițiu clasic cu greutatea corpului pentru dorsal. Priza pronate, trage-te deasupra barei.',
 'Classic bodyweight lat exercise. Overhand grip, pull yourself above the bar.',
 'Ejercicio clásico de peso corporal para dorsal. Agarre prono, jálate por encima de la barra.',
 ARRAY['lats'], ARRAY['biceps','traps'], ARRAY['pull-up bar'],
 'intermediate', 'strength', 'both', false, null),

('Chin-Up',                        'Chin-Ups',                     'Jalones con agarre supino',
 'Ca tracțiunile, dar cu priza supinată (palmele spre tine). Activează mai mult bicepsul.',
 'Like pull-ups but with supinated grip (palms toward you). More bicep activation.',
 'Como las dominadas, pero con agarre supino (palmas hacia ti). Mayor activación del bíceps.',
 ARRAY['lats'], ARRAY['biceps'], ARRAY['pull-up bar'],
 'intermediate', 'strength', 'both', false, null),

('Tracțiuni la scripete',          'Lat Pulldown',                 'Jalón al pecho en polea',
 'La aparatul de scripete, trage bara spre piept cu priza pronate. Alternativă la tracțiuni.',
 'On lat pulldown machine, pull bar to chest with overhand grip. Pull-up alternative.',
 'En la máquina de polea, jala la barra al pecho con agarre prono. Alternativa a las dominadas.',
 ARRAY['lats'], ARRAY['biceps','traps'], ARRAY['cable machine'],
 'beginner', 'strength', 'gym', false, null),

('Tracțiuni cu o mână la scripete', 'Single-Arm Cable Row',        'Remo unilateral en polea',
 'Tracțiune unilaterală cu cablu. Permite o rotație naturală a trunchiului și activare mai bună.',
 'Unilateral cable row. Allows natural trunk rotation and better activation.',
 'Remo unilateral en polea. Permite rotación natural del tronco y mejor activación.',
 ARRAY['lats'], ARRAY['biceps','traps'], ARRAY['cable machine'],
 'beginner', 'strength', 'gym', false, null),

('Vâslit cu bara',                 'Barbell Row',                  'Remo con barra',
 'Trunchiul paralel cu solul, trage bara spre abdomen. Exercițiu compus pentru tot spatele.',
 'Torso parallel to floor, pull bar to abdomen. Compound exercise for entire back.',
 'Torso paralelo al suelo, jala la barra hacia el abdomen. Ejercicio compuesto para toda la espalda.',
 ARRAY['lats'], ARRAY['traps','biceps','lower_back'], ARRAY['barbell'],
 'intermediate', 'strength', 'gym', false, null),

('Vâslit cu gantera',              'Dumbbell Row',                 'Remo con mancuerna',
 'Sprijinit pe bancă, trage gantera spre șold. Excelent pentru densitatea spatelui.',
 'Braced on bench, pull dumbbell toward hip. Excellent for back thickness.',
 'Apoyado en banco, jala la mancuerna hacia la cadera. Excelente para el grosor de la espalda.',
 ARRAY['lats'], ARRAY['biceps','traps'], ARRAY['dumbbells','bench'],
 'beginner', 'strength', 'both', false, null),

('Pullover cu gantera',            'Dumbbell Pullover',            'Pullover con mancuerna',
 'Culcat pe bancă, arcuiește gantera înapoi deasupra capului. Activează dorsalul și pieptul.',
 'Lying on bench, arc dumbbell back over head. Activates lats and chest.',
 'Tumbado en banco, arquea la mancuerna hacia atrás sobre la cabeza. Activa el dorsal y el pecho.',
 ARRAY['lats'], ARRAY['chest'], ARRAY['dumbbells','bench'],
 'intermediate', 'strength', 'gym', false, null),

-- ── LOWER BACK ────────────────────────────────────────────────────────────────

('Hiperextensii',                  'Back Extensions',              'Hiperextensiones',
 'La aparatul de hiperextensii, coboară și ridică trunchiul. Întărește lombarii.',
 'On hyperextension bench, lower and raise torso. Strengthens lower back.',
 'En el banco de hiperextensiones, baja y levanta el torso. Fortalece la zona lumbar.',
 ARRAY['lower_back'], ARRAY['glutes','hamstrings'], ARRAY['hyperextension bench'],
 'beginner', 'strength', 'gym', false, null),

('Deadlift cu picioarele drepte',  'Stiff-Leg Deadlift',           'Peso muerto a piernas rígidas',
 'Deadlift cu genunchii aproape drepți. Stretch maxim pentru lombari și ischiogambieri.',
 'Deadlift with nearly straight knees. Maximum stretch for lower back and hamstrings.',
 'Peso muerto con rodillas casi rectas. Máximo estiramiento para zona lumbar e isquiotibiales.',
 ARRAY['lower_back'], ARRAY['hamstrings','glutes'], ARRAY['barbell'],
 'intermediate', 'strength', 'gym', false, null),

('Superman',                       'Superman',                     'Superman',
 'Culcat pe burtă, ridică simultan brațele și picioarele de pe sol. Exercițiu pentru lombari fără echipament.',
 'Lying face down, simultaneously raise arms and legs off floor. No-equipment lower back exercise.',
 'Tumbado boca abajo, eleva simultáneamente brazos y piernas del suelo. Ejercicio lumbar sin equipo.',
 ARRAY['lower_back'], ARRAY['glutes'], ARRAY['bodyweight'],
 'beginner', 'strength', 'home', false, null),

('Tracțiuni cu bara T',            'T-Bar Row',                    'Remo en T',
 'Vâslit cu bara T sau la aparatul dedicat. Excelent pentru grosimea și densitatea spatelui.',
 'Row with T-bar or on dedicated machine. Excellent for back thickness and density.',
 'Remo con barra en T o en máquina dedicada. Excelente para el grosor y densidad de la espalda.',
 ARRAY['lower_back'], ARRAY['lats','traps','biceps'], ARRAY['t-bar'],
 'intermediate', 'strength', 'gym', false, null),

-- ── CARDIO ────────────────────────────────────────────────────────────────────

('Alergare la bandă',              'Treadmill Run',                'Correr en cinta',
 'Cardio de bază la bandă de alergare. Reglează viteza și înclinarea pentru intensitate variabilă.',
 'Basic treadmill cardio. Adjust speed and incline for variable intensity.',
 'Cardio básico en cinta de correr. Ajusta la velocidad e inclinación para intensidad variable.',
 ARRAY['quads'], ARRAY['hamstrings','calves'], ARRAY['treadmill'],
 'beginner', 'cardio', 'gym', false, null),

('Sărituri cu coarda',             'Jump Rope',                    'Saltar a la comba',
 'Cardio intens și accesibil cu coarda. Excelent pentru coordonare și arderea caloriilor.',
 'Intense and accessible cardio with jump rope. Excellent for coordination and calorie burn.',
 'Cardio intenso y accesible con comba. Excelente para coordinación y quema de calorías.',
 ARRAY['calves'], ARRAY['shoulders','abs'], ARRAY['jump rope'],
 'beginner', 'cardio', 'both', false, null),

('Burpees',                        'Burpees',                      'Burpees',
 'Exercițiu complet corp: flotare, genuflexiune și săritură combinat. Cardio și forță.',
 'Full body exercise: push-up, squat and jump combined. Cardio and strength.',
 'Ejercicio de cuerpo completo: flexión, sentadilla y salto combinados. Cardio y fuerza.',
 ARRAY['quads'], ARRAY['chest','shoulders','abs'], ARRAY['bodyweight'],
 'intermediate', 'cardio', 'home', false, null),

('Box Jump',                       'Box Jump',                     'Salto en cajón',
 'Sari pe o cutie sau platformă. Putere explozivă pentru cvadricepși și fesieri.',
 'Jump onto a box or platform. Explosive power for quads and glutes.',
 'Salta sobre una caja o plataforma. Potencia explosiva para cuádriceps y glúteos.',
 ARRAY['quads'], ARRAY['glutes','calves'], ARRAY['plyometric box'],
 'intermediate', 'cardio', 'gym', false, null),

('Step Up pe bancă',               'Step-Ups',                     'Step-ups en banco',
 'Urcă alternativ pe o bancă sau platformă cu sau fără gantere. Forță unilaterală.',
 'Alternately step up onto bench or platform with or without dumbbells. Unilateral strength.',
 'Sube alternadamente en un banco o plataforma con o sin mancuernas. Fuerza unilateral.',
 ARRAY['quads'], ARRAY['glutes','hamstrings'], ARRAY['bench'],
 'beginner', 'strength', 'both', false, null)

ON CONFLICT DO NOTHING;
