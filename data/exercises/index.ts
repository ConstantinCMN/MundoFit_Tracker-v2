// Aggregates all exercise seed modules into a single flat array.
// Add new muscle-group files here as they are authored.
//
// Convention:
//   - one file per primary muscle group
//   - file name = primary muscle group (kebab-case)
//   - export = array named `{group}Exercises`

import { chestExercises }    from './chest';
import { backExercises }      from './back';
import { legsExercises }      from './legs';
import { shouldersExercises } from './shoulders';
import { bicepsExercises }    from './biceps';
import { tricepsExercises }   from './triceps';
import { forearmsExercises }  from './forearms';
import { coreExercises }      from './core';
import { cardioExercises }    from './cardio';

import type { ExerciseSeedEntry } from './_schema';

export const allExercises: ExerciseSeedEntry[] = [
  ...chestExercises,
  ...backExercises,
  ...legsExercises,
  ...shouldersExercises,
  ...bicepsExercises,
  ...tricepsExercises,
  ...forearmsExercises,
  ...coreExercises,
  ...cardioExercises,
];

export { chestExercises, backExercises, legsExercises, shouldersExercises, bicepsExercises, tricepsExercises, forearmsExercises, coreExercises, cardioExercises };
export type { ExerciseSeedEntry };
