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
  Loader2,
  CheckCircle,
  Clock,
  Trophy
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
  aiAnalysis?: {
    matchAnalysis: string;
    recommendedBets: any[];
    socialSentiment: any;
    bettingTrends: any;
    matchPreview: any;
  };
  matchInfo?: {
    league: string;
    country: string;
    venue: string;
    time: string;
    status: string;
    date?: string;
    result?: {
      homeScore: number;
      awayScore: number;
      finished: boolean;
    };
  };
  socialPredictions?: {
    source: string;
    prediction: string;
    confidence: number;
    author: string;
    platform: string;
    type?: 'expert' | 'community' | 'professional';
  }[];
  externalPredictions?: {
    source: string;
    match: string;
    prediction: string;
    confidence: number;
    odds?: string;
    reasoning?: string;
    type: 'result' | 'goals' | 'btts' | 'corners' | 'cards' | 'special';
    site: 'pronostics-football-365' | 'forebet' | 'other';
  }[];
  professionalTrends?: {
    mostPopularPrediction: string;
    averageConfidence: number;
    consensusLevel: 'low' | 'medium' | 'high';
    recommendedBets: string[];
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
    if (aiData) return;
    
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

  const isMatchFinished = ticket.matchInfo?.result?.finished || false;
  const matchResult = ticket.matchInfo?.result;

  return (
    <Card className="gradient-card shadow-lg border-0 animate-fade-in overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">
            {isMatchFinished ? '✅' : '🎯'} {ticket.teamA} vs {ticket.teamB}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isMatchFinished && (
              <Badge variant="outline" className="text-xs px-2 py-1 bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Terminé
              </Badge>
            )}
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

        {/* Résultat du match si terminé */}
        {isMatchFinished && matchResult && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-green-800 mb-1">
                RÉSULTAT FINAL
              </div>
              <div className="text-2xl font-bold text-green-900">
                {ticket.teamA} {matchResult.homeScore} - {matchResult.awayScore} {ticket.teamB}
              </div>
              <div className="text-sm text-green-700 mt-1">
                {matchResult.homeScore > matchResult.awayScore 
                  ? `Victoire de ${ticket.teamA}` 
                  : matchResult.homeScore < matchResult.awayScore 
                    ? `Victoire de ${ticket.teamB}` 
                    : 'Match nul'}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            {isMatchFinished ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
          <Badge variant="outline" className="text-xs px-1 py-0">
            ID: {ticket.id.slice(-8)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-8">
            <TabsTrigger value="predictions" className="flex items-center space-x-1 text-xs">
              <Target className="h-3 w-3" />
              <span>Prédictions</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center space-x-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>Social</span>
            </TabsTrigger>
            <TabsTrigger value="pro" className="flex items-center space-x-1 text-xs">
              <Star className="h-3 w-3" />
              <span>Pro</span>
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

          <TabsContent value="social" className="space-y-2 mt-3">
            {ticket.socialPredictions && ticket.socialPredictions.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  📱 Pronostics des réseaux sociaux
                </div>
                {ticket.socialPredictions.map((pred, index) => (
                  <div key={index} className="p-2 border rounded-lg bg-blue-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {pred.platform}
                        </Badge>
                        <span className="text-xs font-medium">{pred.author}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(pred.confidence)}`} />
                    </div>
                    <p className="text-xs font-semibold text-blue-800 mb-1">{pred.prediction}</p>
                    <p className="text-xs text-muted-foreground">{pred.source}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Aucun pronostic social disponible</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pro" className="space-y-2 mt-3">
            {ticket.externalPredictions && ticket.externalPredictions.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  🏆 Pronostics des sites professionnels
                </div>
                
                {/* Tendances professionnelles */}
                {ticket.professionalTrends && (
                  <div className="p-2 border rounded-lg bg-purple-50/50 mb-3">
                    <h4 className="text-xs font-bold text-purple-800 mb-2">📊 Consensus Professionnel</h4>
                    <div className="space-y-1">
                      <p className="text-xs"><strong>Prédiction la plus populaire:</strong> {ticket.professionalTrends.mostPopularPrediction}</p>
                      <p className="text-xs"><strong>Confiance moyenne:</strong> {ticket.professionalTrends.averageConfidence.toFixed(0)}%</p>
                      <p className="text-xs"><strong>Niveau de consensus:</strong> 
                        <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                          ticket.professionalTrends.consensusLevel === 'high' ? 'bg-green-100 text-green-700' :
                          ticket.professionalTrends.consensusLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {ticket.professionalTrends.consensusLevel === 'high' ? 'Élevé' :
                           ticket.professionalTrends.consensusLevel === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Prédictions par site */}
                {ticket.externalPredictions.map((pred, index) => (
                  <div key={index} className="p-2 border rounded-lg bg-white/80">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className={`text-xs px-1 py-0 ${
                          pred.site === 'pronostics-football-365' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {pred.site === 'pronostics-football-365' ? 'PF365' : 'Forebet'}
                        </Badge>
                        {pred.odds && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            Cote: {pred.odds}
                          </Badge>
                        )}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(pred.confidence)}`} />
                    </div>
                    <p className="text-xs font-semibold text-gray-800 mb-1">{pred.prediction}</p>
                    <p className="text-xs text-muted-foreground mb-1">{pred.source}</p>
                    {pred.reasoning && (
                      <p className="text-xs text-gray-600 italic">{pred.reasoning}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Star className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Aucun pronostic professionnel disponible</p>
              </div>
            )}
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
