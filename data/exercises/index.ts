// Aggregates all exercise seed modules into a single flat array.
// Add new muscle-group files here as they are authored.
//
// Convention:
//   - one file per primary muscle group
//   - file name = primary muscle group (kebab-case)
//   - export = array named `{group}Exercises`

import { chestExercises }    from './chest';
import { backExercises }      from './back';
// import { legsExercises }      from './legs';
// import { shouldersExercises } from './shoulders';
// import { armsExercises }      from './arms';
// import { coreExercises }      from './core';
// import { cardioExercises }    from './cardio';

import type { ExerciseSeedEntry } from './_schema';

export const allExercises: ExerciseSeedEntry[] = [
  ...chestExercises,
  ...backExercises,
  // ...legsExercises,
  // ...shouldersExercises,
  // ...armsExercises,
  // ...coreExercises,
  // ...cardioExercises,
];

export { chestExercises, backExercises };
export type { ExerciseSeedEntry };
