/**
 * Condolence copy shown when a pet is marked as deceased.
 * Kept in one place so the client can easily update the wording.
 */
export const CONDOLENCE_HEADING = 'Forever in our hearts';
export const CONDOLENCE_QUOTE =
  'Paw prints leave lasting impressions on our hearts. Those we love don\'t go away—they walk beside us every day.';

/** Short line for lists/cards (e.g. under status badge). */
export const CONDOLENCE_SHORT = 'Forever in our hearts';

export function getCondolenceMessage(petName?: string): { heading: string; quote: string } {
  return {
    heading: petName ? `${CONDOLENCE_HEADING}, ${petName}.` : CONDOLENCE_HEADING,
    quote: CONDOLENCE_QUOTE,
  };
}
