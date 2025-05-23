import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { validateTeamMultiSource } from '@/services/teamValidationService';
import { CheckCircle, XCircle, Loader2, AlertTriangle, Globe } from 'lucide-react';

interface MatchFormProps {
  onMatchSubmit: (teamA: string, teamB: string) => void;
  isLoading: boolean;
}

const MatchForm: React.FC<MatchFormProps> = ({ onMatchSubmit, isLoading }) => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [teamAValid, setTeamAValid] = useState<boolean | null>(null);
  const [teamBValid, setTeamBValid] = useState<boolean | null>(null);
  const [teamAValidating, setTeamAValidating] = useState(false);
  const [teamBValidating, setTeamBValidating] = useState(false);
  const [teamAInfo, setTeamAInfo] = useState<any>(null);
  const [teamBInfo, setTeamBInfo] = useState<any>(null);
  const [teamAError, setTeamAError] = useState<string>('');
  const [teamBError, setTeamBError] = useState<string>('');
  const { toast } = useToast();

  // Validation équipe A avec sources multiples
  const validateTeamA = async (teamName: string) => {
    if (teamName.length < 2) {
      setTeamAValid(null);
      setTeamAInfo(null);
      setTeamAError('');
      return;
    }

    setTeamAValidating(true);
    setTeamAError('');
    
    try {
      const result = await validateTeamMultiSource(teamName);
      
      if (result.isValid) {
        setTeamAValid(true);
        setTeamAInfo(result);
        console.log(`✅ Équipe A validée: ${result.correctedName} (${result.source})`);
      } else {
        setTeamAValid(false);
        setTeamAInfo(null);
        setTeamAError(`"${teamName}" ne correspond pas à un nom réel de club de football`);
      }
    } catch (error) {
      setTeamAValid(false);
      setTeamAInfo(null);
      setTeamAError(error instanceof Error ? error.message : 'Équipe non trouvée');
    } finally {
      setTeamAValidating(false);
    }
  };

  // Validation équipe B avec sources multiples
  const validateTeamB = async (teamName: string) => {
    if (teamName.length < 2) {
      setTeamBValid(null);
      setTeamBInfo(null);
      setTeamBError('');
      return;
    }

    setTeamBValidating(true);
    setTeamBError('');
    
    try {
      const result = await validateTeamMultiSource(teamName);
      
      if (result.isValid) {
        setTeamBValid(true);
        setTeamBInfo(result);
        console.log(`✅ Équipe B validée: ${result.correctedName} (${result.source})`);
      } else {
        setTeamBValid(false);
        setTeamBInfo(null);
        setTeamBError(`"${teamName}" ne correspond pas à un nom réel de club de football`);
      }
    } catch (error) {
      setTeamBValid(false);
      setTeamBInfo(null);
      setTeamBError(error instanceof Error ? error.message : 'Équipe non trouvée');
    } finally {
      setTeamBValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamA.trim() || !teamB.trim()) {
      toast({
        title: "❌ Erreur",
        description: "Veuillez renseigner les deux équipes",
        variant: "destructive"
      });
      return;
    }

    if (teamA.toLowerCase() === teamB.toLowerCase()) {
      toast({
        title: "❌ Erreur",
        description: "Les deux équipes doivent être différentes",
        variant: "destructive"
      });
      return;
    }

    if (teamAValid === false) {
      toast({
        title: "❌ Équipe domicile invalide",
        description: teamAError || "Ce nom ne correspond pas à un club de football réel",
        variant: "destructive"
      });
      return;
    }

    if (teamBValid === false) {
      toast({
        title: "❌ Équipe extérieur invalide", 
        description: teamBError || "Ce nom ne correspond pas à un club de football réel",
        variant: "destructive"
      });
      return;
    }

    // Utiliser les noms corrigés si disponibles
    const finalTeamA = teamAInfo?.correctedName || teamA.trim();
    const finalTeamB = teamBInfo?.correctedName || teamB.trim();
    
    onMatchSubmit(finalTeamA, finalTeamB);
    
    // Reset du formulaire
    setTeamA('');
    setTeamB('');
    setTeamAValid(null);
    setTeamBValid(null);
    setTeamAInfo(null);
    setTeamBInfo(null);
    setTeamAError('');
    setTeamBError('');
  };

  const getValidationIcon = (valid: boolean | null, validating: boolean) => {
    if (validating) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (valid === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (valid === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'local_database': return '🏠';
      case 'thesportsdb': return '🌐';
      case 'football_data': return '⚽';
      case 'api_football': return '🔥';
      default: return '✅';
    }
  };

  return (
    <Card className="gradient-card shadow-lg border-0 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center text-gradient">
          🏆 Match Bet Oracle
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Validation multi-sources • Données internet gratuites
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="teamA" className="block text-sm font-medium mb-2">
                Équipe domicile
              </label>
              <div className="relative">
                <Input
                  id="teamA"
                  type="text"
                  placeholder="Ex: Paris Saint-Germain"
                  value={teamA}
                  onChange={(e) => {
                    setTeamA(e.target.value);
                    setTimeout(() => {
                      if (e.target.value === teamA) {
                        validateTeamA(e.target.value);
                      }
                    }, 1000);
                  }}
                  className={`h-12 text-base border-2 transition-colors pr-10 ${
                    teamAValid === true ? 'border-green-500 focus:border-green-500' :
                    teamAValid === false ? 'border-red-500 focus:border-red-500' :
                    'focus:border-sport-primary'
                  }`}
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon(teamAValid, teamAValidating)}
                </div>
              </div>
              
              {teamAInfo && teamAValid && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 font-medium">
                    {getSourceIcon(teamAInfo.source)} {teamAInfo.correctedName}
                  </p>
                  <p className="text-xs text-green-600">
                    {teamAInfo.country} • {teamAInfo.league || 'Ligue inconnue'}
                  </p>
                </div>
              )}
              
              {teamAValid === false && teamAError && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-red-700 font-medium">Équipe non reconnue</p>
                      <p className="text-xs text-red-600">{teamAError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center py-2">
              <span className="text-xl font-bold text-muted-foreground">VS</span>
            </div>
            
            <div>
              <label htmlFor="teamB" className="block text-sm font-medium mb-2">
                Équipe extérieur
              </label>
              <div className="relative">
                <Input
                  id="teamB"
                  type="text"
                  placeholder="Ex: Olympique de Marseille"
                  value={teamB}
                  onChange={(e) => {
                    setTeamB(e.target.value);
                    setTimeout(() => {
                      if (e.target.value === teamB) {
                        validateTeamB(e.target.value);
                      }
                    }, 1000);
                  }}
                  className={`h-12 text-base border-2 transition-colors pr-10 ${
                    teamBValid === true ? 'border-green-500 focus:border-green-500' :
                    teamBValid === false ? 'border-red-500 focus:border-red-500' :
                    'focus:border-sport-primary'
                  }`}
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon(teamBValid, teamBValidating)}
                </div>
              </div>
              
              {teamBInfo && teamBValid && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 font-medium">
                    {getSourceIcon(teamBInfo.source)} {teamBInfo.correctedName}
                  </p>
                  <p className="text-xs text-green-600">
                    {teamBInfo.country} • {teamBInfo.league || 'Ligue inconnue'}
                  </p>
                </div>
              )}
              
              {teamBValid === false && teamBError && (
                <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-red-700 font-medium">Équipe non reconnue</p>
                      <p className="text-xs text-red-600">{teamBError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-xs text-blue-700">
              <Globe className="h-3 w-3" />
              <span>Validation via sources internet gratuites</span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]"
            disabled={isLoading || teamAValidating || teamBValidating || teamAValid === false || teamBValid === false}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyse multi-sources...</span>
              </div>
            ) : (
              '🚀 Analyser avec données internet'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MatchForm;
