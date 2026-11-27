import type { MouseEvent } from 'react';

/**
 * Checks if a card is partially clipped outside its horizontal scroll container.
 * If so, prevents default link/button action and smoothly centers the card.
 */
export function centerIfPartiallyHidden(
  e: MouseEvent<HTMLElement>,
  container: HTMLDivElement | null
): boolean {
  if (!container) return false;
  const card = e.currentTarget;
  const containerRect = container.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();

  const isPartiallyHidden =
    cardRect.left < containerRect.left - 2 ||
    cardRect.right > containerRect.right + 2;

  if (isPartiallyHidden) {
    e.preventDefault();
    e.stopPropagation();
    card.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    return true;
  }

  return false;
}

/**
 * Smoothly scrolls a horizontal snap container forward or backward by one card,
 * wrapping around cleanly at either boundary.
 */
export function scrollTrackByCard(
  container: HTMLDivElement | null,
  direction: 'prev' | 'next',
  gapPx = 16
) {
  if (!container) return;
  const cards = Array.from(container.children) as HTMLElement[];
  if (cards.length <= 1) return;

  const step = cards[0].offsetWidth + gapPx;
  const maxScroll = container.scrollWidth - container.clientWidth;
  if (maxScroll <= 0) return;

  if (direction === 'next') {
    if (container.scrollLeft >= maxScroll - 12) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: step, behavior: 'smooth' });
    }
  } else {
    if (container.scrollLeft <= 12) {
      container.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -step, behavior: 'smooth' });
    }
  }
}
