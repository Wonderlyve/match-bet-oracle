
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getTodayMatches, getMatchAnalysis, TodayMatch } from '@/services/footballApi';
import { collectAIData } from '@/services/aiService';
import { generatePredictions } from '@/services/predictionEngine';
import { saveTicket } from '@/services/storage';
import { BettingTicketData } from '@/components/BettingTicket';
import { Loader2, TrendingUp, Clock, Trophy, Wifi, WifiOff, RefreshCw, MapPin, Users, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MesCompos = () => {
  const [matches, setMatches] = useState<TodayMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingMatch, setAnalyzingMatch] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadTodayMatches();
    
    // Gérer le statut de connexion
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadTodayMatches = async () => {
    try {
      setIsLoading(true);
      setLoadingProgress(0);
      console.log('🔄 Chargement de 50 vrais matchs du jour...');
      
      // Simulation du progrès de chargement
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      const todayMatches = await getTodayMatches();
      setMatches(todayMatches);
      setLastUpdate(new Date());
      setLoadingProgress(100);
      
      console.log(`✅ ${todayMatches.length} matchs réels chargés pour aujourd'hui`);
      
      setTimeout(() => {
        toast({
          title: "🎯 Matchs chargés !",
          description: `${todayMatches.length} vrais matchs disponibles pour analyse IA`,
        });
      }, 500);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des matchs:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les matchs. Données de simulation utilisées.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setLoadingProgress(100);
    }
  };

  const analyzeMatch = async (match: TodayMatch) => {
    setAnalyzingMatch(match.id);
    
    try {
      console.log(`🔍 Analyse IA complète: ${match.homeTeam} vs ${match.awayTeam}`);
      
      // Analyse simultanée des données statistiques et IA
      const [analysis, aiData] = await Promise.all([
        getMatchAnalysis(match.homeTeam, match.awayTeam),
        collectAIData(match.homeTeam, match.awayTeam)
      ]);
      
      // Génération des prédictions basées sur toutes les données
      const predictions = generatePredictions(match.homeTeam, match.awayTeam, analysis);
      
      // Création du ticket avec analyse IA complète
      const newTicket: BettingTicketData = {
        id: `ai_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        teamA: match.homeTeam,
        teamB: match.awayTeam,
        predictions,
        createdAt: new Date().toISOString(),
        statistics: {
          teamAForm: analysis.teamAStats.form,
          teamBForm: analysis.teamBStats.form,
          headToHead: `${analysis.headToHead.filter(h => h.winner === 'teamA').length}-${analysis.headToHead.filter(h => h.winner === 'teamB').length}-${analysis.headToHead.filter(h => h.winner === 'Draw').length}`,
          avgGoals: analysis.avgGoalsPerMatch.toFixed(1),
          avgCorners: analysis.avgCornersPerMatch.toFixed(1),
          avgCards: analysis.avgCardsPerMatch.toFixed(1)
        },
        aiAnalysis: {
          matchAnalysis: aiData.matchAnalysis,
          recommendedBets: aiData.recommendedBets,
          socialSentiment: aiData.socialSentiment,
          bettingTrends: aiData.bettingTrends,
          matchPreview: aiData.matchPreview
        },
        matchInfo: {
          league: match.league,
          country: match.country,
          venue: match.venue,
          time: match.time,
          status: match.status
        }
      };
      
      // Sauvegarde
      saveTicket(newTicket);
      
      toast({
        title: "✅ Analyse IA terminée !",
        description: `Prédictions avec données réelles pour ${match.homeTeam} vs ${match.awayTeam}`,
      });
      
      // Redirection vers la page principale pour voir le ticket
      navigate('/');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error);
      toast({
        title: "Erreur d'analyse",
        description: error instanceof Error ? error.message : "Impossible d'analyser ce match",
        variant: "destructive"
      });
    } finally {
      setAnalyzingMatch(null);
    }
  };

  const getMatchPriority = (match: TodayMatch): 'high' | 'medium' | 'low' => {
    const topLeagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];
    const popularTeams = ['Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Bayern Munich', 'Paris Saint-Germain'];
    
    if (topLeagues.includes(match.league)) return 'high';
    if (popularTeams.some(team => match.homeTeam.includes(team) || match.awayTeam.includes(team))) return 'medium';
    return 'low';
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">🔥 Priorité</span>;
      case 'medium':
        return <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">⭐ Important</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">📊 Standard</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-sport-primary" />
          <h3 className="font-semibold text-xl mb-2">🌐 Collecte des matchs réels</h3>
          <p className="text-muted-foreground mb-4">
            Récupération de 50 vrais matchs depuis les APIs publiques...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-sport-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">{loadingProgress}% complété</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header compact */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-xl font-bold text-gradient">🎯 Mes Compos</h1>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? 'Live' : 'Hors ligne'}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            50 vrais matchs • Analyses IA en temps réel
          </p>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              ⏰ {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>

        {/* Bouton de rafraîchissement compact */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadTodayMatches}
            disabled={isLoading}
            className="flex items-center space-x-2 text-xs"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </Button>
        </div>

        {/* Statistiques rapides compactes */}
        <Card className="gradient-card border-0 shadow-md">
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-sport-primary">{matches.length}</div>
                <div className="text-xs text-muted-foreground">Matchs</div>
              </div>
              <div>
                <div className="text-lg font-bold text-sport-success">
                  {matches.filter(m => getMatchPriority(m) === 'high').length}
                </div>
                <div className="text-xs text-muted-foreground">Top</div>
              </div>
              <div>
                <div className="text-lg font-bold text-sport-warning">
                  {matches.filter(m => m.status !== 'Terminé').length}
                </div>
                <div className="text-xs text-muted-foreground">Live</div>
              </div>
              <div>
                <div className="text-lg font-bold text-sport-primary">IA</div>
                <div className="text-xs text-muted-foreground">Analyse</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des matchs optimisée mobile */}
        <div className="space-y-3">
          {matches.length > 0 ? (
            matches.map((match) => {
              const priority = getMatchPriority(match);
              return (
                <Card key={match.id} className="gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-3 w-3 text-sport-primary" />
                        <span className="text-xs font-medium text-sport-primary truncate">{match.league}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(priority)}
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {match.time}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Équipes */}
                    <div className="text-center">
                      <div className="text-sm font-semibold truncate">{match.homeTeam}</div>
                      <div className="text-lg font-bold text-sport-primary my-1">VS</div>
                      <div className="text-sm font-semibold truncate">{match.awayTeam}</div>
                    </div>
                    
                    {/* Informations match compactes */}
                    <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-20">{match.country}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span className="truncate max-w-20">{match.venue}</span>
                      </div>
                    </div>
                    
                    {/* Bouton d'analyse */}
                    <Button 
                      onClick={() => analyzeMatch(match)}
                      disabled={analyzingMatch === match.id || !isOnline}
                      className="w-full gradient-primary hover:opacity-90 transition-all duration-200 h-8 text-xs"
                    >
                      {analyzingMatch === match.id ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Analyse IA...
                        </>
                      ) : !isOnline ? (
                        <>
                          <WifiOff className="h-3 w-3 mr-2" />
                          Connexion requise
                        </>
                      ) : (
                        <>
                          <Target className="h-3 w-3 mr-2" />
                          Analyser avec IA
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="gradient-card border-0 shadow-md">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">⚽</div>
                <h3 className="font-semibold text-lg mb-2">Aucun match disponible</h3>
                <p className="text-muted-foreground text-sm">
                  Vérifiez votre connexion et réessayez
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Footer info compact */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            🌐 Données réelles • 🤖 IA • 📊 50 matchs analysés
          </p>
        </div>
      </div>
    </div>
  );
};

export default MesCompos;
