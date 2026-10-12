import './game-details-dialog.scss';
import starIcon from '../../assets/icons/starIcon.svg';
import heartIcon from '../../assets/icons/heartIcon.svg';
import grayHeartIcon from '../../assets/icons/grayHeartIcon.svg';
import sendCommentIcon from '../../assets/icons/sendCommentIcon.svg';
import closeIcon from '../../assets/icons/closeIcon.svg';
import cupImageIcon from '../../assets/images/cup.png';
import medal_1 from '../../assets/images/medal_1.png';
import medal_2 from '../../assets/images/medal_2.png';
import medal_3 from '../../assets/images/medal_3.png';
import {
  ApiError,
  getGameComments,
  getGameDetails,
  sendGameComment,
  toggleGameFavoriteApi,
  toggleCommentLike,
} from '../../services/api.ts';
import { getGameImageUrl } from '../../utils/game-image.ts';
import { formatCommentTime } from '../../utils/format-comment-time.ts';
import { GameComment, GameDetails } from './types/dialog-types.ts';
import { showSnackbar } from '../snackbar/snackbar.ts';
import { hasActiveSession, session } from '../../state/session.ts';
import { getProfileName } from '../header/header.ts';

const medals = [medal_1, medal_2, medal_3];
const avatarColors = new Map<string, string>();
const avatarTokens = [
  '--avatar-random-1',
  '--avatar-random-2',
  '--avatar-random-3',
  '--avatar-random-4',
  '--avatar-random-5',
];

export function closeDialog(gameDetailsDialog: HTMLDialogElement) {
  if (!gameDetailsDialog.open || gameDetailsDialog.classList.contains('isClosing')) {
    return;
  }

  if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gameDetailsDialog.close();
    return;
  }

  gameDetailsDialog.classList.add('isClosing');
}

interface GameDialogData {
  gameData: GameDetails;
  comments: GameComment[];
  totalComments: number;
  commentsError?: boolean;
  profile?: typeof session.profile;
}

export async function fetchGameDetails(
  slug: string,
  signal?: AbortSignal,
): Promise<GameDialogData | undefined> {
  const profile = hasActiveSession() ? session.profile : undefined;
  const { data: gameData } = await getGameDetails(slug, signal, profile?.email);
  if (signal?.aborted) return;
  if (!gameData) throw new ApiError(404);
  if (
    !gameData.name ||
    !gameData.fullDescription ||
    !gameData.specs ||
    !Array.isArray(gameData.topRecords)
  ) {
    throw new Error('Game details are unavailable');
  }

  try {
    const { data: comments, meta } = await getGameComments(slug, signal, profile?.email);
    if (signal?.aborted) return;
    if (!Array.isArray(comments) || !Number.isFinite(meta?.totalComments)) {
      throw new TypeError('Comments are unavailable');
    }
    return { gameData, comments, totalComments: meta.totalComments, profile };
  } catch {
    if (signal?.aborted) return;
    showSnackbar('Could not load comments.', 'error');
    return {
      gameData,
      comments: [],
      totalComments: 0,
      commentsError: true,
      profile,
    };
  }
}

export async function sendComment(
  slug: string,
  userEmail: string,
  authorName: string,
  text: string,
): Promise<GameComment> {
  const response = await sendGameComment(slug, userEmail, authorName, text);
  if (!response.data) throw new Error('Comment result is unknown');
  return response.data;
}

