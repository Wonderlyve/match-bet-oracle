
import React, { useState, useEffect } from 'react';
import MatchForm from '@/components/MatchForm';
import BettingTicket, { BettingTicketData } from '@/components/BettingTicket';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMatchAnalysis, hasApiKey } from '@/services/footballApi';
import { generatePredictions } from '@/services/predictionEngine';
import { saveTicket, getTickets, clearTickets } from '@/services/storage';
import ApiKeyForm from '@/components/ApiKeyForm';

const Index = () => {
  const [tickets, setTickets] = useState<BettingTicketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(hasApiKey());
  const [isApiFormVisible, setIsApiFormVisible] = useState(!hasApiKey());
  const { toast } = useToast();

  useEffect(() => {
    const loadTickets = () => {
      const savedTickets = getTickets();
      setTickets(savedTickets);
      console.log(`${savedTickets.length} tickets chargés depuis le localStorage`);
    };
    
    loadTickets();
    setApiConfigured(hasApiKey());
  }, []);

  const handleMatchSubmit = async (teamA: string, teamB: string) => {
    setIsLoading(true);
    
    try {
      console.log(`Début d'analyse: ${teamA} vs ${teamB}`);
      
      // Récupération des données via l'API
      const analysis = await getMatchAnalysis(teamA, teamB);
      
      // Génération des prédictions
      const predictions = generatePredictions(teamA, teamB, analysis);
      
      // Création du ticket
      const newTicket: BettingTicketData = {
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        teamA,
        teamB,
        predictions,
        createdAt: new Date().toISOString(),
        statistics: {
          teamAForm: analysis.teamAStats.form,
          teamBForm: analysis.teamBStats.form,
          headToHead: `${analysis.headToHead.filter(h => h.winner === teamA).length}-${analysis.headToHead.filter(h => h.winner === teamB).length}-${analysis.headToHead.filter(h => h.winner === 'Draw').length}`,
          avgGoals: analysis.avgGoalsPerMatch.toFixed(1)
        }
      };
      
      // Sauvegarde et mise à jour de l'état
      saveTicket(newTicket);
      setTickets(prevTickets => [newTicket, ...prevTickets]);
      
      toast({
        title: "Analyse terminée ! 🎯",
        description: `Prédictions générées pour ${teamA} vs ${teamB}`,
      });
      
      console.log('Nouveau ticket créé:', newTicket.id);
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'analyser ce match. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearTickets();
    setTickets([]);
    toast({
      title: "Historique effacé",
      description: "Tous les tickets ont été supprimés",
    });
  };

  const handleApiSaved = () => {
    setApiConfigured(true);
    setIsApiFormVisible(false);
  };

  const toggleApiForm = () => {
    setIsApiFormVisible(!isApiFormVisible);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Bouton de configuration API */}
        <div className="text-right">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleApiForm}
            className="text-xs"
          >
            ⚙️ {apiConfigured ? 'Modifier clé API' : 'Configurer API'}
          </Button>
        </div>
        
        {/* Formulaire de configuration API */}
        {isApiFormVisible && (
          <ApiKeyForm onSaved={handleApiSaved} />
        )}
        
        {/* Formulaire de saisie */}
        {(!isApiFormVisible || apiConfigured) && (
          <MatchForm 
            onMatchSubmit={handleMatchSubmit} 
            isLoading={isLoading}
          />
        )}
        
        {/* Section des tickets */}
        {tickets.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-sport-primary">
                📊 Mes Analyses ({tickets.length})
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearHistory}
                className="text-sport-danger border-sport-danger hover:bg-sport-danger hover:text-white"
              >
                🗑️ Effacer
              </Button>
            </div>
            
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <BettingTicket key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        )}
        
        {/* Message d'accueil si aucun ticket */}
        {tickets.length === 0 && !isLoading && !isApiFormVisible && (
          <div className="text-center py-12 space-y-4 animate-fade-in">
            <div className="text-6xl">⚽</div>
            <h3 className="text-lg font-semibold text-sport-primary">
              Analysez votre premier match !
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Saisissez les équipes ci-dessus pour obtenir des prédictions basées sur les statistiques et l'historique des confrontations.
            </p>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-xs text-muted-foreground">
            🤖 Prédictions basées sur l'IA • 📱 Mobile-first • 💾 Stockage local
          </p>
          {apiConfigured && (
            <p className="text-xs text-sport-primary mt-1">
              ✓ API Football configurée
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
