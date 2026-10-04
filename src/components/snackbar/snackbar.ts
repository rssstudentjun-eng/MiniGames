import './snackbar.scss';

const snackbarState: { element?: HTMLDivElement; timer?: ReturnType<typeof setTimeout> } = {};

export function showSnackbar(message: string, type: 'success' | 'error'): void {
  snackbarState.element?.remove();
  clearTimeout(snackbarState.timer);

  const snackbar = document.createElement('div');
  snackbarState.element = snackbar;
  snackbar.classList.add('snackbar', type === 'error' ? 'snackbarError' : 'snackbarSuccess');
  snackbar.setAttribute('role', type === 'error' ? 'alert' : 'status');
  snackbar.setAttribute('popover', 'manual');
  snackbar.textContent = message;
  document.body.append(snackbar);
  snackbar.showPopover();

  snackbarState.timer = setTimeout(() => {
    snackbar.remove();
    snackbarState.element = undefined;
  }, 5000);
}
