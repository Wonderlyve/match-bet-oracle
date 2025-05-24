
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
  
  // Calcul de la force relative des équipes basée sur les vraies données
  const teamAStrength = calculateAdvancedTeamStrength(analysis.teamAStats, teamA);
  const teamBStrength = calculateAdvancedTeamStrength(analysis.teamBStats, teamB);
  
  // Analyse approfondie des H2H
  const h2hAnalysis = analyzeHeadToHeadAdvanced(analysis.headToHead, teamA, teamB);
  
  // Facteur forme récente
  const formFactor = analyzeRecentForm(analysis.teamAStats.form, analysis.teamBStats.form);
  
  // Analyse défensive
  const defensiveAnalysis = analyzeDefensiveStrength(analysis.teamAStats, analysis.teamBStats);
  
  console.log(`🔍 Analyse avancée: ${teamA} (${teamAStrength}) vs ${teamB} (${teamBStrength})`);
  console.log(`📊 Forme: ${formFactor}, Défense: ${defensiveAnalysis.homeCleanSheetRate}/${defensiveAnalysis.awayCleanSheetRate}`);
  
  // Génération de prédictions variées basées sur l'analyse réelle
  predictions.push(...generateVariedPredictions(teamA, teamB, analysis, teamAStrength, teamBStrength, h2hAnalysis, formFactor, defensiveAnalysis));
  
  return predictions;
};

const calculateAdvancedTeamStrength = (stats: TeamStats, teamName: string): number => {
  const totalGames = stats.wins + stats.draws + stats.losses;
  if (totalGames === 0) return 50;
  
  // Points par match (sur 3)
  const pointsPerGame = (stats.wins * 3 + stats.draws) / totalGames;
  
  // Ratio buts marqués/encaissés
  const goalRatio = stats.goalsAgainst > 0 ? stats.goalsFor / stats.goalsAgainst : stats.goalsFor;
  
  // Forme récente (derniers 5 matchs)
  const formScore = calculateFormScore(stats.form);
  
  // Solidité défensive
  const cleanSheetRate = stats.cleanSheets / totalGames;
  
  // Efficacité offensive
  const goalsPerGame = stats.goalsFor / totalGames;
  
  // Coefficient équipe (basé sur la popularité/niveau)
  const teamCoefficient = getTeamCoefficient(teamName);
  
  // Score composite pondéré
  const strength = (
    pointsPerGame * 20 +           // 0-60 points
    Math.min(goalRatio * 10, 25) + // 0-25 points
    formScore * 2 +                // 0-30 points
    cleanSheetRate * 15 +          // 0-15 points
    Math.min(goalsPerGame * 5, 15) + // 0-15 points
    teamCoefficient * 10           // 0-10 points
  );
  
  return Math.round(Math.max(0, Math.min(100, strength)));
};

const calculateFormScore = (form: string): number => {
  let score = 0;
  for (let i = 0; i < form.length; i++) {
    const result = form[i];
    const weight = form.length - i; // Plus récent = plus de poids
    if (result === 'W') score += 3 * weight;
    else if (result === 'D') score += 1 * weight;
  }
  return score / (form.length * 3); // Normalisation 0-15
};

const getTeamCoefficient = (teamName: string): number => {
  const topTierTeams = ['Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Bayern Munich', 'Paris Saint-Germain'];
  const midTierTeams = ['Arsenal', 'Chelsea', 'Tottenham', 'AC Milan', 'Juventus', 'Atletico Madrid'];
  
  const name = teamName.toLowerCase();
  
  if (topTierTeams.some(team => name.includes(team.toLowerCase()) || team.toLowerCase().includes(name))) {
    return 1.0;
  } else if (midTierTeams.some(team => name.includes(team.toLowerCase()) || team.toLowerCase().includes(name))) {
    return 0.7;
  }
  return 0.5;
};

const analyzeHeadToHeadAdvanced = (h2h: HeadToHeadResult[], teamA: string, teamB: string) => {
  let teamAWins = 0, teamBWins = 0, draws = 0;
  let totalGoals = 0, totalMatches = h2h.length;
  let highScoringGames = 0;
  
  h2h.forEach(result => {
    if (result.winner === 'teamA') teamAWins++;
    else if (result.winner === 'teamB') teamBWins++;
    else draws++;
    
    const matchGoals = result.homeGoals + result.awayGoals;
    totalGoals += matchGoals;
    if (matchGoals > 2.5) highScoringGames++;
  });
  
  return {
    teamAAdvantage: teamAWins - teamBWins,
    avgGoalsInH2H: totalMatches > 0 ? totalGoals / totalMatches : 2.5,
    highScoringRate: totalMatches > 0 ? highScoringGames / totalMatches : 0.5,
    drawTendency: totalMatches > 0 ? draws / totalMatches : 0.3
  };
};

