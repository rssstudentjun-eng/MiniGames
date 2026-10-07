import {
  filterValues,
  type GameCategory,
} from '../components/library-section/games-filter/games-filter.ts';
import { sortingValues, type SortingValue } from '../components/library-section/sorting/sorting.ts';
import type { AuthMode } from '../components/dialogs/auth-dialog.ts';
import { hasActiveSession } from '../state/session.ts';

export interface LibraryState {
  category: GameCategory;
  sort: SortingValue;
  page: number;
}

export function restoreRedirectedRoute(): void {
  const url = new URL(globalThis.location.href);
  const redirectedPath = url.searchParams.get('__spa');
  if (!redirectedPath) return;
  const destination = new URL(redirectedPath, url.origin);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (
    destination.origin === url.origin &&
    (destination.pathname === base || destination.pathname.startsWith(`${base}/`))
  ) {
    history.replaceState({}, '', destination);
  } else {
    url.searchParams.delete('__spa');
    history.replaceState({}, '', url);
  }
}

export function getRoutePath(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const pathname = globalThis.location.pathname;
  const hasBase = base && (pathname === base || pathname.startsWith(`${base}/`));
  const path = hasBase ? pathname.slice(base.length) : pathname;
  return path.replace(/\/$/, '') || '/home';
}

export function readRouteState() {
  const parameters = new URLSearchParams(globalThis.location.search);
  const category = filterValues.find((value) => value === parameters.get('category')) ?? 'all';
  const sort =
    sortingValues.find((value) => value.value === parameters.get('sort')) ?? sortingValues[0];
  const requestedPage = Number(parameters.get('page') ?? '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const authParameter = parameters.get('auth');
  const auth: AuthMode | undefined =
    authParameter === 'login' || authParameter === 'register' ? authParameter : undefined;
  return {
    path: getRoutePath(),
    library: { category, sort, page },
    gameSlug: parameters.get('game')?.trim() || undefined,
    auth,
  };
}

function notifyNavigation(): void {
  globalThis.dispatchEvent(new Event('app:navigate'));
}

export function navigate(path: string): void {
  hasActiveSession();
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const url = new URL(`${base}${path}`, globalThis.location.origin);
  if (url.href === globalThis.location.href) return;
  history.pushState({}, '', url);
  notifyNavigation();
}

export function updateRouteParameters(
  changes: Record<string, string | undefined>,
  shouldReplace = false,
): void {
  hasActiveSession();
  const url = new URL(globalThis.location.href);
  const entries = Object.entries(changes);
  for (const [key, value] of entries) {
    if (value === undefined) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  if (url.href === globalThis.location.href) return;
  const current = readRouteState();
  const hasDialog = Boolean(current.gameSlug || current.auth);
  const opensDialog = url.searchParams.has('game') || url.searchParams.has('auth');
  const previousDepth = globalThis.history.state?.dialogDepth;
  const nextDepth =
    Number.isSafeInteger(previousDepth) && previousDepth > 0 ? previousDepth + 1 : 0;
  let dialogDepth = 0;
  if (opensDialog && !shouldReplace) {
    dialogDepth = hasDialog ? nextDepth : 1;
  }
  const state = shouldReplace ? history.state : { dialogDepth };
  if (shouldReplace) history.replaceState(state, '', url);
  else history.pushState(state, '', url);
  notifyNavigation();
}

export function openGameDialog(slug: string): void {
  updateRouteParameters({ game: slug, auth: undefined });
}

export function openAuthentication(mode: AuthMode): void {
  const state = readRouteState();
  updateRouteParameters({ auth: mode, game: undefined }, Boolean(state.auth || state.gameSlug));
}

export function closeRouteDialog(): void {
  hasActiveSession();
  const depth = globalThis.history.state?.dialogDepth;
  if (Number.isSafeInteger(depth) && depth > 0) {
    history.go(-depth);
    return;
  }
  updateRouteParameters({ game: undefined, auth: undefined }, true);
}

export function normalizeRouteParameters(): void {
  const state = readRouteState();
  const url = new URL(globalThis.location.href);
  const values = {
    category: state.library.category,
    sort: state.library.sort.value,
    page: String(state.library.page),
    game: state.auth ? undefined : state.gameSlug,
    auth: state.auth,
  };
  const entries = Object.entries(values);
  for (const [key, value] of entries) {
    if (!url.searchParams.has(key)) continue;
    if (value === undefined) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  if (url.href !== globalThis.location.href) history.replaceState(history.state, '', url);
}
