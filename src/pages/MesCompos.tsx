
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getTodayMatches, getMatchAnalysis, TodayMatch } from '@/services/footballApi';
import { generatePredictions } from '@/services/predictionEngine';
import { saveTicket } from '@/services/storage';
import { BettingTicketData } from '@/components/BettingTicket';
import { Loader2, TrendingUp, Clock, Trophy, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MesCompos = () => {
  const [matches, setMatches] = useState<TodayMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingMatch, setAnalyzingMatch] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
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
      console.log('🔄 Chargement des matchs du jour depuis SoccersAPI...');
      
      const todayMatches = await getTodayMatches();
      setMatches(todayMatches);
      setLastUpdate(new Date());
      
      console.log(`✅ ${todayMatches.length} matchs chargés pour aujourd'hui`);
      
      if (todayMatches.length === 0) {
        toast({
          title: "ℹ️ Aucun match",
          description: "Aucun match programmé pour aujourd'hui",
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des matchs:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les matchs du jour. Vérifiez votre connexion.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeMatch = async (match: TodayMatch) => {
    setAnalyzingMatch(match.id);
    
    try {
      console.log(`🔍 Analyse en cours avec SoccersAPI: ${match.homeTeam} vs ${match.awayTeam}`);
      
      // Récupération des données via SoccersAPI avec de vraies statistiques
      const analysis = await getMatchAnalysis(match.homeTeam, match.awayTeam);
      
      // Génération des prédictions basées sur les vraies données
      const predictions = generatePredictions(match.homeTeam, match.awayTeam, analysis);
      
      // Création du ticket avec les vraies statistiques
      const newTicket: BettingTicketData = {
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        }
      };
      
      // Sauvegarde
      saveTicket(newTicket);
      
      toast({
        title: "✅ Analyse SoccersAPI terminée !",
        description: `Prédictions générées pour ${match.homeTeam} vs ${match.awayTeam}`,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-sport-primary" />
          <p className="text-muted-foreground">Chargement des matchs SoccersAPI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl font-bold text-gradient">
              📅 Mes Compos
            </h1>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isOnline ? 'En ligne' : 'Hors ligne'}</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            Matchs du jour • SoccersAPI en temps réel
          </p>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>

        {/* Bouton de rafraîchissement */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadTodayMatches}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </Button>
        </div>

        {/* Statistiques rapides */}
        <Card className="gradient-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-sport-primary">{matches.length}</div>
                <div className="text-xs text-muted-foreground">Matchs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-sport-success">
                  {matches.filter(m => m.league.includes('Premier') || m.league.includes('Liga') || m.league.includes('Serie')).length}
                </div>
                <div className="text-xs text-muted-foreground">Top Ligues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-sport-warning">Live</div>
                <div className="text-xs text-muted-foreground">SoccersAPI</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des matchs */}
        <div className="space-y-4">
          {matches.length > 0 ? (
            matches.map((match) => (
              <Card key={match.id} className="gradient-card border-0 shadow-md hover:shadow-lg transition-shadow animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-sport-primary" />
                      <span className="text-sm font-medium text-sport-primary">{match.league}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {match.time}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="font-semibold text-lg">
                      {match.homeTeam}
                    </div>
                    <div className="text-2xl font-bold text-sport-primary my-2">VS</div>
                    <div className="font-semibold text-lg">
                      {match.awayTeam}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => analyzeMatch(match)}
                    disabled={analyzingMatch === match.id || !isOnline}
                    className="w-full gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {analyzingMatch === match.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyse SoccersAPI...
                      </>
                    ) : !isOnline ? (
                      <>
                        <WifiOff className="h-4 w-4 mr-2" />
                        Connexion requise
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Voir l'analyse
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="gradient-card border-0 shadow-md">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">⚽</div>
                <h3 className="font-semibold text-lg mb-2">Aucun match aujourd'hui</h3>
                <p className="text-muted-foreground text-sm">
                  Revenez demain pour de nouveaux matchs à analyser !
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Footer info */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            🔄 SoccersAPI • 📊 Analyses IA basées sur données réelles
          </p>
        </div>
      </div>
    </div>
  );
};

export default MesCompos;
