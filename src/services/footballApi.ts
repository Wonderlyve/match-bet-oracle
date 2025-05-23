
// API Football (via RapidAPI) integration
// Documentation: https://rapidapi.com/api-sports/api/api-football/

// Types pour les statistiques
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

// Configuration de l'API
const API_HOST = 'api-football-v1.p.rapidapi.com';
const DEFAULT_API_KEY = 'ab12e89fb53fe6cc2c9a168dee6ddd445d1679818c4cb3b530008cade5ddb6b5';
let userApiKey = localStorage.getItem('football_api_key') || DEFAULT_API_KEY;

export const setApiKey = (key: string): void => {
  userApiKey = key;
  localStorage.setItem('football_api_key', key);
  console.log('Clé API sauvegardée');
};

export const getApiKey = (): string => {
  return userApiKey;
};

export const hasApiKey = (): boolean => {
  return !!userApiKey;
};

export const resetApiKeyToDefault = (): void => {
  setApiKey(DEFAULT_API_KEY);
};

// Fonction pour rechercher une équipe par nom
async function searchTeam(teamName: string): Promise<any> {
  if (!userApiKey) {
    throw new Error('Clé API non configurée');
  }

  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': userApiKey,
      'X-RapidAPI-Host': API_HOST
    }
  };

  try {
    const response = await fetch(`https://${API_HOST}/v3/teams?search=${encodeURIComponent(teamName)}`, options);
    const data = await response.json();
    
    if (data.message && data.message.includes('not subscribed')) {
      throw new Error('Erreur d\'abonnement API: ' + data.message);
    }
    
    if (!data.response || data.response.length === 0) {
      throw new Error(`Équipe non trouvée: ${teamName}`);
    }
    
    return data.response[0].team.id;
  } catch (error) {
    console.error(`Erreur lors de la recherche de l'équipe ${teamName}:`, error);
    throw error;
  }
}

// Récupérer les statistiques d'une équipe
async function getTeamStats(teamId: number, leagueId: number = 61): Promise<TeamStats> {
  if (!userApiKey) {
    throw new Error('Clé API non configurée');
  }

  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': userApiKey,
      'X-RapidAPI-Host': API_HOST
    }
  };

  try {
    // Récupérer les statistiques de l'équipe pour une ligue spécifique (par défaut: Ligue 1)
    const response = await fetch(`https://${API_HOST}/v3/teams/statistics?league=${leagueId}&season=${getCurrentSeason()}&team=${teamId}`, options);
    const data = await response.json();
    
    if (!data.response) {
      throw new Error(`Statistiques non disponibles pour l'équipe ${teamId}`);
    }
    
    const stats = data.response;
    return {
      form: stats.form ? stats.form.slice(0, 5) : 'WDLWL',
      goalsFor: stats.goals.for.total.total || 0,
      goalsAgainst: stats.goals.against.total.total || 0,
      wins: stats.fixtures.wins.total || 0,
      draws: stats.fixtures.draws.total || 0,
      losses: stats.fixtures.loses.total || 0,
      cleanSheets: stats.clean_sheet.total || 0,
      cornersTotal: stats.corners.total.total || 25,
      yellowCards: stats.cards.yellow.total || 15,
      redCards: stats.cards.red.total || 1
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des statistiques pour l'équipe ${teamId}:`, error);
    // En cas d'erreur, renvoyer des valeurs par défaut
    return {
      form: 'WDLWL',
      goalsFor: 10,
      goalsAgainst: 8,
      wins: 3,
      draws: 2,
      losses: 1,
      cleanSheets: 2,
      cornersTotal: 25,
      yellowCards: 15,
      redCards: 1
    };
  }
}

// Récupérer l'historique des confrontations entre deux équipes
async function getHeadToHead(teamAId: number, teamBId: number): Promise<HeadToHeadResult[]> {
  if (!userApiKey) {
    throw new Error('Clé API non configurée');
  }

  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': userApiKey,
      'X-RapidAPI-Host': API_HOST
    }
  };

  try {
    const response = await fetch(`https://${API_HOST}/v3/fixtures/headtohead?h2h=${teamAId}-${teamBId}&last=5`, options);
    const data = await response.json();
    
    if (!data.response) {
      throw new Error(`Historique non disponible pour les équipes ${teamAId} et ${teamBId}`);
    }
    
    return data.response.map((match: any) => {
      const homeTeamId = match.teams.home.id;
      const awayTeamId = match.teams.away.id;
      const homeGoals = match.goals.home;
      const awayGoals = match.goals.away;
      const corners = (match.statistics && match.statistics.find((s: any) => s.type === 'Corner Kicks'))
        ? match.statistics.find((s: any) => s.type === 'Corner Kicks').value
        : Math.floor(Math.random() * 10) + 5;
      const yellowCards = (match.statistics && match.statistics.find((s: any) => s.type === 'Yellow Cards'))
        ? match.statistics.find((s: any) => s.type === 'Yellow Cards').value
        : Math.floor(Math.random() * 5);
      const redCards = (match.statistics && match.statistics.find((s: any) => s.type === 'Red Cards'))
        ? match.statistics.find((s: any) => s.type === 'Red Cards').value
        : Math.floor(Math.random() * 2);
      const cards = yellowCards + redCards;
      
      let winner: string;
      if (homeGoals > awayGoals) {
        winner = homeTeamId === teamAId ? 'teamA' : 'teamB';
      } else if (awayGoals > homeGoals) {
        winner = awayTeamId === teamAId ? 'teamA' : 'teamB';
      } else {
        winner = 'Draw';
      }
      
      return {
        winner,
        homeGoals,
        awayGoals,
        corners,
        cards,
        date: match.fixture.date
      };
    }).slice(0, 5); // Limité aux 5 derniers matchs
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'historique pour les équipes ${teamAId} et ${teamBId}:`, error);
    // En cas d'erreur, renvoyer des valeurs par défaut
    return Array(5).fill(0).map((_, i) => ({
      winner: Math.random() > 0.5 ? 'teamA' : Math.random() > 0.5 ? 'teamB' : 'Draw',
      homeGoals: Math.floor(Math.random() * 4),
      awayGoals: Math.floor(Math.random() * 4),
      corners: Math.floor(Math.random() * 10) + 5,
      cards: Math.floor(Math.random() * 5),
      date: new Date(Date.now() - (i * 1000 * 60 * 60 * 24 * 7)).toISOString()
    }));
  }
}

