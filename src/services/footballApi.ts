
export interface TodayMatch {
  id: number;
  time: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
}

interface TeamStats {
  form: string;
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  draws: number;
  losses: number;
  cleanSheets: number;
  cornersTotal: number;
  yellowCards: number;
  redCards: number;
}

interface HeadToHeadResult {
  winner: string;
  homeGoals: number;
  awayGoals: number;
  corners: number;
  cards: number;
  date: string;
}

interface MatchAnalysis {
  teamAStats: TeamStats;
  teamBStats: TeamStats;
  headToHead: HeadToHeadResult[];
  avgGoalsPerMatch: number;
  avgCornersPerMatch: number;
  avgCardsPerMatch: number;
}

// Gestion des clés API
const API_KEY_STORAGE = 'api_football_key';
const DEFAULT_API_KEY = 'fa8a4afc2c8b8e2bcc58d0e6a221f0ee';

export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE, key);
};

export const getApiKey = (): string => {
  return localStorage.getItem(API_KEY_STORAGE) || DEFAULT_API_KEY;
};

export const resetApiKeyToDefault = (): void => {
  localStorage.setItem(API_KEY_STORAGE, DEFAULT_API_KEY);
};

// Simulation de l'appel API pour les matchs du jour
export const getTodayMatches = async (): Promise<TodayMatch[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const matches: TodayMatch[] = [
        { id: 1, time: '18:00', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', league: 'La Liga' },
        { id: 2, time: '20:45', homeTeam: 'Manchester United', awayTeam: 'Liverpool', league: 'Premier League' },
        { id: 3, time: '21:00', homeTeam: 'Paris Saint-Germain', awayTeam: 'Marseille', league: 'Ligue 1' },
        { id: 4, time: '19:30', homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', league: 'Bundesliga' },
        { id: 5, time: '20:00', homeTeam: 'Juventus', awayTeam: 'AC Milan', league: 'Serie A' },
      ];
      resolve(matches);
    }, 500);
  });
};

// Simulation de l'appel API pour l'analyse d'un match
export const getMatchAnalysis = async (teamA: string, teamB: string): Promise<MatchAnalysis> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validation des noms d'équipes
      if (!teamA || !teamB || teamA.length < 3 || teamB.length < 3) {
        reject(new Error("Noms d'équipes invalides."));
        return;
      }
      
      const teamAStats = generateRealisticTeamStats(teamA);
      const teamBStats = generateRealisticTeamStats(teamB);
      const headToHead = generateHeadToHead(teamA, teamB);
      const avgGoalsPerMatch = parseFloat((Math.random() * 3 + 1.5).toFixed(1));
      const avgCornersPerMatch = parseFloat((Math.random() * 8 + 3).toFixed(1));
      const avgCardsPerMatch = parseFloat((Math.random() * 4 + 1).toFixed(1));
      
      const analysis: MatchAnalysis = {
        teamAStats,
        teamBStats,
        headToHead,
        avgGoalsPerMatch,
        avgCornersPerMatch,
        avgCardsPerMatch
      };
      resolve(analysis);
    }, 800);
  });
};

// Utilitaires pour la simulation réaliste
const generateRandomForm = (): string => {
  const results = ['W', 'D', 'L'];
  let form = '';
  for (let i = 0; i < 5; i++) {
    form += results[Math.floor(Math.random() * results.length)];
  }
  return form;
};

// Corrections pour les fonctions manquantes
const generateRealisticTeamStats = (teamName: string): TeamStats => {
  // Simulation basée sur des patterns réalistes
  const baseStats = {
    form: generateRandomForm(),
    goalsFor: Math.floor(Math.random() * 15) + 8, // 8-22 buts
    goalsAgainst: Math.floor(Math.random() * 12) + 3, // 3-14 buts
    wins: Math.floor(Math.random() * 6) + 2, // 2-7 victoires
    draws: Math.floor(Math.random() * 4) + 1, // 1-4 nuls
    losses: Math.floor(Math.random() * 4) + 1, // 1-4 défaites
    cleanSheets: Math.floor(Math.random() * 4) + 1, // 1-4 clean sheets
    cornersTotal: Math.floor(Math.random() * 50) + 30, // 30-79 corners
    yellowCards: Math.floor(Math.random() * 15) + 10, // 10-24 cartons jaunes
    redCards: Math.floor(Math.random() * 3), // 0-2 cartons rouges
  };

  // Ajustements basés sur la popularité de l'équipe
  const popularTeams = [
    'Paris Saint-Germain', 'Real Madrid', 'Barcelona', 'Manchester City',
    'Liverpool', 'Bayern Munich', 'Juventus', 'Manchester United'
  ];
  
  const isPopular = popularTeams.some(team => 
    teamName.toLowerCase().includes(team.toLowerCase()) ||
    team.toLowerCase().includes(teamName.toLowerCase())
  );

  if (isPopular) {
    // Équipes populaires ont généralement de meilleures statistiques
    baseStats.goalsFor += Math.floor(Math.random() * 5) + 3;
    baseStats.wins += Math.floor(Math.random() * 3) + 1;
    baseStats.cleanSheets += Math.floor(Math.random() * 2) + 1;
  }

  return baseStats;
};

const generateHeadToHead = (teamA: string, teamB: string): HeadToHeadResult[] => {
  const h2h: HeadToHeadResult[] = [];
  for (let i = 0; i < 5; i++) {
    const winner = Math.random() > 0.5 ? 'teamA' : Math.random() > 0.3 ? 'teamB' : 'Draw';
    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 4);
    const corners = Math.floor(Math.random() * 12);
    const cards = Math.floor(Math.random() * 6);
    const date = new Date(new Date().setDate(new Date().getDate() - i * 30)).toISOString();
    
    h2h.push({ winner, homeGoals, awayGoals, corners, cards, date });
  }
  return h2h;
};
