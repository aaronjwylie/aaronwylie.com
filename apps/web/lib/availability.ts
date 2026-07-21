/**
 * Availability signal shown in the hero. Flip `available` and edit `label`
 * here to change what visitors see - a single, obvious knob.
 */
export const AVAILABILITY = {
  available: true,
  // Shown when available (keep it short - it renders as a pill).
  label: 'Available for new work',
  // Shown instead when not available.
  unavailableLabel: 'Currently at capacity',
} as const;
