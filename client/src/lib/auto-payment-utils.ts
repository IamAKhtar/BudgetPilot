import type { Commitment } from "@shared/schema";

/**
 * Calculate effective doneSoFar for auto-payment commitments
 * For auto-payments:
 * - Past months: Fully paid
 * - Future months: Not paid yet
 * - Current month: Paid if current day >= due day
 */
export function getEffectiveDoneSoFar(
  commitment: Commitment,
  selectedMonth: number,
  selectedYear: number
): number {
  if (!commitment.isAutomated) {
    return commitment.doneSoFar;
  }

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  // Past month: all auto-payments are considered paid
  if (
    selectedYear < currentYear ||
    (selectedYear === currentYear && selectedMonth < currentMonth)
  ) {
    return commitment.monthlyCommitment;
  }

  // Future month: auto-payments are not yet paid
  if (
    selectedYear > currentYear ||
    (selectedYear === currentYear && selectedMonth > currentMonth)
  ) {
    return 0;
  }

  // Current month: check if due day has passed
  if (selectedYear === currentYear && selectedMonth === currentMonth) {
    return currentDay >= commitment.dueDay ? commitment.monthlyCommitment : 0;
  }

  return 0;
}

/**
 * Calculate effective balance for auto-payment commitments
 */
export function getEffectiveBalance(
  commitment: Commitment,
  selectedMonth: number,
  selectedYear: number
): number {
  const effectiveDoneSoFar = getEffectiveDoneSoFar(commitment, selectedMonth, selectedYear);
  return commitment.monthlyCommitment - effectiveDoneSoFar;
}
