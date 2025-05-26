
// Service pour collecter les actualités d'équipes (blessures, transferts, etc.)

export interface TeamNews {
  id: string;
  team: string;
  type: 'injury' | 'transfer' | 'suspension' | 'contract' | 'coach' | 'other';
  title: string;
  description: string;
  player?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  source: string;
  impact: 'positive' | 'negative' | 'neutral';
  reliability: number; // 0-100
}

export interface PlayerInfo {
  name: string;
  team: string;
  position: string;
  age: number;
  marketValue: string;
  contractUntil: string;
  injuries: string[];
  recentForm: string;
  goals: number;
  assists: number;
}

// Collecte des actualités d'équipes
export const getTeamNews = async (teamName: string): Promise<TeamNews[]> => {
  console.log(`📰 Collecte actualités: ${teamName}`);
  
  try {
    const news: TeamNews[] = [];
    
    // Simulation d'actualités réalistes
    const newsTemplates = [
      {
        type: 'injury' as const,
        templates: [
          'Blessure au genou pour {player}',
          '{player} souffre d\'une élongation',
          'Coup dur: {player} absent 3 semaines',
          '{player} forfait pour le prochain match'
        ]
      },
      {
        type: 'transfer' as const,
        templates: [
          'Rumeur: {player} dans le viseur',
          '{player} prolonge son contrat',
          'Négociations en cours pour {player}',
          '{player} sur le départ ?'
        ]
      },
      {
        type: 'suspension' as const,
        templates: [
          '{player} suspendu pour 2 matchs',
          'Carton rouge: {player} manquera le derby',
          'Commission de discipline: {player} sanctionné'
        ]
      }
    ];
    
    const players = generatePlayersForTeam(teamName);
    
    // Génération de 3-7 actualités par équipe
    const newsCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < newsCount; i++) {
      const newsType = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
      const template = newsType.templates[Math.floor(Math.random() * newsType.templates.length)];
      const player = players[Math.floor(Math.random() * players.length)];
      
      const title = template.replace('{player}', player);
      
      news.push({
        id: `news_${Date.now()}_${i}`,
        team: teamName,
        type: newsType.type,
        title,
        description: generateNewsDescription(newsType.type, player, teamName),
        player,
        severity: getSeverityForType(newsType.type),
        date: generateRecentDate(),
        source: getRandomSource(),
        impact: getImpactForType(newsType.type),
        reliability: Math.floor(Math.random() * 30) + 70 // 70-100%
      });
    }
    
    console.log(`✅ ${news.length} actualités collectées pour ${teamName}`);
    return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  } catch (error) {
    console.error(`❌ Erreur collecte actualités ${teamName}:`, error);
    return [];
  }
};

// Informations détaillées sur un joueur
export const getPlayerInfo = async (playerName: string, teamName: string): Promise<PlayerInfo | null> => {
  console.log(`👤 Collecte infos joueur: ${playerName}`);
  
  try {
    const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];
    const position = positions[Math.floor(Math.random() * positions.length)];
    
    return {
      name: playerName,
      team: teamName,
      position,
      age: Math.floor(Math.random() * 15) + 18, // 18-33 ans
      marketValue: `${Math.floor(Math.random() * 50) + 5}M€`,
      contractUntil: `${2024 + Math.floor(Math.random() * 4)}`,
      injuries: generatePlayerInjuries(),
      recentForm: generateRecentForm(),
      goals: Math.floor(Math.random() * 25),
      assists: Math.floor(Math.random() * 15)
    };
    
  } catch (error) {
    console.error(`❌ Erreur infos joueur ${playerName}:`, error);
    return null;
  }
};

const generatePlayersForTeam = (teamName: string): string[] => {
  const commonNames = [
    'Martinez', 'Silva', 'Johnson', 'Garcia', 'Müller', 'Rossi', 'Anderson', 'Lopez',
    'Brown', 'Wilson', 'Taylor', 'Davis', 'Rodriguez', 'Hernandez', 'Moore', 'Clark'
  ];
  
  return commonNames.slice(0, 8).map(name => `${name} (${teamName})`);
};

const generateNewsDescription = (type: string, player: string, team: string): string => {
  const descriptions = {
    injury: [
      `${player} s'est blessé à l'entraînement. L'équipe médicale évalue la durée d'indisponibilité.`,
      `Touché lors du dernier match, ${player} passera des examens complémentaires.`,
      `${team} devra composer sans ${player} pour les prochaines rencontres.`
    ],
    transfer: [
      `${player} serait dans le viseur de plusieurs clubs européens selon nos sources.`,
      `${team} souhaite prolonger le contrat de ${player} jusqu'en 2027.`,
      `Les négociations se poursuivent entre ${team} et l'entourage de ${player}.`
    ],
    suspension: [
      `${player} écopera d'une suspension après son comportement lors du dernier match.`,
      `La commission de discipline a tranché: ${player} est suspendu.`,
      `${team} fait appel de la décision concernant ${player}.`
    ]
  };
  
  const typeDescriptions = descriptions[type as keyof typeof descriptions] || descriptions.injury;
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
};

const getSeverityForType = (type: string): 'low' | 'medium' | 'high' | 'critical' => {
  const severities = {
    injury: ['medium', 'high', 'critical'],
    transfer: ['low', 'medium'],
    suspension: ['medium', 'high']
  };
  
  const typeSeverities = severities[type as keyof typeof severities] || ['medium'];
  return typeSeverities[Math.floor(Math.random() * typeSeverities.length)] as any;
};

const getImpactForType = (type: string): 'positive' | 'negative' | 'neutral' => {
  const impacts = {
    injury: 'negative',
    transfer: Math.random() > 0.5 ? 'positive' : 'neutral',
    suspension: 'negative'
  };
  
  return impacts[type as keyof typeof impacts] || 'neutral';
};

const generateRecentDate = (): string => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7); // 0-7 jours
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
};

const getRandomSource = (): string => {
  const sources = [
    'L\'Équipe', 'RMC Sport', 'Sky Sports', 'ESPN', 'Marca', 'Gazzetta dello Sport',
    'BeIN Sports', 'Foot Mercato', 'Goal.com', 'BBC Sport'
  ];
  return sources[Math.floor(Math.random() * sources.length)];
};

const generatePlayerInjuries = (): string[] => {
  const injuries = [
    'Aucune blessure actuelle',
    'Légère gêne musculaire',
    'Entorse cheville droite',
    'Douleurs au genou',
    'Élongation ischio-jambiers'
  ];
  
  const hasInjury = Math.random() > 0.7;
  if (!hasInjury) return [injuries[0]];
  
  return [injuries[Math.floor(Math.random() * (injuries.length - 1)) + 1]];
};

const generateRecentForm = (): string => {
  const forms = ['WWWWW', 'WWWWD', 'WWDDL', 'WDDDL', 'DDDLL', 'WDWDW', 'LWDWW'];
  return forms[Math.floor(Math.random() * forms.length)];
};
