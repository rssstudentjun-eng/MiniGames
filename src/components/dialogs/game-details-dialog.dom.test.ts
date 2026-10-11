import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGameDetailsDialog } from './game-details-dialog.ts';
import { ApiError, getGameComments, getGameDetails, sendGameComment } from '../../services/api.ts';
import { hasActiveSession, session } from '../../state/session.ts';
import { showSnackbar } from '../snackbar/snackbar.ts';
import type { GameComment, GameDetails } from './types/dialog-types.ts';

vi.mock('../../services/api.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/api.ts')>()),
  getGameDetails: vi.fn(),
  getGameComments: vi.fn(),
  sendGameComment: vi.fn(),
}));
vi.mock('../../state/session.ts', () => ({
  session: { profile: undefined },
  hasActiveSession: vi.fn(),
}));
vi.mock('../header/header.ts', () => ({
  getProfileName: vi.fn(() => 'Alex'),
}));
vi.mock('../snackbar/snackbar.ts', () => ({ showSnackbar: vi.fn() }));

const game: GameDetails = {
  slug: 'test-game',
  name: 'Test game',
  heroImage: '/assets/images/games/test-game-card.jpg',
  rating: 5,
  likesCount: 0,
  isLikedByCurrentUser: false,
  fullDescription: 'A test game',
  specs: { genre: 'Puzzle', players: '1', duration: '5 min', price: 'Free' },
  topRecords: [],
};
const comment: GameComment = {
  commentId: 'new-comment',
  authorName: 'Alex',
  text: 'New comment',
  likesCount: 0,
  isLikedByCurrentUser: false,
  createdAt: new Date().toISOString(),
};

async function setupDialog(text = 'New comment') {
  const dialog = createGameDetailsDialog(game.slug, vi.fn());
  document.body.append(dialog);
  await vi.waitFor(() => expect(dialog.querySelector('.inputComment')).not.toBeNull());
  const input = dialog.querySelector<HTMLTextAreaElement>('.inputComment')!;
  const button = dialog.querySelector<HTMLButtonElement>('.sendCommentButton')!;
  input.value = text;
  return { dialog, input, button };
}

function pressEnter(input: HTMLTextAreaElement, options: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true, ...options });
  input.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  vi.resetAllMocks();
  session.profile = { displayName: 'Alex', email: 'alex@example.com', authenticatedAt: Date.now() };
  vi.mocked(hasActiveSession).mockReturnValue(true);
  vi.mocked(getGameDetails).mockResolvedValue({ data: game });
  vi.mocked(getGameComments).mockResolvedValue({
    data: [],
    meta: { totalComments: 0, returnedCount: 0 },
  });
  vi.mocked(sendGameComment).mockResolvedValue({ data: comment });
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
  session.profile = undefined;
});

