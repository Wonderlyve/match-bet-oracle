import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIAnalysis from './AIAnalysis';
import { collectAIData, generateAIInsights, AIData, AIMatchInsight } from '@/services/aiService';
import { 
  TrendingUp, 
  Star, 
  BarChart3, 
  Target, 
  Calendar,
  Brain,
  Loader2
} from 'lucide-react';

export interface BettingPrediction {
  type: string;
  prediction: string;
  confidence: number;
  odds: string;
  reasoning: string;
}

export interface BettingTicketData {
  id: string;
  teamA: string;
  teamB: string;
  predictions: BettingPrediction[];
  createdAt: string;
  isFavorite?: boolean;
  statistics?: {
    teamAForm: string;
    teamBForm: string;
    headToHead: string;
    avgGoals: string;
    avgCorners: string;
    avgCards: string;
  };
}

interface BettingTicketProps {
  ticket: BettingTicketData;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const BettingTicket: React.FC<BettingTicketProps> = ({ 
  ticket, 
  onToggleFavorite, 
  onDelete 
}) => {
  const [aiData, setAiData] = useState<AIData | null>(null);
  const [aiInsights, setAiInsights] = useState<AIMatchInsight[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState('predictions');

  const loadAIAnalysis = async () => {
    if (aiData) return; // Déjà chargé
    
    setLoadingAI(true);
    try {
      console.log(`🤖 Chargement analyse IA pour ${ticket.teamA} vs ${ticket.teamB}`);
      
      const data = await collectAIData(ticket.teamA, ticket.teamB);
      const insights = generateAIInsights(data, ticket.teamA, ticket.teamB);
      
      setAiData(data);
      setAiInsights(insights);
      
      console.log('✅ Analyse IA chargée:', data);
    } catch (error) {
      console.error('❌ Erreur IA:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatistic = (label: string, value: string, description: string) => (
    <div className="p-2 border rounded-lg bg-white/50">
      <h4 className="font-medium text-xs mb-1">{label}</h4>
      <div className="text-sm font-bold text-sport-primary mb-1">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <Card className="gradient-card shadow-lg border-0 animate-fade-in overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            🎯 {ticket.teamA} vs {ticket.teamB}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(ticket.id)}
                className="text-yellow-500 hover:text-yellow-600 p-1"
              >
                <Star className={`h-3 w-3 ${ticket.isFavorite ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
          <Badge variant="outline" className="text-xs px-1 py-0">
            ID: {ticket.id.slice(-8)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="predictions" className="flex items-center space-x-1 text-xs">
              <Target className="h-3 w-3" />
              <span>Prédictions</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-1 text-xs">
              <BarChart3 className="h-3 w-3" />
              <span>Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="flex items-center space-x-1 text-xs"
              onClick={loadAIAnalysis}
            >
              <Brain className="h-3 w-3" />
              <span>IA</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-2 mt-3">
            {ticket.predictions.map((prediction, index) => (
              <div key={index} className="p-2 border rounded-lg bg-white/50">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-xs">{prediction.type}</h4>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(prediction.confidence)}`} />
                    <span className="text-xs text-muted-foreground">{prediction.confidence}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sport-primary text-xs">{prediction.prediction}</span>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {prediction.odds}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{prediction.reasoning}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="stats" className="space-y-3 mt-3">
            {ticket.statistics ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {formatStatistic(
                    "Forme équipes", 
                    `${ticket.statistics.teamAForm} vs ${ticket.statistics.teamBForm}`,
                    "5 derniers matchs (V-N-D)"
                  )}
                  {formatStatistic(
                    "Face-à-face", 
                    ticket.statistics.headToHead,
                    "Victoires-Nuls-Défaites"
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {formatStatistic(
                    "Buts", 
                    ticket.statistics.avgGoals,
                    "Moy./match"
                  )}
                  {formatStatistic(
                    "Corners", 
                    ticket.statistics.avgCorners,
                    "Moy./match"
                  )}
                  {formatStatistic(
                    "Cartons", 
                    ticket.statistics.avgCards,
                    "Moy./match"
                  )}
                </div>
                
                {/* Guide d'interprétation - Version mobile compacte */}
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-xs mb-1 text-blue-800">
                    📊 Guide d'interprétation
                  </h4>
                  <div className="text-xs text-blue-700 space-y-0.5">
                    <p><strong>Forme :</strong> Plus de 'W' = équipe en confiance</p>
                    <p><strong>Buts/match :</strong> Plus de 2.5 = matchs ouverts</p>
                    <p><strong>Corners :</strong> Plus de 9 = jeu offensif</p>
                    <p><strong>Cartons :</strong> Plus de 4 = match tendu</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Aucune statistique disponible</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="mt-3">
            {loadingAI ? (
              <div className="text-center py-6">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-xs text-muted-foreground">Analyse IA en cours...</p>
                <p className="text-xs text-muted-foreground mt-1">Intelligence artificielle • Sources multiples</p>
              </div>
            ) : aiData ? (
              <AIAnalysis 
                aiData={aiData} 
                insights={aiInsights}
                teamA={ticket.teamA}
                teamB={ticket.teamB}
              />
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Brain className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Cliquez pour charger l'analyse IA</p>
                <p className="text-xs mt-1">Intelligence artificielle • Analyse approfondie</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        {onDelete && (
          <div className="mt-3 pt-2 border-t">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(ticket.id)}
              className="w-full text-xs h-8"
            >
              Supprimer ce ticket
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BettingTicket;
