
// Service de validation d'équipes utilisant des APIs gratuites
export interface TeamValidationResult {
  isValid: boolean;
  correctedName?: string;
  country?: string;
  league?: string;
  founded?: number;
  venue?: string;
  logo?: string;
  source: string;
}

export interface FreeApiTeamData {
  name: string;
  country: string;
  league: string;
  founded?: number;
  venue?: string;
  logo?: string;
  apiSource: string;
}

// Base de données locale des équipes populaires pour validation rapide
const POPULAR_TEAMS = [
  // Ligue 1
  { name: "Paris Saint-Germain", aliases: ["PSG", "Paris SG"], country: "France", league: "Ligue 1" },
  { name: "Olympique de Marseille", aliases: ["OM", "Marseille"], country: "France", league: "Ligue 1" },
  { name: "AS Monaco", aliases: ["Monaco"], country: "France", league: "Ligue 1" },
  { name: "Olympique Lyonnais", aliases: ["OL", "Lyon"], country: "France", league: "Ligue 1" },
  
  // Premier League
  { name: "Manchester City", aliases: ["Man City", "City"], country: "England", league: "Premier League" },
  { name: "Liverpool", aliases: ["Liverpool FC"], country: "England", league: "Premier League" },
  { name: "Chelsea", aliases: ["Chelsea FC"], country: "England", league: "Premier League" },
  { name: "Arsenal", aliases: ["Arsenal FC"], country: "England", league: "Premier League" },
  { name: "Manchester United", aliases: ["Man United", "United"], country: "England", league: "Premier League" },
  { name: "Tottenham", aliases: ["Spurs", "Tottenham Hotspur"], country: "England", league: "Premier League" },
  
  // La Liga
  { name: "Real Madrid", aliases: ["Madrid"], country: "Spain", league: "La Liga" },
  { name: "FC Barcelona", aliases: ["Barcelona", "Barca"], country: "Spain", league: "La Liga" },
  { name: "Atletico Madrid", aliases: ["Atletico"], country: "Spain", league: "La Liga" },
  { name: "Sevilla", aliases: ["Sevilla FC"], country: "Spain", league: "La Liga" },
  
  // Serie A
  { name: "Juventus", aliases: ["Juve"], country: "Italy", league: "Serie A" },
  { name: "AC Milan", aliases: ["Milan"], country: "Italy", league: "Serie A" },
  { name: "Inter Milan", aliases: ["Inter"], country: "Italy", league: "Serie A" },
  { name: "AS Roma", aliases: ["Roma"], country: "Italy", league: "Serie A" },
  { name: "Napoli", aliases: ["SSC Napoli"], country: "Italy", league: "Serie A" },
  
  // Bundesliga
  { name: "Bayern Munich", aliases: ["Bayern"], country: "Germany", league: "Bundesliga" },
  { name: "Borussia Dortmund", aliases: ["BVB", "Dortmund"], country: "Germany", league: "Bundesliga" },
  { name: "RB Leipzig", aliases: ["Leipzig"], country: "Germany", league: "Bundesliga" },
  { name: "Bayer Leverkusen", aliases: ["Leverkusen"], country: "Germany", league: "Bundesliga" }
];

// Validation rapide avec base locale
export const validateTeamLocally = (teamName: string): TeamValidationResult => {
  const normalizedInput = teamName.toLowerCase().trim();
  
  for (const team of POPULAR_TEAMS) {
    // Vérifier nom principal
    if (team.name.toLowerCase() === normalizedInput) {
      return {
        isValid: true,
        correctedName: team.name,
        country: team.country,
        league: team.league,
        source: 'local_database'
      };
    }
    
    // Vérifier aliases
    for (const alias of team.aliases) {
      if (alias.toLowerCase() === normalizedInput) {
        return {
          isValid: true,
          correctedName: team.name,
          country: team.country,
          league: team.league,
          source: 'local_database'
        };
      }
    }
    
    // Recherche partielle
    if (team.name.toLowerCase().includes(normalizedInput) && normalizedInput.length >= 3) {
      return {
        isValid: true,
        correctedName: team.name,
        country: team.country,
        league: team.league,
        source: 'local_database'
      };
    }
  }
  
  return { isValid: false, source: 'local_database' };
};

