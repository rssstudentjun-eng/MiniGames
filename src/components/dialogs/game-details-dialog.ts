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
import { getGameComments, getGameDetails } from '../../services/api.ts';
import { getGameImageUrl } from '../../utils/game-image.ts';
import { formatCommentTime } from '../../utils/format-comment-time.ts';
import { GameComment, GameDetails } from './types/dialog-types.ts';

const medals = [medal_1, medal_2, medal_3];

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
}

export async function fetchGameDetails(
  slug: string,
  signal?: AbortSignal,
): Promise<GameDialogData | undefined> {
  const [{ data: gameData }, { data: comments, meta }] = await Promise.all([
    getGameDetails(slug, signal),
    getGameComments(slug, signal),
  ]);

  if (signal?.aborted) return;

  if (
    !gameData ||
    !meta ||
    !gameData.name ||
    !gameData.fullDescription ||
    !gameData.specs ||
    !Array.isArray(gameData.topRecords) ||
    !Array.isArray(comments) ||
    !Number.isFinite(meta.totalComments)
  ) {
    throw new Error('Game details are unavailable');
  }

  return { gameData, comments, totalComments: meta.totalComments };
}

function createGameDetailsContent(result: GameDialogData) {
  const { gameData, comments, totalComments } = result;

  const dialogContent = document.createElement('div');
  dialogContent.classList.add('gameDetailsDialogContent');

  const cardImage = document.createElement('img');
  cardImage.classList.add('cardImage');
  cardImage.alt = gameData.name;

  const imageUrl = getGameImageUrl(`/assets/images/games/${gameData.slug}-card.jpg`);

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
  likesBlock.textContent = `${gameData?.likesCount / 100 / 10}K`;
  likesBlock.prepend(likesBlockImg);

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
  commentsBlockTitle.textContent = `Comments (${totalComments})`;

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

  commentInputBlock.append(userFirstLetterName, inputComment, sendCommentButton);

  const commentsList = document.createElement('ul');
  commentsList.classList.add('commentsList');

  for (const [index, comment] of comments.entries()) {
    const commentItem = document.createElement('li');
    commentItem.classList.add('commentItem');

    const commentTop = document.createElement('div');
    commentTop.classList.add('commentTop');

    const commentAuthorFirstLetter = document.createElement('p');
    commentAuthorFirstLetter.classList.add('commentAuthorFirstLetter');
    commentAuthorFirstLetter.textContent = comment.authorName.slice(0, 1);

    const commentAuthor = document.createElement('p');
    commentAuthor.classList.add('commentAuthor');
    commentAuthor.textContent = comment.authorName;
    if (index === 0) {
      commentAuthorFirstLetter.classList.add('firstComment');
    } else if (index === 2) {
      commentAuthorFirstLetter.classList.add('thirdComment');
    }

    const daysCounter = document.createElement('time');
    daysCounter.classList.add('daysCounter');
    daysCounter.dateTime = comment.createdAt;
    daysCounter.textContent = formatCommentTime(comment.createdAt);

    commentTop.append(commentAuthorFirstLetter, commentAuthor, daysCounter);

    const commentContent = document.createElement('p');
    commentContent.classList.add('commentContent');
    commentContent.textContent = comment.text;

    const commentLikesBlock = document.createElement('p');
    commentLikesBlock.classList.add('commentLikesBlock');
    const heartIconComment = document.createElement('img');
    heartIconComment.src = index < 2 ? grayHeartIcon : heartIcon;
    heartIconComment.alt = '';
    commentLikesBlock.textContent = String(comment.likesCount);
    commentLikesBlock.prepend(heartIconComment);

    commentItem.append(commentTop, commentContent, commentLikesBlock);
    commentsList.append(commentItem);
  }

  commentsBlock.append(commentsBlockTitle, commentInputBlock, commentsList);

  if (comments.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.classList.add('emptyMessage');
    emptyMessage.textContent = 'Comments list is empty';
    commentsBlock.append(emptyMessage);
  }
  const dialogButtonsWrapper = document.createElement('div');
  dialogButtonsWrapper.classList.add('dialogButtonsWrapper');

  const playButton = document.createElement('button');
  playButton.classList.add('playButton');
  playButton.type = 'button';
  playButton.textContent = 'Play Now';

  const addFavoritesButton = document.createElement('button');
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

  async function loadContent() {
    requestState.controller?.abort();
    const controller = new AbortController();
    requestState.controller = controller;
    gameDetailsDialog.setAttribute('aria-busy', 'true');
    content.replaceChildren(createGameDetailsSkeleton());

    try {
      const result = await fetchGameDetails(slug, controller.signal);
      if (!result || controller.signal.aborted) return;
      content.replaceChildren(createGameDetailsContent(result));
      gameDetailsDialog.setAttribute('aria-labelledby', 'game-details-title');
    } catch (error) {
      if (controller.signal.aborted) return;
      controller.abort();
      console.error('Error fetching game details:', error);
      const errorBlock = document.createElement('div');
      errorBlock.classList.add('gameDetailsError');
      errorBlock.setAttribute('role', 'alert');
      const title = document.createElement('h2');
      title.textContent = 'No data available';
      const message = document.createElement('p');
      message.textContent = 'Please check your connection and try again.';
      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.classList.add('playButton');
      retryButton.textContent = 'Try again';
      retryButton.addEventListener('click', () => {
        void loadContent();
      });
      errorBlock.append(title, message, retryButton);
      content.replaceChildren(errorBlock);
    } finally {
      if (requestState.controller === controller) {
        gameDetailsDialog.setAttribute('aria-busy', 'false');
      }
    }
  }

  gameDetailsDialog.addEventListener('click', (event) => {
    const target = event.target;
    if (
      target === gameDetailsDialog ||
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
