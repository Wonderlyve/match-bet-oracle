
import { BettingPrediction } from '@/components/BettingTicket';

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

export const generatePredictions = (
  teamA: string, 
  teamB: string, 
  analysis: MatchAnalysis
): BettingPrediction[] => {
  const predictions: BettingPrediction[] = [];
  
  // Calcul de la force relative des équipes
  const teamAStrength = calculateTeamStrength(analysis.teamAStats);
  const teamBStrength = calculateTeamStrength(analysis.teamBStats);
  
  // Analyse des H2H
  const h2hAdvantage = analyzeHeadToHead(analysis.headToHead, teamA, teamB);
  
  console.log(`Force ${teamA}: ${teamAStrength}, Force ${teamB}: ${teamBStrength}`);
  console.log(`Avantage H2H: ${h2hAdvantage}`);
  
  // 1. Prédiction de victoire
  const winnerPrediction = predictWinner(teamA, teamB, teamAStrength, teamBStrength, h2hAdvantage);
  predictions.push(winnerPrediction);
  
  // 2. Prédiction Over/Under
  const overUnderPrediction = predictOverUnder(analysis.avgGoalsPerMatch, analysis.teamAStats, analysis.teamBStats);
  predictions.push(overUnderPrediction);
  
  // 3. Prédiction Both Teams to Score
  const bttsPredicton = predictBothTeamsToScore(analysis.teamAStats, analysis.teamBStats);
  predictions.push(bttsPredicton);
  
  return predictions;
};

const calculateTeamStrength = (stats: TeamStats): number => {
  const formScore = calculateFormScore(stats.form);
  const goalDiff = stats.goalsFor - stats.goalsAgainst;
  const winRate = stats.wins / (stats.wins + stats.draws + stats.losses);
  
  return (formScore * 0.4) + (goalDiff * 0.3) + (winRate * 100 * 0.3);
};

const calculateFormScore = (form: string): number => {
  let score = 0;
  for (const result of form) {
    if (result === 'W') score += 3;
    else if (result === 'D') score += 1;
  }
  return score;
};

const analyzeHeadToHead = (h2h: HeadToHeadResult[], teamA: string, teamB: string): number => {
  let teamAWins = 0;
  let teamBWins = 0;
  
  h2h.forEach(result => {
    if (result.winner === teamA) teamAWins++;
    else if (result.winner === teamB) teamBWins++;
  });
  
  return teamAWins - teamBWins;
};

const predictWinner = (
  teamA: string, 
  teamB: string, 
  strengthA: number, 
  strengthB: number, 
  h2hAdvantage: number
): BettingPrediction => {
  const strengthDiff = strengthA - strengthB + h2hAdvantage;
  const homeAdvantage = 2; // Avantage domicile
  const totalAdvantage = strengthDiff + homeAdvantage;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (totalAdvantage > 5) {
    prediction = `Victoire ${teamA}`;
    confidence = Math.min(85, 65 + Math.abs(totalAdvantage) * 2);
    odds = '1.60';
    reasoning = `${teamA} montre une forme supérieure et bénéficie de l'avantage domicile.`;
  } else if (totalAdvantage < -5) {
    prediction = `Victoire ${teamB}`;
    confidence = Math.min(85, 65 + Math.abs(totalAdvantage) * 2);
    odds = '2.20';
    reasoning = `${teamB} présente de meilleures statistiques récentes malgré l'extérieur.`;
  } else {
    prediction = 'Match nul ou X';
    confidence = 55 + Math.random() * 15;
    odds = '3.10';
    reasoning = 'Les deux équipes sont très équilibrées, le match nul est probable.';
  }
  
  return {
    type: 'Résultat du match',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};

const predictOverUnder = (avgGoals: number, teamAStats: TeamStats, teamBStats: TeamStats): BettingPrediction => {
  const teamAAvgGoals = teamAStats.goalsFor / (teamAStats.wins + teamAStats.draws + teamAStats.losses);
  const teamBAvgGoals = teamBStats.goalsFor / (teamBStats.wins + teamBStats.draws + teamBStats.losses);
  
  const projectedGoals = (teamAAvgGoals + teamBAvgGoals + avgGoals) / 2;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (projectedGoals > 2.7) {
    prediction = 'Plus de 2.5 buts';
    confidence = Math.min(80, 60 + (projectedGoals - 2.5) * 20);
    odds = '1.75';
    reasoning = 'Les deux équipes ont des attaques productives, match ouvert attendu.';
  } else {
    prediction = 'Moins de 2.5 buts';
    confidence = Math.min(75, 60 + (2.5 - projectedGoals) * 15);
    odds = '1.90';
    reasoning = 'Match serré avec des défenses solides, peu de buts attendus.';
  }
  
  return {
    type: 'Total de buts',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};

const predictBothTeamsToScore = (teamAStats: TeamStats, teamBStats: TeamStats): BettingPrediction => {
  const teamAAttack = teamAStats.goalsFor / (teamAStats.wins + teamAStats.draws + teamAStats.losses);
  const teamBAttack = teamBStats.goalsFor / (teamBStats.wins + teamBStats.draws + teamBStats.losses);
  
  const teamADefense = teamAStats.goalsAgainst / (teamAStats.wins + teamAStats.draws + teamAStats.losses);
  const teamBDefense = teamBStats.goalsAgainst / (teamBStats.wins + teamBStats.draws + teamBStats.losses);
  
  const bttsScore = (teamAAttack + teamBAttack + teamADefense + teamBDefense) / 4;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (bttsScore > 1.2) {
    prediction = 'Les deux équipes marquent';
    confidence = Math.min(75, 55 + bttsScore * 15);
    odds = '1.65';
    reasoning = 'Attaques efficaces des deux côtés, défenses perméables.';
  } else {
    prediction = 'Au moins une équipe ne marque pas';
    confidence = Math.min(70, 60 + (1.2 - bttsScore) * 10);
    odds = '2.10';
    reasoning = 'Une ou les deux équipes ont des difficultés offensives.';
  }
  
  return {
    type: 'Both Teams to Score',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};