// Validation via API-Football (gratuite)
export const validateTeamWithApiFoot = async (teamName: string): Promise<TeamValidationResult> => {
  try {
    console.log(`🔍 Validation API-Football: ${teamName}`);
    
    // API-Football gratuite (limited requests)
    const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/teams?search=${encodeURIComponent(teamName)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        'X-RapidAPI-Key': 'demo-key' // Clé de démo limitée
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.response && data.response.length > 0) {
        const team = data.response[0].team;
        return {
          isValid: true,
          correctedName: team.name,
          country: team.country,
          founded: team.founded,
          venue: data.response[0].venue?.name,
          logo: team.logo,
          source: 'api_football'
        };
      }
    }
  } catch (error) {
    console.log('API-Football non disponible, passage au service suivant');
  }
  
  return { isValid: false, source: 'api_football' };
};

// Validation via TheSportsDB (gratuite)
export const validateTeamWithSportsDB = async (teamName: string): Promise<TeamValidationResult> => {
  try {
    console.log(`🔍 Validation TheSportsDB: ${teamName}`);
    
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.teams && data.teams.length > 0) {
        const team = data.teams[0];
        
        // Vérifier que c'est bien une équipe de football
        if (team.strSport === 'Soccer' || team.strSport === 'Football') {
          return {
            isValid: true,
            correctedName: team.strTeam,
            country: team.strCountry,
            league: team.strLeague,
            founded: parseInt(team.intFormedYear),
            venue: team.strStadium,
            logo: team.strTeamBadge,
            source: 'thesportsdb'
          };
        }
      }
    }
  } catch (error) {
    console.log('TheSportsDB non disponible, passage au service suivant');
  }
  
  return { isValid: false, source: 'thesportsdb' };
};

// Validation via FootballData.org (gratuite)
export const validateTeamWithFootballData = async (teamName: string): Promise<TeamValidationResult> => {
  try {
    console.log(`🔍 Validation FootballData.org: ${teamName}`);
    
    // API gratuite mais limitée
    const response = await fetch(`https://api.football-data.org/v4/teams?name=${encodeURIComponent(teamName)}`, {
      headers: {
        'X-Auth-Token': 'demo-token' // Token de démo
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.teams && data.teams.length > 0) {
        const team = data.teams[0];
        return {
          isValid: true,
          correctedName: team.name,
          country: team.area?.name,
          venue: team.venue,
          founded: team.founded,
          logo: team.crest,
          source: 'football_data'
        };
      }
    }
  } catch (error) {
    console.log('FootballData.org non disponible');
  }
  
  return { isValid: false, source: 'football_data' };
};

// Service principal de validation multi-sources
export const validateTeamMultiSource = async (teamName: string): Promise<TeamValidationResult> => {
  if (!teamName || teamName.trim().length < 2) {
    throw new Error('Le nom de l\'équipe doit contenir au moins 2 caractères');
  }
  
  console.log(`🔍 Validation multi-sources pour: ${teamName}`);
  
  // 1. Validation locale rapide (priorité)
  const localResult = validateTeamLocally(teamName);
  if (localResult.isValid) {
    console.log(`✅ Équipe trouvée localement: ${localResult.correctedName}`);
    return localResult;
  }
  
  // 2. Essayer les APIs gratuites en parallèle
  const validationPromises = [
    validateTeamWithSportsDB(teamName),
    validateTeamWithFootballData(teamName),
    validateTeamWithApiFoot(teamName)
  ];
  
  try {
    const results = await Promise.allSettled(validationPromises);
    
    // Chercher le premier résultat valide
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.isValid) {
        console.log(`✅ Équipe validée via ${result.value.source}: ${result.value.correctedName}`);
        return result.value;
      }
    }
  } catch (error) {
    console.error('Erreur lors de la validation multi-sources:', error);
  }
  
  // 3. Si aucune validation réussie
  console.log(`❌ Équipe non trouvée: ${teamName}`);
  return {
    isValid: false,
    source: 'multi_source_failed'
  };
};

// Récupérer des données d'équipe enrichies
export const getEnrichedTeamData = async (teamName: string): Promise<FreeApiTeamData | null> => {
  const validation = await validateTeamMultiSource(teamName);
  
  if (validation.isValid) {
    return {
      name: validation.correctedName || teamName,
      country: validation.country || 'Unknown',
      league: validation.league || 'Unknown',
      founded: validation.founded,
      venue: validation.venue,
      logo: validation.logo,
      apiSource: validation.source
    };
  }
  
  return null;
};