function createGameDetailsContent(
  result: GameDialogData,
  onRetry: () => void,
  onCommentSent: () => Promise<void>,
) {
  const { gameData, comments, totalComments, commentsError } = result;

  const dialogContent = document.createElement('div');
  dialogContent.classList.add('gameDetailsDialogContent');

  const cardImage = document.createElement('img');
  cardImage.classList.add('cardImage');
  cardImage.alt = gameData.name;

  const imageUrl =
    getGameImageUrl(gameData.heroImage) ??
    getGameImageUrl(`/assets/images/games/${gameData.slug}-card.jpg`);

  if (imageUrl) {
    cardImage.src = imageUrl;
  } else {
    cardImage.hidden = true;
    console.warn('Image not found:', gameData.heroImage);
  }

  const titleBlock = document.createElement('div');
  titleBlock.classList.add('titleBlock');
  const statsInfoBlock = document.createElement('div');
  statsInfoBlock.classList.add('statsInfoBlock');

  const ratingBlock = document.createElement('div');
  ratingBlock.classList.add('ratingBlock');
  const ratingBlockImg = document.createElement('img');
  ratingBlockImg.alt = 'Rating';
  ratingBlockImg.src = starIcon;
  ratingBlock.textContent = String(gameData?.rating);
  ratingBlock.prepend(ratingBlockImg);

  const likesBlock = document.createElement('div');
  likesBlock.classList.add('likesBlock');
  const likesBlockImg = document.createElement('img');
  likesBlockImg.alt = 'Likes';
  likesBlockImg.src = heartIcon;
  const likesCount = document.createElement('span');
  likesCount.textContent = String(gameData.likesCount);
  likesBlock.append(likesBlockImg, likesCount);

  statsInfoBlock.append(ratingBlock, likesBlock);

  const dialogTitle = document.createElement('h2');
  dialogTitle.classList.add('dialogTitle');
  dialogTitle.textContent = gameData?.name;
  dialogTitle.id = 'game-details-title';

  titleBlock.append(dialogTitle, statsInfoBlock);

  const dialogDescription = document.createElement('p');
  dialogDescription.classList.add('dialogDescription');
  dialogDescription.textContent = gameData?.fullDescription;

  const gameInfoWrapper = document.createElement('div');
  gameInfoWrapper.classList.add('gameInfoWrapper');

  const specsEntries = Object.entries(gameData.specs);

  for (const [key, value] of specsEntries) {
    const item = document.createElement('div');
    item.classList.add('gameInfoItem');

    const label = document.createElement('p');
    label.classList.add('gameInfoLabel');
    label.textContent = key;

    const description = document.createElement('p');
    description.classList.add('gameInfoDescription');
    description.textContent = value;

    item.append(label, description);
    gameInfoWrapper.append(item);
  }

  const topRecordsBlock = document.createElement('div');
  topRecordsBlock.classList.add('topRecordsBlock');
  const topRecordsTitle = document.createElement('h3');
  topRecordsTitle.textContent = 'Top Records';
  topRecordsTitle.classList.add('topRecordsTitle');
  const cupImage = document.createElement('img');
  cupImage.alt = '';
  cupImage.src = cupImageIcon;
  topRecordsTitle.prepend(cupImage);
  topRecordsBlock.append(topRecordsTitle);

  const topRecords = gameData.topRecords;

  for (const value of topRecords) {
    const item = document.createElement('div');
    item.classList.add('gameRecordsItem');

    const name = document.createElement('p');
    name.classList.add('gameRecordName');
    name.textContent = value.playerName;

    const medalSource = medals[value.position - 1];

    if (medalSource) {
      const medal = document.createElement('img');
      medal.classList.add('gameRecordMedal');
      medal.src = medalSource;
      medal.alt = `Place ${value.position}`;

      name.prepend(medal);
    }

    const score = document.createElement('p');
    score.classList.add('gameRecordPoint');
    score.textContent = `${(value.score / 1000).toFixed(3).replace('.', ',')} pts`;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const difference = Date.now() - new Date(value.achievedAt).getTime();
    const daysAgo = Math.floor(difference / millisecondsPerDay);

    const daysCounter = document.createElement('p');
    daysCounter.classList.add('gameRecordDaysAgo');
    daysCounter.textContent = `${daysAgo} days ago`;

    item.append(name, score, daysCounter);
    topRecordsBlock.append(item);
  }
  const commentsBlock = document.createElement('div');
  commentsBlock.classList.add('commentsBlock');

  const commentsBlockTitle = document.createElement('h3');
  commentsBlockTitle.classList.add('commentsBlockTitle');
  commentsBlockTitle.textContent = commentsError ? 'Comments' : `Comments (${totalComments})`;

  const commentInputBlock = document.createElement('div');
  commentInputBlock.classList.add('commentInputBlock');

  const userFirstLetterName = document.createElement('p');
  userFirstLetterName.classList.add('userFirstLetterName');
  userFirstLetterName.textContent = 'U';

  const inputComment = document.createElement('textarea');
  inputComment.classList.add('inputComment');
  inputComment.placeholder = 'Write a comment...';

  const sendCommentButton = document.createElement('button');
  sendCommentButton.classList.add('sendCommentButton');
  const sendCommentButtonImg = document.createElement('img');
  sendCommentButtonImg.alt = 'Send comment';
  sendCommentButtonImg.src = sendCommentIcon;
  sendCommentButton.append(sendCommentButtonImg);

  const commentMessage = document.createElement('p');
  commentMessage.className = 'commentMessage';
  commentMessage.setAttribute('role', 'status');
  commentMessage.hidden = true;
  let isSending = false;

  function updateCommentForm(): void {
    const isGuest = !session.profile;
    inputComment.disabled = isGuest || isSending;
    sendCommentButton.disabled = isGuest || isSending;
    sendCommentButton.setAttribute('aria-busy', String(isSending));
    sendCommentButton.setAttribute('aria-label', isSending ? 'Sending comment...' : 'Send comment');
    inputComment.placeholder = isGuest ? 'Sign in to write a comment.' : 'Write a comment...';
  }

  function resizeCommentInput(): void {
    inputComment.style.height = 'auto';
    const borderHeight = inputComment.offsetHeight - inputComment.clientHeight;
    inputComment.style.height = `${inputComment.scrollHeight + borderHeight}px`;
    inputComment.style.overflowY =
      inputComment.scrollHeight > inputComment.clientHeight ? 'auto' : 'hidden';
  }

  function showCommentMessage(message: string): void {
    commentMessage.textContent = message;
    commentMessage.hidden = false;
    showSnackbar(message, 'error');
  }

  async function submitComment(): Promise<void> {
    if (isSending) return;
    if (!hasActiveSession()) {
      showCommentMessage('Please sign in to send a comment.');
      globalThis.dispatchEvent(new Event('app:require-auth'));
      return;
    }
    const profile = session.profile;
    if (!profile?.email) return;
    const text = inputComment.value.trim();
    if (!text || text.length > 500) {
      showCommentMessage('Comment must contain 1?500 characters.');
      return;
    }
    let authorName = getProfileName(profile);
    if (authorName.length < 2 || authorName.length > 30) authorName = 'Player';
    isSending = true;
    commentMessage.textContent = 'Sending comment...';
    commentMessage.hidden = false;
    updateCommentForm();
    try {
      await sendComment(gameData.slug, profile.email, authorName, text);
      inputComment.value = '';
      resizeCommentInput();
      showSnackbar('Comment sent.', 'success');
      if (dialogContent.isConnected) await onCommentSent();
    } catch (error) {
      let message =
        'The result is unknown. Your comment may have been sent. Check the list before retrying.';
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        message =
          error.status === 429
            ? 'Too many requests. Please wait before trying again.'
            : 'Comment was rejected. Please check your text and try again.';
      }
      showCommentMessage(message);
    } finally {
      isSending = false;
      updateCommentForm();
    }
  }

  inputComment.setAttribute('aria-label', 'Comment');
  inputComment.addEventListener('input', resizeCommentInput);
  inputComment.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) {
      return;
    }

    event.preventDefault();
    void submitComment();
  });
  sendCommentButton.type = 'button';
  sendCommentButton.addEventListener('click', () => void submitComment());
  dialogContent.addEventListener('app:profile', updateCommentForm);
  updateCommentForm();

  commentInputBlock.append(userFirstLetterName, inputComment, sendCommentButton);

  const commentsList = document.createElement('ul');
  commentsList.classList.add('commentsList');

  function renderComments(items: GameComment[], profile = session.profile): void {
    commentsList.replaceChildren();
    if (!commentsError && items.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.classList.add('emptyMessage');
      emptyMessage.textContent = 'Comments list is empty';
      commentsList.append(emptyMessage);
    }
    for (const comment of items) {
      const commentItem = document.createElement('li');
      commentItem.classList.add('commentItem');

      const commentTop = document.createElement('div');
      commentTop.classList.add('commentTop');

      const commentAuthorFirstLetter = document.createElement('p');
      commentAuthorFirstLetter.classList.add('commentAuthorFirstLetter');
      const authorName = comment.authorName.trim();
      commentAuthorFirstLetter.textContent = [...authorName][0]?.toUpperCase() ?? '';
      let avatarColor = avatarColors.get(authorName);
      if (!avatarColor) {
        const randomIndex = Math.floor(Math.random() * avatarTokens.length);
        avatarColor = avatarTokens[randomIndex];
        avatarColors.set(authorName, avatarColor);
      }
      commentAuthorFirstLetter.style.backgroundColor = `var(${avatarColor})`;

      const commentAuthor = document.createElement('p');
      commentAuthor.classList.add('commentAuthor');
      commentAuthor.textContent = comment.authorName;

      const daysCounter = document.createElement('time');
      daysCounter.classList.add('daysCounter');
      daysCounter.dateTime = comment.createdAt;
      daysCounter.textContent = formatCommentTime(comment.createdAt);

      commentTop.append(commentAuthorFirstLetter, commentAuthor, daysCounter);

      const commentContent = document.createElement('p');
      commentContent.classList.add('commentContent');
      commentContent.textContent = comment.text;

      const commentLikesBlock = document.createElement('button');
      commentLikesBlock.type = 'button';
      commentLikesBlock.classList.add('commentLikesBlock');
      const heartIconComment = document.createElement('img');
      heartIconComment.alt = '';
      const likeCount = document.createElement('span');
      let isLiked = Boolean(profile && comment.isLikedByCurrentUser);
      let isPending = false;

      function updateLikeButton(): void {
        heartIconComment.src = isLiked ? heartIcon : grayHeartIcon;
        likeCount.textContent = isPending ? 'Loading...' : String(comment.likesCount);
        commentLikesBlock.disabled = isPending;
        commentLikesBlock.setAttribute('aria-pressed', String(isLiked));
        commentLikesBlock.setAttribute('aria-busy', String(isPending));
        commentLikesBlock.setAttribute('aria-label', isLiked ? 'Unlike comment' : 'Like comment');
      }

      commentLikesBlock.append(heartIconComment, likeCount);
      updateLikeButton();
      commentLikesBlock.addEventListener('click', async () => {
        if (isPending) return;
        if (!hasActiveSession()) {
          showSnackbar('Please sign in to like comments.', 'error');
          globalThis.dispatchEvent(new Event('app:require-auth'));
          return;
        }
        const activeProfile = session.profile;
        if (!activeProfile?.email) return;
        isPending = true;
        updateLikeButton();
        try {
          const { data } = await toggleCommentLike(comment.commentId, activeProfile.email);
          if (!hasActiveSession() || session.profile !== activeProfile) return;
          isLiked = data.isLikedByCurrentUser;
          comment.isLikedByCurrentUser = isLiked;
          comment.likesCount = data.likesCount;
          showSnackbar(isLiked ? 'Comment liked.' : 'Comment like removed.', 'success');
        } catch (error) {
          let message = 'The result is unknown. Reopen the game to check the like before retrying.';
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            message =
              error.status === 429
                ? 'Too many requests. Please wait before trying again.'
                : 'Could not update the comment like. Please try again.';
          }
          showSnackbar(message, 'error');
        } finally {
          isPending = false;
          updateLikeButton();
        }
      });

      commentItem.append(commentTop, commentContent, commentLikesBlock);
      commentsList.append(commentItem);
    }
  }
  renderComments(comments, result.profile);

  let commentsProfile = result.profile;
  async function refreshCommentLikes(): Promise<void> {
    const profile = session.profile;
    if (profile === commentsProfile) return;
    commentsProfile = profile;
    if (!profile?.email) {
      renderComments(comments, undefined);
      return;
    }
    commentsList.setAttribute('aria-busy', 'true');
    const loading = document.createElement('li');
    loading.textContent = 'Loading comments...';
    commentsList.replaceChildren(loading);
    try {
      const { data, meta } = await getGameComments(gameData.slug, undefined, profile.email);
      if (session.profile !== profile) return;
      comments.splice(0, comments.length, ...data);
      renderComments(comments, profile);
      commentsBlockTitle.textContent = `Comments (${meta.totalComments})`;
    } catch {
      if (session.profile !== profile) return;
      loading.textContent = 'Comments could not be loaded. Please reopen the game.';
      loading.setAttribute('role', 'alert');
      showSnackbar('Could not load comments.', 'error');
    } finally {
      if (session.profile === profile) commentsList.setAttribute('aria-busy', 'false');
    }
  }
  dialogContent.addEventListener('app:profile', () => void refreshCommentLikes());

  commentsBlock.append(commentsBlockTitle, commentInputBlock, commentMessage, commentsList);

  if (commentsError) {
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent = 'Comments could not be loaded. Please try again.';
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.classList.add('playButton');
    retryButton.textContent = 'Try again';
    retryButton.addEventListener('click', onRetry);
    commentsBlock.append(message, retryButton);
  }
  const dialogButtonsWrapper = document.createElement('div');
  dialogButtonsWrapper.classList.add('dialogButtonsWrapper');

  const playButton = document.createElement('button');
  playButton.classList.add('playButton');
  playButton.type = 'button';
  playButton.textContent = 'Play Now';

  const addFavoritesButton = document.createElement('button');
  addFavoritesButton.type = 'button';
  addFavoritesButton.classList.add('addFavoritesButton');

  const buttonText = document.createElement('span');
  buttonText.classList.add('addFavoritesButtonText');
  buttonText.textContent = 'Add to favorites';
  const heartIconButton = document.createElement('img');
  heartIconButton.alt = '';
  heartIconButton.classList.add('heartIconButton');
  heartIconButton.src = grayHeartIcon;

  addFavoritesButton.replaceChildren(heartIconButton, buttonText);
  addFavoritesButton.setAttribute('aria-label', 'Add to favorites');

  let isPending = false;
  let favoriteProfile = result.profile;
  let isFavorited = Boolean(favoriteProfile && gameData.isLikedByCurrentUser);

  function updateFavoriteButton(): void {
    const label = isFavorited ? 'Remove from favorites' : 'Add to favorites';
    buttonText.textContent = isPending ? 'Loading...' : label;
    heartIconButton.src = isFavorited ? heartIcon : grayHeartIcon;
    addFavoritesButton.disabled = isPending;
    addFavoritesButton.setAttribute('aria-pressed', String(isFavorited));
    addFavoritesButton.setAttribute('aria-busy', String(isPending));
    addFavoritesButton.setAttribute('aria-label', label);
  }

  async function refreshFavorite(): Promise<void> {
    const profile = session.profile;
    if (profile === favoriteProfile) return;
    favoriteProfile = profile;
    isFavorited = false;
    if (!profile?.email) {
      isPending = false;
      updateFavoriteButton();
      return;
    }
    isPending = true;
    updateFavoriteButton();
    try {
      const { data } = await getGameDetails(gameData.slug, undefined, profile.email);
      if (session.profile !== profile) return;
      isFavorited = data.isLikedByCurrentUser;
      likesCount.textContent = String(data.likesCount);
    } catch {
      if (session.profile === profile)
        showSnackbar('Could not load favorite status. Please reopen the game.', 'error');
    } finally {
      if (favoriteProfile === profile) {
        isPending = false;
        updateFavoriteButton();
      }
    }
  }

  dialogContent.addEventListener('app:profile', () => void refreshFavorite());
  updateFavoriteButton();

  addFavoritesButton.addEventListener('click', async () => {
    if (isPending) return;
    if (!hasActiveSession()) {
      showSnackbar('Please sign in to manage favorites.', 'error');
      globalThis.dispatchEvent(new Event('app:require-auth'));
      return;
    }
    const profile = session.profile;
    if (!profile?.email) {
      showSnackbar('Your profile has no email address.', 'error');
      return;
    }
    isPending = true;
    updateFavoriteButton();
    try {
      const { data } = await toggleGameFavoriteApi(gameData.slug, profile.email);
      if (!hasActiveSession() || session.profile !== profile) return;
      isFavorited = data.isFavorited;
      likesCount.textContent = String(data.likesCount);
      showSnackbar(
        isFavorited ? 'Game added to favorites.' : 'Game removed from favorites.',
        'success',
      );
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 429
          ? 'Too many requests. Please wait before trying again.'
          : 'Could not confirm the change. Reopen the game to check its status.';
      showSnackbar(message, 'error');
    } finally {
      if (favoriteProfile === profile) {
        isPending = false;
        updateFavoriteButton();
      }
    }
  });

  dialogButtonsWrapper.append(playButton, addFavoritesButton);

  const gameInfoBlock = document.createElement('div');
  gameInfoBlock.classList.add('gameInfoBlock');

  gameInfoBlock.append(
    titleBlock,
    dialogDescription,
    gameInfoWrapper,
    dialogButtonsWrapper,
    topRecordsBlock,
    commentsBlock,
  );

  dialogContent.append(cardImage, gameInfoBlock);

  return dialogContent;
}

