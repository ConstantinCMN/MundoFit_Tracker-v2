import type { MeasurementField } from '@/lib/actions/measurements';
import type { UnitSystem } from '@/types/database';

export const MEASUREMENT_FIELDS: MeasurementField[] = [
  'chest_cm',
  'waist_cm',
  'hips_cm',
  'left_arm_cm',
  'right_arm_cm',
  'left_thigh_cm',
  'right_thigh_cm',
  'left_calf_cm',
  'right_calf_cm',
  'neck_cm',
  'shoulders_cm',
  'body_fat_pct',
];

// Groups used in the log form
export const FIELD_GROUPS: {
  key: string;
  sectionKey: string;
  fields: { field: MeasurementField; labelKey: string }[];
}[] = [
  {
    key: 'upperBody',
    sectionKey: 'sections.upperBody',
    fields: [
      { field: 'chest_cm', labelKey: 'fields.chest' },
      { field: 'neck_cm', labelKey: 'fields.neck' },
      { field: 'shoulders_cm', labelKey: 'fields.shoulders' },
    ],
  },
  {
    key: 'core',
    sectionKey: 'sections.core',
    fields: [
      { field: 'waist_cm', labelKey: 'fields.waist' },
      { field: 'hips_cm', labelKey: 'fields.hips' },
    ],
  },
  {
    key: 'arms',
    sectionKey: 'sections.arms',
    fields: [
      { field: 'left_arm_cm', labelKey: 'fields.leftArm' },
      { field: 'right_arm_cm', labelKey: 'fields.rightArm' },
    ],
  },
  {
    key: 'legs',
    sectionKey: 'sections.legs',
    fields: [
      { field: 'left_thigh_cm', labelKey: 'fields.leftThigh' },
      { field: 'right_thigh_cm', labelKey: 'fields.rightThigh' },
      { field: 'left_calf_cm', labelKey: 'fields.leftCalf' },
      { field: 'right_calf_cm', labelKey: 'fields.rightCalf' },
    ],
  },
];

// Fields where a lower value = progress
export const DECREASE_IS_GOOD = new Set<MeasurementField>([
  'waist_cm',
  'hips_cm',
  'body_fat_pct',
]);

// For Body Hub Phase 3 — muscle → DB measurement fields
export const MUSCLE_TO_FIELD: Record<string, MeasurementField[]> = {
  chest: ['chest_cm'],
  shoulders: ['shoulders_cm'],
  traps: ['shoulders_cm'],
  lats: ['shoulders_cm'],
  biceps: ['left_arm_cm', 'right_arm_cm'],
  triceps: ['left_arm_cm', 'right_arm_cm'],
  forearms: ['left_arm_cm', 'right_arm_cm'],
  abs: ['waist_cm'],
  lower_back: ['waist_cm'],
  glutes: ['hips_cm'],
  quads: ['left_thigh_cm', 'right_thigh_cm'],
  hamstrings: ['left_thigh_cm', 'right_thigh_cm'],
  calves: ['left_calf_cm', 'right_calf_cm'],
};

export function cmToDisplay(cm: number, unitSystem: UnitSystem): number {
  return unitSystem === 'imperial' ? Math.round((cm / 2.54) * 10) / 10 : cm;
}

export function displayToCm(value: number, unitSystem: UnitSystem): number {
  return unitSystem === 'imperial' ? Math.round(value * 2.54 * 10) / 10 : value;
}

export function fieldToDisplay(
  field: MeasurementField,
  value: number,
  unitSystem: UnitSystem
): number {
  return field === 'body_fat_pct' ? value : cmToDisplay(value, unitSystem);
}

export function displayToField(
  field: MeasurementField,
  value: number,
  unitSystem: UnitSystem
): number {
  return field === 'body_fat_pct' ? value : displayToCm(value, unitSystem);
}

export function fieldUnit(field: MeasurementField, unitSystem: UnitSystem): string {
  return field === 'body_fat_pct' ? '%' : unitSystem === 'imperial' ? 'in' : 'cm';
}
