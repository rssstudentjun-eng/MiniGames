import './slider.scss';

const autoplayDelay = 4000;
const animationDuration = 400;

export function initializeSlider(
  track: HTMLElement,
  previousButton: HTMLButtonElement,
  nextButton: HTMLButtonElement,
) {
  const cards = [...track.querySelectorAll<HTMLElement>('.carouselCard')];

  const tabletQuery = globalThis.matchMedia('(max-width: 768px)');
  let currentIndex = 0;
  let isMoving = false;
  let isDragging = false;
  let pointerId: number | undefined;
  let startX = 0;
  let startY = 0;
  let remainingTime = autoplayDelay;
  let timerStartedAt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let movementTimer: ReturnType<typeof setTimeout> | undefined;

  function updateCards() {
    const middle = Math.floor(cards.length / 2);
    const visibleDistance = tabletQuery.matches ? 1 : 2;

    for (const [index, card] of cards.entries()) {
      let position = index - currentIndex;
      if (position > middle) position -= cards.length;
      if (position < -middle) position += cards.length;

      const previousPosition = Number(card.dataset.position);
      card.classList.toggle('isResetting', Math.abs(position - previousPosition) > 1);
      card.dataset.position = String(position);
      card.dataset.active = String(position === 0);
      card.inert = Math.abs(position) > visibleDistance;
      card.setAttribute('aria-hidden', String(card.inert));
    }

    track.getBoundingClientRect();
    for (const card of cards) {
      card.classList.remove('isResetting');
    }
  }

  function moveSlide(direction: number) {
    if (isMoving || cards.length < 2) return;

    currentIndex += direction;
    if (currentIndex >= cards.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = cards.length - 1;

    updateCards();
    isMoving = true;
    movementTimer = setTimeout(() => {
      isMoving = false;
    }, animationDuration);
  }

  function pauseAutoplay() {
    if (timer === undefined) return;

    clearTimeout(timer);
    timer = undefined;
    remainingTime = Math.max(0, remainingTime - (Date.now() - timerStartedAt));
  }

  function startAutoplay() {
    if (pointerId !== undefined || timer !== undefined || document.hidden || cards.length < 2)
      return;

    timerStartedAt = Date.now();
    timer = setTimeout(() => {
      timer = undefined;
      remainingTime = autoplayDelay;
      moveSlide(1);
      startAutoplay();
    }, remainingTime);
  }

  function changeSlide(direction: number) {
    pauseAutoplay();
    remainingTime = autoplayDelay;
    moveSlide(direction);
    startAutoplay();
  }

  function showPrevious() {
    changeSlide(-1);
  }

  function showNext() {
    changeSlide(1);
  }

  function startSwipe(event: PointerEvent) {
    if (pointerId !== undefined || !event.isPrimary || event.button !== 0) return;

    pointerId = event.pointerId;
    isDragging = false;
    startX = event.clientX;
    startY = event.clientY;
    pauseAutoplay();
  }

  function finishSwipe(event: PointerEvent) {
    if (event.pointerId !== pointerId) return;

    pointerId = undefined;
    const distanceX = event.clientX - startX;
    const distanceY = event.clientY - startY;
    isDragging =
      event.type === 'pointercancel' || Math.abs(distanceX) > 10 || Math.abs(distanceY) > 10;
    if (
      event.type !== 'pointercancel' &&
      Math.abs(distanceX) >= 40 &&
      Math.abs(distanceX) > Math.abs(distanceY)
    ) {
      changeSlide(distanceX < 0 ? 1 : -1);
    } else {
      startAutoplay();
    }
  }

  function handleClick(event: MouseEvent) {
    if (!isDragging || event.detail === 0) return;

    event.preventDefault();
    event.stopPropagation();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    changeSlide(event.key === 'ArrowLeft' ? -1 : 1);
  }

  function handleVisibility() {
    if (document.hidden) {
      pointerId = undefined;
      pauseAutoplay();
    } else {
      startAutoplay();
    }
  }

  previousButton.disabled = cards.length < 2;
  nextButton.disabled = cards.length < 2;
  previousButton.addEventListener('click', showPrevious);
  nextButton.addEventListener('click', showNext);
  track.addEventListener('pointerdown', startSwipe);
  track.addEventListener('click', handleClick, { capture: true });
  track.addEventListener('keydown', handleKeydown);
  globalThis.addEventListener('pointerup', finishSwipe);
  globalThis.addEventListener('pointercancel', finishSwipe);
  tabletQuery.addEventListener('change', updateCards);
  document.addEventListener('visibilitychange', handleVisibility);

  updateCards();
  startAutoplay();

  return function destroy() {
    clearTimeout(timer);
    clearTimeout(movementTimer);
    previousButton.removeEventListener('click', showPrevious);
    nextButton.removeEventListener('click', showNext);
    track.removeEventListener('pointerdown', startSwipe);
    track.removeEventListener('click', handleClick, { capture: true });
    track.removeEventListener('keydown', handleKeydown);
    globalThis.removeEventListener('pointerup', finishSwipe);
    globalThis.removeEventListener('pointercancel', finishSwipe);
    tabletQuery.removeEventListener('change', updateCards);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}