export function createGameDetailsDialog(slug: string, onClose: () => void): HTMLDialogElement {
  const gameDetailsDialog = document.createElement('dialog');
  gameDetailsDialog.classList.add('gameDetailsDialog');
  gameDetailsDialog.setAttribute('aria-label', 'Game details');

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.classList.add('gameDetailsDialogClose');
  closeButton.setAttribute('aria-label', 'Close game details');
  const closeImage = document.createElement('img');
  closeImage.src = closeIcon;
  closeImage.alt = '';
  closeImage.classList.add('closeButtonImage');
  closeButton.append(closeImage);

  const content = document.createElement('div');
  gameDetailsDialog.append(closeButton, content);
  const requestState: { controller?: AbortController } = {};

  function updateProfile(): void {
    const avatar = content.querySelector('.userFirstLetterName');
    if (avatar) {
      avatar.textContent = session.profile
        ? [...getProfileName(session.profile)][0].toUpperCase()
        : 'U';
    }
    gameDetailsDialog.dataset.authenticated = String(Boolean(session.profile));
    content.querySelector('.gameDetailsDialogContent')?.dispatchEvent(new Event('app:profile'));
  }

  gameDetailsDialog.addEventListener('app:profile', updateProfile);
  gameDetailsDialog.addEventListener(
    'click',
    (event) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest('.addFavoritesButton, .sendCommentButton, .commentLikesBlock'))
        return;
      if (hasActiveSession()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showSnackbar('Please sign in to use this action.', 'error');
      globalThis.dispatchEvent(new Event('app:require-auth'));
    },
    { capture: true },
  );

  async function loadContent(isRetry = false) {
    requestState.controller?.abort();
    const controller = new AbortController();
    requestState.controller = controller;
    gameDetailsDialog.setAttribute('aria-busy', 'true');
    content.replaceChildren(createGameDetailsSkeleton());

    try {
      const result = await fetchGameDetails(slug, controller.signal);
      if (!result || controller.signal.aborted) return;
      content.replaceChildren(
        createGameDetailsContent(
          result,
          () => void loadContent(true),
          () => loadContent(),
        ),
      );
      updateProfile();
      if (isRetry && !result.commentsError) showSnackbar('Game details loaded.', 'success');
      gameDetailsDialog.setAttribute('aria-labelledby', 'game-details-title');
    } catch (error) {
      if (controller.signal.aborted) return;
      controller.abort();
      const isNotFound = error instanceof ApiError && error.status === 404;
      showSnackbar(isNotFound ? 'Game Not Found.' : 'Could not load game details.', 'error');
      const errorBlock = document.createElement('div');
      errorBlock.classList.add('gameDetailsError');
      errorBlock.setAttribute('role', 'alert');
      const title = document.createElement('h2');
      title.textContent = isNotFound ? 'Game Not Found' : 'Game details could not be loaded';
      const message = document.createElement('p');
      message.textContent = isNotFound
        ? 'The requested game does not exist.'
        : 'Please check your connection and try again.';
      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.classList.add('playButton');
      retryButton.textContent = 'Try again';
      retryButton.addEventListener('click', () => {
        void loadContent(true);
      });
      errorBlock.append(title, message);
      if (!isNotFound) errorBlock.append(retryButton);
      content.replaceChildren(errorBlock);
    } finally {
      if (requestState.controller === controller) {
        gameDetailsDialog.setAttribute('aria-busy', 'false');
      }
    }
  }

  gameDetailsDialog.addEventListener('click', (event) => {
    const target = event.target;
    const rect = gameDetailsDialog.getBoundingClientRect();
    const isOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (
      (target === gameDetailsDialog && isOutside) ||
      (target instanceof Element && target.closest('.gameDetailsDialogClose'))
    ) {
      requestState.controller?.abort();
      onClose();
    }
  });
  gameDetailsDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    requestState.controller?.abort();
    onClose();
  });
  gameDetailsDialog.addEventListener('close', () => {
    requestState.controller?.abort();
    gameDetailsDialog.remove();
  });

  gameDetailsDialog.addEventListener('animationend', (event) => {
    if (event.target === gameDetailsDialog && event.animationName === 'closing-animation') {
      gameDetailsDialog.close();
    }
  });

  void loadContent();
  return gameDetailsDialog;
}

function createGameDetailsSkeleton(): HTMLElement {
  const skeleton = document.createElement('div');
  skeleton.classList.add('gameDetailsSkeleton');
  skeleton.setAttribute('role', 'status');
  skeleton.setAttribute('aria-label', 'Loading game details');
  const blocks = ['hero', 'title', 'text', 'text', 'specs', 'records', 'records', 'comments'];
  for (const block of blocks) {
    const placeholder = document.createElement('div');
    placeholder.classList.add('gameDetailsSkeletonBlock', `gameDetailsSkeleton-${block}`);
    placeholder.setAttribute('aria-hidden', 'true');
    skeleton.append(placeholder);
  }
  return skeleton;
}
