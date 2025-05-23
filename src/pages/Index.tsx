import React, { useState, useEffect } from 'react';
import MatchForm from '@/components/MatchForm';
import BettingTicket, { BettingTicketData } from '@/components/BettingTicket';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getMatchAnalysis, hasApiKey } from '@/services/footballApi';
import { generatePredictions } from '@/services/predictionEngine';
import { saveTicket, getTickets, clearTickets, toggleFavorite, getFavoriteTickets } from '@/services/storage';
import ApiKeyForm from '@/components/ApiKeyForm';
import { Star, BookOpenCheck, Settings } from 'lucide-react';

const Index = () => {
  const [tickets, setTickets] = useState<BettingTicketData[]>([]);
  const [favoriteTickets, setFavoriteTickets] = useState<BettingTicketData[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(hasApiKey());
  const [isApiFormVisible, setIsApiFormVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTickets();
    setApiConfigured(hasApiKey());
  }, []);

  const loadTickets = () => {
    const savedTickets = getTickets();
    const favorites = getFavoriteTickets();
    setTickets(savedTickets);
    setFavoriteTickets(favorites);
    console.log(`${savedTickets.length} tickets chargés depuis le localStorage`);
  };

  const handleMatchSubmit = async (teamA: string, teamB: string) => {
    setIsLoading(true);
    
    try {
      console.log(`Début d'analyse avec données réelles: ${teamA} vs ${teamB}`);
      
      // Récupération des données réelles via l'API
      const analysis = await getMatchAnalysis(teamA, teamB);
      
      // Génération des prédictions basées sur les vraies statistiques
      const predictions = generatePredictions(teamA, teamB, analysis);
      
      // Création du ticket avec les vraies données
      const newTicket: BettingTicketData = {
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        teamA,
        teamB,
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
      
      // Sauvegarde et mise à jour de l'état
      saveTicket(newTicket);
      setTickets(prevTickets => [newTicket, ...prevTickets]);
      setActiveTab('all');
      
      toast({
        title: "Analyse réelle terminée ! 🎯",
        description: `Prédictions basées sur des données réelles pour ${teamA} vs ${teamB}`,
      });
      
      console.log('Nouveau ticket avec données réelles créé:', newTicket.id);
      
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
    setFavoriteTickets([]);
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

  const handleDeleteTicket = (id: string) => {
    const updatedTickets = tickets.filter(ticket => ticket.id !== id);
    const updatedFavorites = favoriteTickets.filter(ticket => ticket.id !== id);
    
    setTickets(updatedTickets);
    setFavoriteTickets(updatedFavorites);
    
    // Mise à jour dans le localStorage
    clearTickets();
    updatedTickets.forEach(ticket => saveTicket(ticket));
    
    toast({
      title: "Ticket supprimé",
      description: "Le ticket a été supprimé avec succès",
    });
  };

  const handleToggleFavorite = (id: string) => {
    // Mise à jour des états locaux
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === id) {
        const isFavorite = !ticket.favorite;
        return { ...ticket, favorite: isFavorite };
      }
      return ticket;
    });
    
    setTickets(updatedTickets);
    
    // Mise à jour des favoris
    const updatedFavorites = updatedTickets.filter(ticket => ticket.favorite);
    setFavoriteTickets(updatedFavorites);
    
    // Mise à jour dans le localStorage
    toggleFavorite(id);
    
    toast({
      title: "Favoris mis à jour",
      description: "Le statut favori a été modifié",
    });
  };

  const displayTickets = activeTab === 'favorites' ? favoriteTickets : tickets;

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Bouton de configuration API */}
        <div className="text-right">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleApiForm}
            className="text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            {apiConfigured ? 'Modifier clé API' : 'Configurer API'}
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
        {tickets.length > 0 && !isLoading && (
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
                Effacer tout
              </Button>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all" className="flex items-center">
                  <BookOpenCheck className="h-3 w-3 mr-1" />
                  Tous ({tickets.length})
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Favoris ({favoriteTickets.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                {tickets.length > 0 ? (
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <BettingTicket 
                        key={ticket.id} 
                        ticket={ticket} 
                        onDelete={handleDeleteTicket}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune analyse disponible
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="favorites" className="mt-4">
                {favoriteTickets.length > 0 ? (
                  <div className="space-y-4">
                    {favoriteTickets.map((ticket) => (
                      <BettingTicket 
                        key={ticket.id} 
                        ticket={ticket} 
                        onDelete={handleDeleteTicket}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun favori enregistré
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
              Saisissez les équipes ci-dessus pour obtenir des prédictions basées sur des statistiques réelles et l'historique des confrontations.
            </p>
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-xs text-muted-foreground">
            🤖 Analyses basées sur des données réelles • 📱 Mobile-first • 💾 Stockage local
          </p>
          {apiConfigured && (
            <p className="text-xs text-sport-primary mt-1">
              ✓ API Football configurée avec données réelles
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
