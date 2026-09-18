import './leaderboard-table-section.scss';

interface TopPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameSlug: string;
  favoriteGameName: string;
}

interface TopPlayersResponse {
  data: TopPlayer[];
  meta: {
    totalItems: number;
    description: string;
  };
}

const topPlayers: TopPlayersResponse = {
  data: [
    {
      rank: 1,
      playerName: 'Alex_Pro99',
      gamesPlayed: 142,
      totalScore: 94_250,
      streakDays: 12,
      favoriteGameSlug: 'heartopia',
      favoriteGameName: 'Heartopia',
    },
    {
      rank: 2,
      playerName: 'CozyGamer_x',
      gamesPlayed: 118,
      totalScore: 81_400,
      streakDays: 8,
      favoriteGameSlug: 'cat-mail-co',
      favoriteGameName: 'Cat Mail Co.',
    },
    {
      rank: 3,
      playerName: 'MatchMaster',
      gamesPlayed: 98,
      totalScore: 72_110,
      streakDays: 5,
      favoriteGameSlug: 'tiny-glade',
      favoriteGameName: 'Tiny Glade',
    },
    {
      rank: 4,
      playerName: 'BubblePop',
      gamesPlayed: 87,
      totalScore: 65_900,
      streakDays: 3,
      favoriteGameSlug: 'whisper-of-the-house',
      favoriteGameName: 'Whisper of the House',
    },
    {
      rank: 5,
      playerName: 'SudokuGod',
      gamesPlayed: 74,
      totalScore: 59_320,
      streakDays: 2,
      favoriteGameSlug: 'cat-chess',
      favoriteGameName: 'Cat Chess',
    },
  ],
  meta: {
    totalItems: 5,
    description: 'Top Players This Week',
  },
};

export function createLeadBoardSection(): HTMLElement {
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

  for (const player of topPlayers.data) {
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
  leaderBordSection.append(sectionLeaderBordTitle, wrapper);

  return leaderBordSection;
}
