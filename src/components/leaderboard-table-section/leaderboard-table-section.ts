import './leaderboard-table-section.scss';
import { TopPlayersResponse } from './types/leaderboard-table-types.ts';

export function createLeadBoardSection(
  topPlayers: TopPlayersResponse | 'loading' | 'error',
  onRetry?: () => void,
) {
  const data = typeof topPlayers === 'string' ? [] : topPlayers.data;

  const leaderBordSection = document.createElement('section');
  leaderBordSection.classList.add('leaderboardSection', 'container');

  const sectionLeaderBordTitle = document.createElement('h2');
  sectionLeaderBordTitle.classList.add('sectionLeaderBordTitle');
  const titleText = document.createElement('span');
  titleText.textContent = 'Top Players';

  const titleSuffix = document.createElement('span');
  titleSuffix.className = 'leaderboardTitleSuffix';
  titleSuffix.textContent = ' This Week';
  titleText.append(titleSuffix);
  sectionLeaderBordTitle.append(titleText);

  const wrapper = document.createElement('div');
  wrapper.className = 'leaderboardTableWrapper';
  leaderBordSection.append(sectionLeaderBordTitle, wrapper);

  if (topPlayers === 'loading') {
    wrapper.setAttribute('aria-busy', 'true');
    wrapper.setAttribute('aria-label', 'Loading top players');
    const skeleton = document.createElement('div');
    skeleton.className = 'leaderboardSkeleton';
    skeleton.setAttribute('aria-hidden', 'true');
    wrapper.append(skeleton);
    return { element: leaderBordSection };
  }

  if (data.length === 0) {
    const message = document.createElement('div');
    message.className = 'leaderboardMessage';
    wrapper.classList.add('leaderboardPlaceholder');
    const text = document.createElement('p');
    text.setAttribute('role', topPlayers === 'error' ? 'alert' : 'status');
    text.textContent =
      topPlayers === 'error'
        ? "The leaderboard didn't load. Please try again."
        : 'No top players yet.';
    message.append(text);

    if (topPlayers === 'error') {
      message.classList.add('leaderboardMessageError');
      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.className = 'leaderboardRetry';
      retryButton.textContent = 'Try again';
      retryButton.addEventListener('click', () => {
        retryButton.disabled = true;
        onRetry?.();
      });
      message.append(retryButton);
    }
    wrapper.append(message);
    return { element: leaderBordSection };
  }

  const table = document.createElement('table');
  table.className = 'leaderboardTable';

  const thead = table.createTHead();
  const headerRow = thead.insertRow();

  const columns = ['Rank', 'Player', 'Games Played', 'Total Score', 'Streak', 'Favorite Game'];

  for (const label of columns) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    if (label === 'Games Played') {
      const suffix = document.createElement('span');
      suffix.className = 'leaderboardGamesPlayedSuffix';
      suffix.textContent = ' Played';
      th.textContent = 'Games';
      th.append(suffix);
    } else if (label === 'Total Score') {
      const prefix = document.createElement('span');
      prefix.className = 'leaderboardTotalScorePrefix';
      prefix.textContent = 'Total ';
      th.replaceChildren(prefix, 'Score');
    }
    headerRow.append(th);
  }

  const tbody = table.createTBody();
  const scoreFormatter = new Intl.NumberFormat('en-US');

  const initials: Record<string, string> = {
    Alex_Pro99: 'AP',
    CozyGamer_x: 'CG',
    MatchMaster: 'MM',
    BubblePop: 'BP',
    SudokuGod: 'SG',
  };

  for (const player of data) {
    const row = tbody.insertRow();

    const rank = row.insertCell();
    rank.className = 'leaderboardRank';
    rank.textContent = `#${player.rank}`;

    const playerCell = row.insertCell();
    const playerInfo = document.createElement('div');
    playerInfo.className = 'leaderboardPlayer';

    const avatar = document.createElement('span');
    avatar.className = 'leaderboardAvatar';
    avatar.textContent = initials[player.playerName] ?? player.playerName.slice(0, 2).toUpperCase();
    avatar.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.textContent = player.playerName;

    playerInfo.append(avatar, name);
    playerCell.append(playerInfo);

    const gamesPlayed = row.insertCell();
    gamesPlayed.className = 'leaderboardGamesPlayed';
    gamesPlayed.textContent = String(player.gamesPlayed);

    const score = row.insertCell();
    score.className = 'leaderboardScore';
    const fullScore = document.createElement('span');
    fullScore.className = 'leaderboardScoreFull';
    fullScore.textContent = scoreFormatter.format(player.totalScore);

    const compactScore = document.createElement('span');
    compactScore.className = 'leaderboardScoreCompact';
    compactScore.textContent =
      player.totalScore >= 1000
        ? `${Math.floor(player.totalScore / 100) / 10}K`
        : String(player.totalScore);

    score.append(fullScore, compactScore);

    const streak = row.insertCell();
    streak.className = 'leaderboardStreak';

    const flame = document.createElement('span');
    flame.textContent = '🔥';
    flame.setAttribute('aria-hidden', 'true');

    const daysSuffix = document.createElement('span');
    daysSuffix.className = 'leaderboardDaysSuffix';
    daysSuffix.textContent = player.streakDays === 1 ? 'ay' : 'ays';

    const daysSpace = document.createElement('span');
    daysSpace.className = 'leaderboardDaysSpace';
    daysSpace.textContent = ' ';

    streak.append(flame, `${player.streakDays}`, daysSpace, 'd', daysSuffix);

    const favoriteGame = row.insertCell();
    const badge = document.createElement('span');
    badge.className = 'leaderboardGameBadge';
    badge.textContent = player.favoriteGameName;
    favoriteGame.append(badge);
  }

  wrapper.append(table);
  return { element: leaderBordSection };
}