describe('Game comment form', () => {
  it('trims surrounding whitespace and preserves internal whitespace', async () => {
    const { button } = await setupDialog(' \n Hello  world\nagain \t ');
    button.click();
    expect(sendGameComment).toHaveBeenCalledWith(
      game.slug,
      'alex@example.com',
      'Alex',
      'Hello  world\nagain',
    );
    await vi.waitFor(() => expect(getGameComments).toHaveBeenCalledTimes(2));
  });

  it.each(['', ' \n\t ', 'a'.repeat(501)])('rejects empty or oversized text: %j', async (text) => {
    const { input, button } = await setupDialog(text);
    button.click();
    expect(sendGameComment).not.toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith(
      expect.stringContaining('Comment must contain'),
      'error',
    );
    expect(input.value).toBe(text);
    expect(button.disabled).toBe(false);
    expect(getGameComments).toHaveBeenCalledTimes(1);
  });

  it.each([1, 500])('accepts %i characters after trimming', async (length) => {
    const text = 'a'.repeat(length);
    const { button } = await setupDialog(`  ${text}\n`);
    button.click();
    expect(sendGameComment).toHaveBeenCalledWith(game.slug, 'alex@example.com', 'Alex', text);
    await vi.waitFor(() => expect(getGameComments).toHaveBeenCalledTimes(2));
  });

  it('submits with Enter and prevents a newline', async () => {
    const { input } = await setupDialog();
    expect(pressEnter(input).defaultPrevented).toBe(true);
    expect(sendGameComment).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(getGameComments).toHaveBeenCalledTimes(2));
  });

  it.each([{ shiftKey: true }, { isComposing: true }])(
    'leaves Shift+Enter and composing Enter to the browser: %j',
    async (options) => {
      const { input } = await setupDialog();
      expect(pressEnter(input, options).defaultPrevented).toBe(false);
      expect(sendGameComment).not.toHaveBeenCalled();
    },
  );

  it('locks the form and blocks duplicate submissions until the request finishes', async () => {
    let isRequestFinished = false;
    vi.mocked(sendGameComment).mockImplementation(async () => {
      await vi.waitFor(() => expect(isRequestFinished).toBe(true));
      throw new Error('Network failure');
    });
    const { input, button } = await setupDialog();
    button.click();
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    button.click();
    pressEnter(input);
    expect(sendGameComment).toHaveBeenCalledTimes(1);
    isRequestFinished = true;
    await vi.waitFor(() => expect(button.disabled).toBe(false));
    expect(input.disabled).toBe(false);
    expect(button.getAttribute('aria-busy')).toBe('false');
    expect(input.value).toBe('New comment');
    expect(getGameComments).toHaveBeenCalledTimes(1);
  });

  it.each([
    { status: 400, message: 'Comment was rejected. Please check your text and try again.' },
    { status: 429, message: 'Too many requests. Please wait before trying again.' },
    {
      status: 500,
      message:
        'The result is unknown. Your comment may have been sent. Check the list before retrying.',
    },
  ])('preserves text and unlocks the form after HTTP $status', async ({ status, message }) => {
    vi.mocked(sendGameComment).mockRejectedValue(new ApiError(status));
    const text = '  My comment\nwith a second line  ';
    const { dialog, input, button } = await setupDialog(text);
    const initialList = dialog.querySelector('.commentsList')!.textContent;
    button.click();
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    await vi.waitFor(() => expect(button.disabled).toBe(false));

    expect(showSnackbar).toHaveBeenCalledExactlyOnceWith(message, 'error');
    const feedback = dialog.querySelector<HTMLParagraphElement>('.commentMessage')!;
    expect(feedback.hidden).toBe(false);
    expect(feedback.textContent).toBe(message);
    expect(input.value).toBe(text);
    expect(input.disabled).toBe(false);
    expect(button.getAttribute('aria-busy')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Send comment');
    expect(sendGameComment).toHaveBeenCalledTimes(1);
    expect(getGameComments).toHaveBeenCalledTimes(1);
    expect(dialog.querySelector('.commentsList')!.textContent).toBe(initialList);
    expect(dialog.querySelector('.commentsBlockTitle')!.textContent).toBe('Comments (0)');
  });

  it.each([
    { action: 'click', message: 'Please sign in to use this action.' },
    { action: 'Enter', message: 'Please sign in to send a comment.' },
  ])(
    'requires authentication when the session expires before $action',
    async ({ action, message }) => {
      const text = '  Unsent comment\nsecond line  ';
      const { dialog, input, button } = await setupDialog(text);
      const initialList = dialog.querySelector('.commentsList')!.textContent;
      const dispatchEvent = vi.spyOn(globalThis, 'dispatchEvent');
      vi.mocked(hasActiveSession).mockReturnValue(false);

      if (action === 'click') {
        button.click();
      } else {
        expect(pressEnter(input).defaultPrevented).toBe(true);
        const feedback = dialog.querySelector<HTMLParagraphElement>('.commentMessage')!;
        expect(feedback.hidden).toBe(false);
        expect(feedback.textContent).toBe(message);
      }

      expect(showSnackbar).toHaveBeenCalledExactlyOnceWith(message, 'error');
      expect(dispatchEvent).toHaveBeenCalledTimes(1);
      expect(dispatchEvent.mock.calls[0][0].type).toBe('app:require-auth');
      expect(sendGameComment).not.toHaveBeenCalled();
      expect(input.value).toBe(text);
      expect(button.getAttribute('aria-busy')).toBe('false');
      expect(getGameComments).toHaveBeenCalledTimes(1);
      expect(dialog.querySelector('.commentsList')!.textContent).toBe(initialList);
    },
  );

  it('disables the form for guests', async () => {
    session.profile = undefined;
    vi.mocked(hasActiveSession).mockReturnValue(false);
    const { input, button } = await setupDialog();
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    button.click();
    expect(sendGameComment).not.toHaveBeenCalled();
  });

  it('blocks the comment form on sign-out and preserves the draft', async () => {
    const { dialog, input, button } = await setupDialog('Unsent draft');
    expect(input.disabled).toBe(false);
    expect(button.disabled).toBe(false);

    session.profile = undefined;
    vi.mocked(hasActiveSession).mockReturnValue(false);
    dialog.dispatchEvent(new Event('app:profile'));

    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    expect(input.placeholder).toBe('Sign in to write a comment.');
    expect(input.value).toBe('Unsent draft');
    expect(dialog.dataset.authenticated).toBe('false');
    expect(dialog.querySelector('.userFirstLetterName')!.textContent).toBe('U');
    button.click();
    expect(sendGameComment).not.toHaveBeenCalled();
    expect(getGameComments).toHaveBeenCalledTimes(1);
  });

  it('unlocks the guest form on sign-in and allows sending the preserved draft', async () => {
    session.profile = undefined;
    vi.mocked(hasActiveSession).mockReturnValue(false);
    const { dialog, input, button } = await setupDialog('Unsent draft');
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);

    session.profile = {
      displayName: 'Alex',
      email: 'alex@example.com',
      authenticatedAt: Date.now(),
    };
    vi.mocked(hasActiveSession).mockReturnValue(true);
    dialog.dispatchEvent(new Event('app:profile'));

    expect(input.disabled).toBe(false);
    expect(button.disabled).toBe(false);
    expect(input.placeholder).toBe('Write a comment...');
    expect(input.value).toBe('Unsent draft');
    expect(dialog.dataset.authenticated).toBe('true');
    expect(dialog.querySelector('.userFirstLetterName')!.textContent).toBe('A');
    await vi.waitFor(() =>
      expect(dialog.querySelector('.commentsList')!.getAttribute('aria-busy')).toBe('false'),
    );
    button.click();
    expect(sendGameComment).toHaveBeenCalledExactlyOnceWith(
      game.slug,
      'alex@example.com',
      'Alex',
      'Unsent draft',
    );
    await vi.waitFor(() => expect(showSnackbar).toHaveBeenCalledWith('Comment sent.', 'success'));
    await vi.waitFor(() => expect(dialog.querySelector('.inputComment')).not.toBe(input));
  });

  it('shows a reload error without resending a successfully posted comment', async () => {
    const { dialog, button } = await setupDialog();
    vi.mocked(getGameComments).mockRejectedValue(new ApiError(500));
    button.click();

    await vi.waitFor(() =>
      expect(dialog.querySelector(':scope .commentsBlock [role="alert"]')!.textContent).toBe(
        'Comments could not be loaded. Please try again.',
      ),
    );
    expect(showSnackbar).toHaveBeenCalledWith('Comment sent.', 'success');
    expect(showSnackbar).toHaveBeenCalledWith('Could not load comments.', 'error');
    expect(sendGameComment).toHaveBeenCalledTimes(1);
    expect(getGameComments).toHaveBeenCalledTimes(2);
    expect(dialog.querySelector('.commentsBlockTitle')!.textContent).toBe('Comments');
    expect(dialog.querySelector<HTMLTextAreaElement>('.inputComment')!.value).toBe('');

    vi.mocked(getGameComments).mockResolvedValue({
      data: [comment],
      meta: { totalComments: 1, returnedCount: 1 },
    });
    const retry = dialog.querySelector<HTMLButtonElement>(':scope .commentsBlock .playButton')!;
    expect(retry.textContent).toBe('Try again');
    retry.click();
    await vi.waitFor(() =>
      expect(dialog.querySelector('.commentsBlockTitle')!.textContent).toBe('Comments (1)'),
    );
    expect(dialog.querySelector('.commentsList')!.textContent).toContain(comment.text);
    expect(sendGameComment).toHaveBeenCalledTimes(1);
    expect(getGameComments).toHaveBeenCalledTimes(3);
  });

  it.each(['success', 'error'] as const)(
    'does not reload a closed dialog when the pending comment finishes with %s',
    async (outcome) => {
      let isRequestFinished = false;
      vi.mocked(sendGameComment).mockImplementation(async () => {
        await vi.waitFor(() => expect(isRequestFinished).toBe(true));
        if (outcome === 'error') throw new ApiError(500);
        return { data: comment };
      });
      const { dialog, button } = await setupDialog();
      button.click();
      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(sendGameComment).toHaveBeenCalledTimes(1);

      dialog.dispatchEvent(new Event('close'));
      expect(dialog.isConnected).toBe(false);
      expect(document.querySelector('.gameDetailsDialog')).toBeNull();
      isRequestFinished = true;
      await vi.waitFor(() => expect(button.getAttribute('aria-busy')).toBe('false'));

      expect(getGameDetails).toHaveBeenCalledTimes(1);
      expect(getGameComments).toHaveBeenCalledTimes(1);
      expect(sendGameComment).toHaveBeenCalledTimes(1);
      expect(document.querySelector('.gameDetailsDialog')).toBeNull();
      expect(showSnackbar).toHaveBeenCalledExactlyOnceWith(
        outcome === 'success'
          ? 'Comment sent.'
          : 'The result is unknown. Your comment may have been sent. Check the list before retrying.',
        outcome === 'success' ? 'success' : 'error',
      );
    },
  );

  it('reloads the list and count and clears the input after successful submission', async () => {
    const { dialog, button } = await setupDialog();
    vi.mocked(getGameComments).mockResolvedValue({
      data: [comment],
      meta: { totalComments: 7, returnedCount: 1 },
    });
    button.click();
    await vi.waitFor(() =>
      expect(dialog.querySelector('.commentsBlockTitle')!.textContent).toBe('Comments (7)'),
    );
    expect(getGameComments).toHaveBeenCalledTimes(2);
    expect(getGameComments).toHaveBeenLastCalledWith(
      game.slug,
      expect.any(AbortSignal),
      'alex@example.com',
    );
    expect(dialog.querySelectorAll(':scope .commentsList > li')).toHaveLength(1);
    expect(dialog.querySelector('.commentsList')!.textContent).toContain(comment.text);
    expect(dialog.querySelector<HTMLTextAreaElement>('.inputComment')!.value).toBe('');
    expect(showSnackbar).toHaveBeenCalledWith('Comment sent.', 'success');
  });
});
