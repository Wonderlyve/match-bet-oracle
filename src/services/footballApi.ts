
// Simulation d'appel API pour la démonstration
// Dans un vrai projet, remplacer par l'API réelle avec clé d'API

interface TeamStats {
  form: string;
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  draws: number;
  losses: number;
}

interface HeadToHeadResult {
  winner: string;
  homeGoals: number;
  awayGoals: number;
}

interface MatchAnalysis {
  teamAStats: TeamStats;
  teamBStats: TeamStats;
  headToHead: HeadToHeadResult[];
  avgGoalsPerMatch: number;
}

// Simulation des données pour la démonstration
const generateMockStats = (): TeamStats => ({
  form: ['W', 'L', 'W', 'D', 'W'].sort(() => 0.5 - Math.random()).join(''),
  goalsFor: Math.floor(Math.random() * 20) + 10,
  goalsAgainst: Math.floor(Math.random() * 15) + 5,
  wins: Math.floor(Math.random() * 8) + 2,
  draws: Math.floor(Math.random() * 4) + 1,
  losses: Math.floor(Math.random() * 5) + 1
});

const generateMockHeadToHead = (teamA: string, teamB: string): HeadToHeadResult[] => {
  const results: HeadToHeadResult[] = [];
  for (let i = 0; i < 5; i++) {
    const homeGoals = Math.floor(Math.random() * 4);
    const awayGoals = Math.floor(Math.random() * 4);
    results.push({
      winner: homeGoals > awayGoals ? teamA : awayGoals > homeGoals ? teamB : 'Draw',
      homeGoals,
      awayGoals
    });
  }
  return results;
};

export const getMatchAnalysis = async (teamA: string, teamB: string): Promise<MatchAnalysis> => {
  // Simulation d'un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  console.log(`Récupération des statistiques pour ${teamA} vs ${teamB}`);
  
  const teamAStats = generateMockStats();
  const teamBStats = generateMockStats();
  const headToHead = generateMockHeadToHead(teamA, teamB);
  
  return {
    teamAStats,
    teamBStats,
    headToHead,
    avgGoalsPerMatch: 2.5 + Math.random() * 1.5
  };
};

// Dans un vrai projet, utiliser quelque chose comme :
/*
export const getMatchAnalysis = async (teamA: string, teamB: string): Promise<MatchAnalysis> => {
  const API_KEY = 'votre_clé_api';
  const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';
  
  const headers = {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  };
  
  // Recherche des équipes
  const teamAResponse = await fetch(`${BASE_URL}/teams?search=${teamA}`, { headers });
  const teamBResponse = await fetch(`${BASE_URL}/teams?search=${teamB}`, { headers });
  
  // ... reste de l'implémentation avec la vraie API
};
*/