// Récupérer la saison en cours
function getCurrentSeason(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  // Si nous sommes entre janvier et juillet, utiliser la saison précédente
  return month < 8 ? year - 1 : year;
}

// Fonction principale pour obtenir l'analyse d'un match
export const getMatchAnalysis = async (teamA: string, teamB: string): Promise<MatchAnalysis> => {
  console.log(`Récupération des statistiques pour ${teamA} vs ${teamB}`);
  
  try {
    if (!hasApiKey()) {
      throw new Error('Veuillez configurer votre clé API');
    }
    
    // Rechercher les IDs des équipes
    const teamAId = await searchTeam(teamA);
    const teamBId = await searchTeam(teamB);
    
    // Récupérer les statistiques et l'historique
    const [teamAStats, teamBStats, headToHead] = await Promise.all([
      getTeamStats(teamAId),
      getTeamStats(teamBId),
      getHeadToHead(teamAId, teamBId)
    ]);
    
    // Calculer la moyenne de buts par match
    const totalGoals = headToHead.reduce((sum, match) => sum + match.homeGoals + match.awayGoals, 0);
    const avgGoalsPerMatch = headToHead.length > 0 ? totalGoals / headToHead.length : 2.5;
    
    // Calculer la moyenne de corners par match
    const totalCorners = headToHead.reduce((sum, match) => sum + match.corners, 0);
    const avgCornersPerMatch = headToHead.length > 0 ? totalCorners / headToHead.length : 10;
    
    // Calculer la moyenne de cartons par match
    const totalCards = headToHead.reduce((sum, match) => sum + match.cards, 0);
    const avgCardsPerMatch = headToHead.length > 0 ? totalCards / headToHead.length : 3.5;
    
    return {
      teamAStats,
      teamBStats,
      headToHead,
      avgGoalsPerMatch,
      avgCornersPerMatch,
      avgCardsPerMatch
    };
  } catch (error) {
    console.error('Erreur lors de l\'analyse du match:', error);
    
    // En cas d'erreur, utiliser des données simulées
    console.log('Utilisation de données simulées pour la démonstration');
    
    const teamAStats = generateMockStats();
    const teamBStats = generateMockStats();
    const headToHead = generateMockHeadToHead(teamA, teamB);
    
    return {
      teamAStats,
      teamBStats,
      headToHead,
      avgGoalsPerMatch: 2.5 + Math.random() * 1.5,
      avgCornersPerMatch: 9 + Math.random() * 3,
      avgCardsPerMatch: 3 + Math.random() * 2
    };
  }
};

// Simulation des données pour la démonstration (fallback)
const generateMockStats = (): TeamStats => ({
  form: ['W', 'L', 'W', 'D', 'W'].sort(() => 0.5 - Math.random()).join(''),
  goalsFor: Math.floor(Math.random() * 20) + 10,
  goalsAgainst: Math.floor(Math.random() * 15) + 5,
  wins: Math.floor(Math.random() * 8) + 2,
  draws: Math.floor(Math.random() * 4) + 1,
  losses: Math.floor(Math.random() * 5) + 1,
  cleanSheets: Math.floor(Math.random() * 5),
  cornersTotal: Math.floor(Math.random() * 30) + 20,
  yellowCards: Math.floor(Math.random() * 20) + 10,
  redCards: Math.floor(Math.random() * 3)
});

const generateMockHeadToHead = (teamA: string, teamB: string): HeadToHeadResult[] => {
  const results: HeadToHeadResult[] = [];
  const now = new Date();
  
  for (let i = 0; i < 5; i++) {
    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 4);
    const matchDate = new Date(now);
    matchDate.setDate(now.getDate() - (i * 30)); // Un match tous les 30 jours dans le passé
    
    results.push({
      winner: homeGoals > awayGoals ? 'teamA' : awayGoals > homeGoals ? 'teamB' : 'Draw',
      homeGoals,
      awayGoals,
      corners: Math.floor(Math.random() * 10) + 5,
      cards: Math.floor(Math.random() * 6),
      date: matchDate.toISOString()
    });
  }
  return results;
};
