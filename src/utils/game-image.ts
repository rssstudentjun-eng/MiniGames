const images = import.meta.glob<string>(
  [
    '/src/assets/images/games/*.{jpg,jpeg,png,webp,avif,svg}',
    '/src/assets/images/*-hero.{jpg,jpeg,png,webp,avif,svg}',
  ],
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
);

export function getGameImageUrl(apiPath: string): string | undefined {
  return images[`/src${apiPath}`] ?? images[`/src/assets/images/${apiPath.split('/').pop()}`];
}
