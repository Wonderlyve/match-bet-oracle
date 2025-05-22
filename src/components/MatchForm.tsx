
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface MatchFormProps {
  onMatchSubmit: (teamA: string, teamB: string) => void;
  isLoading: boolean;
}

const MatchForm: React.FC<MatchFormProps> = ({ onMatchSubmit, isLoading }) => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamA.trim() || !teamB.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez renseigner les deux équipes",
        variant: "destructive"
      });
      return;
    }

    if (teamA.toLowerCase() === teamB.toLowerCase()) {
      toast({
        title: "Erreur",
        description: "Les deux équipes doivent être différentes",
        variant: "destructive"
      });
      return;
    }

    onMatchSubmit(teamA.trim(), teamB.trim());
    setTeamA('');
    setTeamB('');
  };

  return (
    <Card className="gradient-card shadow-lg border-0 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center text-gradient">
          🏆 Match Bet Oracle
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Analysez vos matchs et obtenez des prédictions intelligentes
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="teamA" className="block text-sm font-medium mb-2">
                Équipe domicile
              </label>
              <Input
                id="teamA"
                type="text"
                placeholder="Ex: Paris Saint-Germain"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="h-12 text-base border-2 focus:border-sport-primary transition-colors"
                disabled={isLoading}
              />
            </div>
            
            <div className="text-center py-2">
              <span className="text-xl font-bold text-muted-foreground">VS</span>
            </div>
            
            <div>
              <label htmlFor="teamB" className="block text-sm font-medium mb-2">
                Équipe extérieur
              </label>
              <Input
                id="teamB"
                type="text"
                placeholder="Ex: Olympique de Marseille"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="h-12 text-base border-2 focus:border-sport-primary transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyse en cours...</span>
              </div>
            ) : (
              '⚽ Analyser le match'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MatchForm;
