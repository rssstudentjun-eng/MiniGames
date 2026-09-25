import './game-details-dialog.scss';

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

export function createGameDetailsDialog(): HTMLDialogElement {
  const gameDetailsDialog = document.createElement('dialog');
  gameDetailsDialog.classList.add('gameDetailsDialog');

  const dialogContent = document.createElement('div');
  dialogContent.classList.add('gameDetailsDialogContent');

  const dialogTitle = document.createElement('h2');
  dialogTitle.textContent = 'Game Details';
  dialogTitle.id = 'game-details-title';
  gameDetailsDialog.setAttribute('aria-labelledby', dialogTitle.id);

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.type = 'button';
  closeButton.classList.add('gameDetailsDialogClose');

  gameDetailsDialog.addEventListener('click', (event) => {
    if (event.target === gameDetailsDialog) {
      closeDialog(gameDetailsDialog);
    }
  });
  gameDetailsDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog(gameDetailsDialog);
  });
  gameDetailsDialog.addEventListener('close', () => {
    gameDetailsDialog.remove();
  });

  gameDetailsDialog.addEventListener('animationend', (event) => {
    if (event.target === gameDetailsDialog && event.animationName === 'closing-animation') {
      gameDetailsDialog.close();
    }
  });

  closeButton.addEventListener('click', () => {
    closeDialog(gameDetailsDialog);
  });

  dialogContent.append(dialogTitle, closeButton);
  gameDetailsDialog.append(dialogContent);

  return gameDetailsDialog;
}