const analyzeRecentForm = (formA: string, formB: string) => {
  const scoreA = calculateFormScore(formA);
  const scoreB = calculateFormScore(formB);
  
  return {
    difference: scoreA - scoreB,
    homeInForm: scoreA > 0.6,
    awayInForm: scoreB > 0.6,
    bothPoorForm: scoreA < 0.4 && scoreB < 0.4
  };
};

const analyzeDefensiveStrength = (statsA: TeamStats, statsB: TeamStats) => {
  const totalGamesA = statsA.wins + statsA.draws + statsA.losses;
  const totalGamesB = statsB.wins + statsB.draws + statsB.losses;
  
  return {
    homeCleanSheetRate: totalGamesA > 0 ? statsA.cleanSheets / totalGamesA : 0,
    awayCleanSheetRate: totalGamesB > 0 ? statsB.cleanSheets / totalGamesB : 0,
    homeGoalsAgainstPerGame: totalGamesA > 0 ? statsA.goalsAgainst / totalGamesA : 1.5,
    awayGoalsAgainstPerGame: totalGamesB > 0 ? statsB.goalsAgainst / totalGamesB : 1.5
  };
};

const generateVariedPredictions = (
  teamA: string, 
  teamB: string, 
  analysis: MatchAnalysis, 
  strengthA: number, 
  strengthB: number, 
  h2hAnalysis: any, 
  formFactor: any, 
  defensiveAnalysis: any
): BettingPrediction[] => {
  const predictions: BettingPrediction[] = [];
  
  // 1. Prédiction principale (1X2) - Logic varié
  predictions.push(generateMainResultPrediction(teamA, teamB, strengthA, strengthB, formFactor, h2hAnalysis));
  
  // 2. Prédiction Over/Under - Basée sur vraies données
  predictions.push(generateGoalsPrediction(analysis, h2hAnalysis, defensiveAnalysis));
  
  // 3. BTTS - Analyse offensive vs défensive réelle
  predictions.push(generateBTTSPrediction(analysis, defensiveAnalysis, teamA, teamB));
  
  // 4. Prédiction corners - Basée sur style de jeu
  predictions.push(generateCornersPrediction(analysis, strengthA, strengthB));
  
  // 5. Prédiction cartons - Basée sur historique disciplinaire
  predictions.push(generateCardsPrediction(analysis, teamA, teamB));
  
  // 6. Prédiction bonus basée sur l'analyse spécifique
  predictions.push(generateBonusPrediction(teamA, teamB, analysis, strengthA, strengthB, formFactor));
  
  return predictions;
};

