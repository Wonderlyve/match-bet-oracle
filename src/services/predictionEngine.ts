
import { BettingPrediction } from '@/components/BettingTicket';

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
  
  // 2. Prédiction Double Chance
  const doubleChancePrediction = predictDoubleChance(teamA, teamB, teamAStrength, teamBStrength, h2hAdvantage);
  predictions.push(doubleChancePrediction);
  
  // 3. Prédiction Over/Under buts
  const overUnderPrediction = predictOverUnder(analysis.avgGoalsPerMatch, analysis.teamAStats, analysis.teamBStats);
  predictions.push(overUnderPrediction);
  
  // 4. Prédiction Both Teams to Score
  const bttsPredicton = predictBothTeamsToScore(analysis.teamAStats, analysis.teamBStats);
  predictions.push(bttsPredicton);
  
  // 5. Prédiction Corners
  const cornersPrediction = predictCorners(analysis.avgCornersPerMatch, analysis.teamAStats, analysis.teamBStats);
  predictions.push(cornersPrediction);
  
  // 6. Prédiction Cartons
  const cardsPrediction = predictCards(analysis.avgCardsPerMatch, analysis.teamAStats, analysis.teamBStats);
  predictions.push(cardsPrediction);
  
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
    if (result.winner === 'teamA') teamAWins++;
    else if (result.winner === 'teamB') teamBWins++;
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
    prediction = 'Match nul';
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

// Nouvelle prédiction: Double Chance
const predictDoubleChance = (
  teamA: string,
  teamB: string,
  strengthA: number,
  strengthB: number,
  h2hAdvantage: number
): BettingPrediction => {
  const strengthDiff = strengthA - strengthB + h2hAdvantage;
  const homeAdvantage = 2;
  const totalAdvantage = strengthDiff + homeAdvantage;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (totalAdvantage > 0) {
    prediction = `${teamA} ou Match nul`;
    confidence = Math.min(90, 75 + totalAdvantage);
    odds = '1.35';
    reasoning = `${teamA} joue à domicile avec un avantage statistique, une défaite semble peu probable.`;
  } else {
    prediction = `${teamB} ou Match nul`;
    confidence = Math.min(90, 75 + Math.abs(totalAdvantage));
    odds = '1.45';
    reasoning = `${teamB} montre une forme plus solide, une victoire à l'extérieur ou un nul est probable.`;
  }
  
  return {
    type: 'Double chance',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};

const predictOverUnder = (
  avgGoals: number, 
  teamAStats: TeamStats, 
  teamBStats: TeamStats
): BettingPrediction => {
  const teamAAvgGoals = teamAStats.goalsFor / (teamAStats.wins + teamAStats.draws + teamAStats.losses);
  const teamBAvgGoals = teamBStats.goalsFor / (teamBStats.wins + teamBStats.draws + teamBStats.losses);
  const teamADefense = teamAStats.cleanSheets / (teamAStats.wins + teamAStats.draws + teamAStats.losses);
  const teamBDefense = teamBStats.cleanSheets / (teamBStats.wins + teamBStats.draws + teamBStats.losses);
  
  const projectedGoals = (teamAAvgGoals + teamBAvgGoals + avgGoals) / 2;
  const defenseStrength = (teamADefense + teamBDefense) / 2;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (projectedGoals > 2.7 && defenseStrength < 0.3) {
    prediction = 'Plus de 2.5 buts';
    confidence = Math.min(80, 60 + (projectedGoals - 2.5) * 20);
    odds = '1.75';
    reasoning = 'Les deux équipes ont des attaques productives, match ouvert attendu.';
  } else {
    prediction = 'Moins de 2.5 buts';
    confidence = Math.min(75, 60 + (2.5 - projectedGoals) * 15 + defenseStrength * 20);
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

// Nouvelle prédiction: Corners
const predictCorners = (
  avgCorners: number,
  teamAStats: TeamStats,
  teamBStats: TeamStats
): BettingPrediction => {
  const teamACorners = teamAStats.cornersTotal / (teamAStats.wins + teamAStats.draws + teamAStats.losses);
  const teamBCorners = teamBStats.cornersTotal / (teamBStats.wins + teamBStats.draws + teamBStats.losses);
  
  const projectedCorners = (teamACorners + teamBCorners + avgCorners) / 3;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (projectedCorners > 9.5) {
    prediction = 'Plus de 9.5 corners';
    confidence = Math.min(75, 55 + (projectedCorners - 9.5) * 5);
    odds = '1.85';
    reasoning = 'Les deux équipes génèrent beaucoup de corners dans leurs matchs.';
  } else {
    prediction = 'Moins de 9.5 corners';
    confidence = Math.min(75, 55 + (9.5 - projectedCorners) * 5);
    odds = '1.95';
    reasoning = 'Match avec peu d\'occasions aux abords de la surface, peu de corners.';
  }
  
  return {
    type: 'Total corners',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};

// Nouvelle prédiction: Cartons
const predictCards = (
  avgCards: number,
  teamAStats: TeamStats,
  teamBStats: TeamStats
): BettingPrediction => {
  const teamACards = (teamAStats.yellowCards + teamAStats.redCards * 2) / (teamAStats.wins + teamAStats.draws + teamAStats.losses);
  const teamBCards = (teamBStats.yellowCards + teamBStats.redCards * 2) / (teamBStats.wins + teamBStats.draws + teamBStats.losses);
  
  const cardsPropensity = (teamACards + teamBCards + avgCards) / 3;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (cardsPropensity > 4) {
    prediction = 'Plus de 3.5 cartons';
    confidence = Math.min(75, 55 + (cardsPropensity - 3.5) * 8);
    odds = '1.90';
    reasoning = 'Match tendu avec tendance disciplinaire médiocre.';
  } else {
    prediction = 'Moins de 3.5 cartons';
    confidence = Math.min(75, 55 + (3.5 - cardsPropensity) * 8);
    odds = '1.85';
    reasoning = 'Match calme avec peu de fautes attendues.';
  }
  
  return {
    type: 'Total cartons',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};
