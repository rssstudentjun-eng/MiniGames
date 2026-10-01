export function formatCommentTime(createdAt: string): string {
  const timestamp = new Date(createdAt).getTime();

  if (Number.isNaN(timestamp)) return '';

  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes < 1) return 'just now';

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  if (days < 30) {
    const weeks = Math.min(3, Math.floor(days / 7));

    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  if (days < 365) {
    const months = Math.min(11, Math.floor(days / 30));

    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(days / 365);

  return years === 1 ? '1 year ago' : `${years} years ago`;
}