const generateMainResultPrediction = (teamA: string, teamB: string, strengthA: number, strengthB: number, formFactor: any, h2hAnalysis: any): BettingPrediction => {
  const strengthDiff = strengthA - strengthB;
  const formImpact = formFactor.difference * 10;
  const h2hImpact = h2hAnalysis.teamAAdvantage * 5;
  const homeAdvantage = 8; // Avantage domicile standard
  
  const totalAdvantage = strengthDiff + formImpact + h2hImpact + homeAdvantage;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (totalAdvantage > 15) {
    prediction = `Victoire ${teamA}`;
    confidence = Math.min(85, 65 + Math.abs(totalAdvantage) / 2);
    odds = (1.4 + Math.random() * 0.3).toFixed(2);
    reasoning = `${teamA} présente tous les avantages : forme récente excellente, statistiques supérieures et avantage du terrain. Historique H2H favorable.`;
  } else if (totalAdvantage > 5) {
    prediction = `Victoire ${teamA}`;
    confidence = Math.min(75, 55 + Math.abs(totalAdvantage) / 2);
    odds = (1.6 + Math.random() * 0.4).toFixed(2);
    reasoning = `${teamA} légèrement favori grâce à l'avantage domicile et une forme récente correcte.`;
  } else if (totalAdvantage < -15) {
    prediction = `Victoire ${teamB}`;
    confidence = Math.min(80, 60 + Math.abs(totalAdvantage) / 2);
    odds = (2.0 + Math.random() * 0.5).toFixed(2);
    reasoning = `${teamB} montre une forme exceptionnelle qui compense largement le déplacement. Statistiques impressionnantes.`;
  } else if (totalAdvantage < -5) {
    prediction = `Double chance X2 (${teamB} ou nul)`;
    confidence = Math.min(75, 55 + Math.abs(totalAdvantage) / 2);
    odds = (1.3 + Math.random() * 0.2).toFixed(2);
    reasoning = `${teamB} en excellente forme, une défaite semble peu probable malgré l'extérieur.`;
  } else {
    // Match équilibré
    if (h2hAnalysis.drawTendency > 0.4) {
      prediction = 'Match nul';
      confidence = 60 + Math.random() * 15;
      odds = (3.0 + Math.random() * 0.5).toFixed(2);
      reasoning = 'Historique de matchs nuls entre ces équipes. Forces très équilibrées actuellement.';
    } else {
      prediction = `Double chance 1X (${teamA} ou nul)`;
      confidence = 65 + Math.random() * 10;
      odds = (1.4 + Math.random() * 0.3).toFixed(2);
      reasoning = 'Match équilibré où l\'avantage du terrain peut faire la différence.';
    }
  }
  
  return {
    type: 'Résultat final',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};

const generateGoalsPrediction = (analysis: MatchAnalysis, h2hAnalysis: any, defensiveAnalysis: any): BettingPrediction => {
  const avgGoalsH2H = h2hAnalysis.avgGoalsInH2H;
  const avgGoalsGeneral = analysis.avgGoalsPerMatch;
  const combinedAvg = (avgGoalsH2H + avgGoalsGeneral) / 2;
  
  const totalGamesA = analysis.teamAStats.wins + analysis.teamAStats.draws + analysis.teamAStats.losses;
  const totalGamesB = analysis.teamBStats.wins + analysis.teamBStats.draws + analysis.teamBStats.losses;
  
  const attackingStrengthA = totalGamesA > 0 ? analysis.teamAStats.goalsFor / totalGamesA : 1.5;
  const attackingStrengthB = totalGamesB > 0 ? analysis.teamBStats.goalsFor / totalGamesB : 1.5;
  
  const projectedGoals = (attackingStrengthA + attackingStrengthB + combinedAvg) / 3;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (projectedGoals > 3.0 && (defensiveAnalysis.homeCleanSheetRate < 0.3 || defensiveAnalysis.awayCleanSheetRate < 0.3)) {
    prediction = 'Plus de 3.5 buts';
    confidence = Math.min(75, 55 + (projectedGoals - 3.0) * 20);
    odds = (2.0 + Math.random() * 0.5).toFixed(2);
    reasoning = `Attaques très productives (${attackingStrengthA.toFixed(1)} et ${attackingStrengthB.toFixed(1)} buts/match). Défenses perméables.`;
  } else if (projectedGoals > 2.7) {
    prediction = 'Plus de 2.5 buts';
    confidence = Math.min(80, 60 + (projectedGoals - 2.5) * 15);
    odds = (1.7 + Math.random() * 0.3).toFixed(2);
    reasoning = `Match offensif attendu. Historique H2H: ${avgGoalsH2H.toFixed(1)} buts/match. Attaques efficaces des deux côtés.`;
  } else if (projectedGoals < 2.2 && (defensiveAnalysis.homeCleanSheetRate > 0.4 || defensiveAnalysis.awayCleanSheetRate > 0.4)) {
    prediction = 'Moins de 2.5 buts';
    confidence = Math.min(75, 60 + (2.5 - projectedGoals) * 20);
    odds = (1.8 + Math.random() * 0.3).toFixed(2);
    reasoning = `Défenses solides (${(defensiveAnalysis.homeCleanSheetRate * 100).toFixed(0)}% et ${(defensiveAnalysis.awayCleanSheetRate * 100).toFixed(0)}% de clean sheets). Match serré prévu.`;
  } else {
    prediction = 'Plus de 2.5 buts';
    confidence = 60 + Math.random() * 10;
    odds = (1.8 + Math.random() * 0.4).toFixed(2);
    reasoning = `Équilibre offense-défense. Moyenne générale: ${avgGoalsGeneral.toFixed(1)} buts/match.`;
  }
  
  return {
    type: 'Total de buts',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};

const generateBTTSPrediction = (analysis: MatchAnalysis, defensiveAnalysis: any, teamA: string, teamB: string): BettingPrediction => {
  const totalGamesA = analysis.teamAStats.wins + analysis.teamAStats.draws + analysis.teamAStats.losses;
  const totalGamesB = analysis.teamBStats.wins + analysis.teamBStats.draws + analysis.teamBStats.losses;
  
  const attackA = totalGamesA > 0 ? analysis.teamAStats.goalsFor / totalGamesA : 1.5;
  const attackB = totalGamesB > 0 ? analysis.teamBStats.goalsFor / totalGamesB : 1.5;
  
  const cleanSheetRateA = defensiveAnalysis.homeCleanSheetRate;
  const cleanSheetRateB = defensiveAnalysis.awayCleanSheetRate;
  
  const bttsLikelihood = (attackA + attackB) / 2 - (cleanSheetRateA + cleanSheetRateB) / 2;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (bttsLikelihood > 1.2 && cleanSheetRateA < 0.4 && cleanSheetRateB < 0.4) {
    prediction = 'Les deux équipes marquent';
    confidence = Math.min(80, 60 + bttsLikelihood * 15);
    odds = (1.6 + Math.random() * 0.3).toFixed(2);
    reasoning = `Attaques efficaces: ${teamA} (${attackA.toFixed(1)} buts/match), ${teamB} (${attackB.toFixed(1)} buts/match). Défenses vulnérables.`;
  } else if (cleanSheetRateA > 0.5 || cleanSheetRateB > 0.5) {
    prediction = 'Au moins une équipe ne marque pas';
    confidence = Math.min(75, 55 + (Math.max(cleanSheetRateA, cleanSheetRateB)) * 30);
    odds = (2.0 + Math.random() * 0.4).toFixed(2);
    reasoning = `Défense solide détectée. ${cleanSheetRateA > cleanSheetRateB ? teamA : teamB} garde sa cage inviolée dans ${Math.max(cleanSheetRateA, cleanSheetRateB) * 100}% des cas.`;
  } else {
    prediction = 'Les deux équipes marquent';
    confidence = 60 + Math.random() * 15;
    odds = (1.7 + Math.random() * 0.3).toFixed(2);
    reasoning = `Équilibre offense-défense. Probabilité modérée que les deux équipes trouvent le chemin des filets.`;
  }
  
  return {
    type: 'Both Teams to Score',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};

const generateCornersPrediction = (analysis: MatchAnalysis, strengthA: number, strengthB: number): BettingPrediction => {
  const totalGamesA = analysis.teamAStats.wins + analysis.teamAStats.draws + analysis.teamAStats.losses;
  const totalGamesB = analysis.teamBStats.wins + analysis.teamBStats.draws + analysis.teamBStats.losses;
  
  const cornersA = totalGamesA > 0 ? analysis.teamAStats.cornersTotal / totalGamesA : 5;
  const cornersB = totalGamesB > 0 ? analysis.teamBStats.cornersTotal / totalGamesB : 5;
  
  const projectedCorners = (cornersA + cornersB + analysis.avgCornersPerMatch) / 3;
  
  // Ajustement selon la différence de niveau
  const strengthDiff = Math.abs(strengthA - strengthB);
  const adjustedCorners = strengthDiff > 20 ? projectedCorners + 1.5 : projectedCorners;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (adjustedCorners > 11) {
    prediction = 'Plus de 10.5 corners';
    confidence = Math.min(75, 55 + (adjustedCorners - 10.5) * 10);
    odds = (1.8 + Math.random() * 0.3).toFixed(2);
    reasoning = `Équipes offensives: ${cornersA.toFixed(1)} et ${cornersB.toFixed(1)} corners/match. Match intense prévu.`;
  } else if (adjustedCorners > 9.5) {
    prediction = 'Plus de 9.5 corners';
    confidence = Math.min(80, 60 + (adjustedCorners - 9.5) * 15);
    odds = (1.7 + Math.random() * 0.3).toFixed(2);
    reasoning = `Moyenne combinée de ${projectedCorners.toFixed(1)} corners/match. Jeu offensif des deux équipes.`;
  } else {
    prediction = 'Moins de 9.5 corners';
    confidence = Math.min(75, 55 + (9.5 - adjustedCorners) * 12);
    odds = (1.9 + Math.random() * 0.3).toFixed(2);
    reasoning = `Jeu plutôt fermé attendu. Peu d'occasions aux abords des surfaces.`;
  }
  
  return {
    type: 'Total corners',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};

const generateCardsPrediction = (analysis: MatchAnalysis, teamA: string, teamB: string): BettingPrediction => {
  const totalGamesA = analysis.teamAStats.wins + analysis.teamAStats.draws + analysis.teamAStats.losses;
  const totalGamesB = analysis.teamBStats.wins + analysis.teamBStats.draws + analysis.teamBStats.losses;
  
  const cardsA = totalGamesA > 0 ? (analysis.teamAStats.yellowCards + analysis.teamAStats.redCards * 2) / totalGamesA : 2;
  const cardsB = totalGamesB > 0 ? (analysis.teamBStats.yellowCards + analysis.teamBStats.redCards * 2) / totalGamesB : 2;
  
  const projectedCards = (cardsA + cardsB + analysis.avgCardsPerMatch) / 3;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (projectedCards > 4.5) {
    prediction = 'Plus de 4.5 cartons';
    confidence = Math.min(75, 55 + (projectedCards - 4.5) * 15);
    odds = (1.9 + Math.random() * 0.3).toFixed(2);
    reasoning = `Équipes indisciplinées: ${cardsA.toFixed(1)} et ${cardsB.toFixed(1)} cartons/match. Match tendu attendu.`;
  } else if (projectedCards > 3.5) {
    prediction = 'Plus de 3.5 cartons';
    confidence = Math.min(80, 60 + (projectedCards - 3.5) * 20);
    odds = (1.8 + Math.random() * 0.3).toFixed(2);
    reasoning = `Niveau d'engagement élevé prévu. Moyenne de ${projectedCards.toFixed(1)} cartons dans ce type de rencontre.`;
  } else {
    prediction = 'Moins de 3.5 cartons';
    confidence = Math.min(75, 55 + (3.5 - projectedCards) * 18);
    odds = (1.85 + Math.random() * 0.3).toFixed(2);
    reasoning = `Match fair-play attendu. Équipes disciplinées historiquement.`;
  }
  
  return {
    type: 'Total cartons',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};

const generateBonusPrediction = (teamA: string, teamB: string, analysis: MatchAnalysis, strengthA: number, strengthB: number, formFactor: any): BettingPrediction => {
  const strengthDiff = Math.abs(strengthA - strengthB);
  const isCloseDuel = strengthDiff < 10;
  const strongHomeForm = formFactor.homeInForm;
  const strongAwayForm = formFactor.awayInForm;
  
  let prediction: string;
  let confidence: number;
  let odds: string;
  let reasoning: string;
  
  if (isCloseDuel && strongHomeForm && strongAwayForm) {
    prediction = 'Match avec plus de 1.5 buts en première mi-temps';
    confidence = 65 + Math.random() * 10;
    odds = (2.2 + Math.random() * 0.5).toFixed(2);
    reasoning = 'Deux équipes en forme qui aiment bien commencer. Début de match animé prévu.';
  } else if (strengthDiff > 25) {
    prediction = `${strengthA > strengthB ? teamA : teamB} gagne avec plus d'un but d'écart`;
    confidence = 70 + Math.random() * 10;
    odds = (2.0 + Math.random() * 0.4).toFixed(2);
    reasoning = `Différence de niveau significative (${strengthDiff} points). Victoire nette probable.`;
  } else if (formFactor.bothPoorForm) {
    prediction = 'Match avec moins de 2.5 buts et moins de 8.5 corners';
    confidence = 60 + Math.random() * 15;
    odds = (2.5 + Math.random() * 0.5).toFixed(2);
    reasoning = 'Deux équipes en méforme. Match fermé et peu spectaculaire attendu.';
  } else {
    const totalGamesA = analysis.teamAStats.wins + analysis.teamAStats.draws + analysis.teamAStats.losses;
    const goalRateA = totalGamesA > 0 ? analysis.teamAStats.goalsFor / totalGamesA : 1.5;
    
    if (goalRateA > 2.0) {
      prediction = `${teamA} marque en première mi-temps`;
      confidence = 65 + Math.random() * 10;
      odds = (1.8 + Math.random() * 0.4).toFixed(2);
      reasoning = `${teamA} prolifique à domicile (${goalRateA.toFixed(1)} buts/match) et avantage du terrain.`;
    } else {
      prediction = 'Match nul à la mi-temps';
      confidence = 55 + Math.random() * 15;
      odds = (2.3 + Math.random() * 0.4).toFixed(2);
      reasoning = 'Équipes prudentes en début de match. Égalité probable à la pause.';
    }
  }
  
  return {
    type: 'Pari spécial',
    prediction,
    confidence: Math.round(confidence),
    odds,
    reasoning
  };
};
