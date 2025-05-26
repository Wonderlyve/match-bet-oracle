
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getTeamNews, getPlayerInfo, TeamNews, PlayerInfo } from '@/services/teamNewsService';
import { analyzePerformancePatterns, detectValueBets, getPredictiveModel, PerformancePattern, ValueBet, PredictiveModel } from '@/services/advancedPredictionService';
import { trackOddsMovements, analyzeBettingFlow, getMarketSentiment, OddsMovement, BettingFlow, MarketSentiment } from '@/services/oddsTrackingService';
import { 
  Loader2, Users, TrendingUp, AlertTriangle, Target, Brain, 
  Activity, DollarSign, BarChart3, Clock, Star, Info
} from 'lucide-react';

const Infos = () => {
  const [activeTeam, setActiveTeam] = useState('');
  const [teamNews, setTeamNews] = useState<TeamNews[]>([]);
  const [patterns, setPatterns] = useState<PerformancePattern[]>([]);
  const [valueBets, setValueBets] = useState<ValueBet[]>([]);
  const [oddsMovements, setOddsMovements] = useState<OddsMovement[]>([]);
  const [bettingFlow, setBettingFlow] = useState<BettingFlow | null>(null);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null);
  const [predictiveModel, setPredictiveModel] = useState<PredictiveModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerInfo | null>(null);
  const { toast } = useToast();

  const popularTeams = [
    'Paris Saint-Germain', 'Marseille', 'Lyon', 'Monaco', 'Lille',
    'Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Bayern Munich'
  ];

  useEffect(() => {
    // Charger le modèle prédictif au démarrage
    setPredictiveModel(getPredictiveModel());
  }, []);

  const analyzeTeam = async (teamName: string) => {
    setIsLoading(true);
    setActiveTeam(teamName);
    
    try {
      console.log(`🔍 Analyse complète: ${teamName}`);
      
      // Collecte parallèle de toutes les données
      const [
        news,
        teamPatterns,
        teamValueBets,
        movements,
        flow,
        sentiment
      ] = await Promise.all([
        getTeamNews(teamName),
        analyzePerformancePatterns(teamName, 'Équipe adverse'),
        detectValueBets(teamName, 'Équipe adverse'),
        trackOddsMovements(teamName, 'Équipe adverse'),
        analyzeBettingFlow(teamName, 'Équipe adverse'),
        getMarketSentiment(teamName, 'Équipe adverse')
      ]);
      
      setTeamNews(news);
      setPatterns(teamPatterns);
      setValueBets(teamValueBets);
      setOddsMovements(movements);
      setBettingFlow(flow);
      setMarketSentiment(sentiment);
      
      toast({
        title: "✅ Analyse terminée",
        description: `${news.length} actualités, ${teamValueBets.length} value bets détectées pour ${teamName}`,
      });
      
    } catch (error) {
      console.error('❌ Erreur analyse équipe:', error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'analyser cette équipe",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlayerInfo = async (playerName: string) => {
    try {
      const player = await getPlayerInfo(playerName, activeTeam);
      setSelectedPlayer(player);
    } catch (error) {
      console.error('❌ Erreur chargement joueur:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '➖';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gradient">
            📊 Infos & Analyses
          </h1>
          <p className="text-muted-foreground">
            Actualités, patterns IA et value bets en temps réel
          </p>
        </div>

        {/* Modèle prédictif - Aperçu */}
        {predictiveModel && (
          <Card className="gradient-card border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                Modèle Prédictif IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{predictiveModel.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Précision</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{predictiveModel.successRate}%</div>
                  <div className="text-xs text-muted-foreground">Taux succès</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{predictiveModel.totalPredictions}</div>
                  <div className="text-xs text-muted-foreground">Prédictions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{predictiveModel.valueDetected}</div>
                  <div className="text-xs text-muted-foreground">Values détectées</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sélection d'équipe */}
        <Card className="gradient-card border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-sport-primary" />
              Analyser une équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {popularTeams.map((team) => (
                <Button
                  key={team}
                  variant={activeTeam === team ? "default" : "outline"}
                  size="sm"
                  onClick={() => analyzeTeam(team)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {team}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-sport-primary" />
            <p className="text-muted-foreground">Analyse IA en cours...</p>
          </div>
        )}

        {activeTeam && !isLoading && (
          <Tabs defaultValue="news" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="news" className="text-xs">Actualités</TabsTrigger>
              <TabsTrigger value="patterns" className="text-xs">Patterns IA</TabsTrigger>
              <TabsTrigger value="value" className="text-xs">Value Bets</TabsTrigger>
              <TabsTrigger value="market" className="text-xs">Marché</TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="space-y-4">
              <div className="grid gap-4">
                {teamNews.map((news) => (
                  <Card key={news.id} className="gradient-card border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getImpactIcon(news.impact)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(news.severity || 'low')}`}>
                            {news.type.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(news.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm mb-2">{news.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{news.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Source: {news.source}</span>
                        <span className="font-medium">Fiabilité: {news.reliability}%</span>
                      </div>
                      {news.player && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadPlayerInfo(news.player!)}
                          className="mt-2 h-6 text-xs"
                        >
                          <Info className="h-3 w-3 mr-1" />
                          Voir joueur
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="grid gap-4">
                {patterns.filter(p => p.team === activeTeam).map((pattern, index) => (
                  <Card key={index} className="gradient-card border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{pattern.context}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {pattern.reliability.toFixed(0)}% fiable
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{pattern.pattern}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Victoires:</span>
                          <span className="font-medium ml-1">{pattern.winRate.toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Buts/match:</span>
                          <span className="font-medium ml-1">{pattern.avgGoals.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Échantillon:</span>
                          <span className="font-medium ml-1">{pattern.sampleSize} matchs</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="value" className="space-y-4">
              <div className="grid gap-4">
                {valueBets.map((bet, index) => (
                  <Card key={index} className="gradient-card border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{bet.prediction}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            bet.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                            bet.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {bet.riskLevel}
                          </span>
                          <span className="text-lg font-bold text-green-600">+{bet.value}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-muted-foreground">Cote bookmaker:</span>
                          <span className="font-medium ml-1">{bet.bookmakerOdds}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cote calculée:</span>
                          <span className="font-medium ml-1">{bet.calculatedOdds}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{bet.reasoning}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Confiance: {bet.confidence}%</span>
                        <span className="font-medium text-green-600">
                          ROI attendu: +{bet.expectedReturn}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              {/* Sentiment du marché */}
              {marketSentiment && (
                <Card className="gradient-card border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <TrendingUp className="h-5 w-5 mr-2 text-sport-primary" />
                      Sentiment du marché
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        marketSentiment.sentiment === 'bullish' ? 'bg-green-100 text-green-700' :
                        marketSentiment.sentiment === 'bearish' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {marketSentiment.sentiment.toUpperCase()}
                      </span>
                      <span className="text-sm">Confiance: {marketSentiment.confidence}%</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">{marketSentiment.professionalAction}</p>
                      <p className="text-xs text-muted-foreground">{marketSentiment.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Flux de paris */}
              {bettingFlow && (
                <Card className="gradient-card border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Flux de paris
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          {bettingFlow.totalVolume.toLocaleString('fr-FR')}€
                        </div>
                        <div className="text-xs text-muted-foreground">Volume total</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="font-bold">{bettingFlow.homePercentage}%</div>
                          <div className="text-muted-foreground">Domicile</div>
                        </div>
                        <div>
                          <div className="font-bold">{bettingFlow.drawPercentage}%</div>
                          <div className="text-muted-foreground">Nul</div>
                        </div>
                        <div>
                          <div className="font-bold">{bettingFlow.awayPercentage}%</div>
                          <div className="text-muted-foreground">Extérieur</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Public: {bettingFlow.publicMoney}</span>
                        <span>Pros: {bettingFlow.sharpMoney}</span>
                      </div>
                      {bettingFlow.alert && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2">
                          <div className="flex items-center text-orange-700 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {bettingFlow.alertReason}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mouvements de cotes principaux */}
              <Card className="gradient-card border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Mouvements de cotes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {oddsMovements.slice(0, 5).map((movement, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="text-xs">
                          <div className="font-medium">{movement.betType}</div>
                          <div className="text-muted-foreground">{movement.bookmaker}</div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="font-bold">{movement.currentOdds}</div>
                          <div className={`${movement.direction === 'up' ? 'text-green-600' : movement.direction === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                            {movement.change > 0 ? '+' : ''}{movement.change}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Modal joueur */}
        {selectedPlayer && (
          <Card className="gradient-card border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  {selectedPlayer.name}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)}>
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-medium ml-2">{selectedPlayer.position}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Âge:</span>
                  <span className="font-medium ml-2">{selectedPlayer.age} ans</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Valeur:</span>
                  <span className="font-medium ml-2">{selectedPlayer.marketValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Contrat:</span>
                  <span className="font-medium ml-2">Jusqu'en {selectedPlayer.contractUntil}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-bold text-lg">{selectedPlayer.goals}</div>
                  <div className="text-xs text-muted-foreground">Buts</div>
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedPlayer.assists}</div>
                  <div className="text-xs text-muted-foreground">Passes D</div>
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedPlayer.recentForm}</div>
                  <div className="text-xs text-muted-foreground">Forme</div>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Blessures:</span>
                <span className="ml-2">{selectedPlayer.injuries.join(', ')}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Infos;
