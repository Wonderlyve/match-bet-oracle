
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OSINTAnalysis from './OSINTAnalysis';
import { collectOSINTData, generateOSINTInsights, OSINTData, OSINTMatchInsight } from '@/services/osintService';
import { 
  TrendingUp, 
  Star, 
  BarChart3, 
  Target, 
  Calendar,
  Eye,
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
  const [osintData, setOsintData] = useState<OSINTData | null>(null);
  const [osintInsights, setOsintInsights] = useState<OSINTMatchInsight[]>([]);
  const [loadingOSINT, setLoadingOSINT] = useState(false);
  const [activeTab, setActiveTab] = useState('predictions');

  const loadOSINTAnalysis = async () => {
    if (osintData) return; // Déjà chargé
    
    setLoadingOSINT(true);
    try {
      console.log(`🕵️ Chargement analyse OSINT pour ${ticket.teamA} vs ${ticket.teamB}`);
      
      const data = await collectOSINTData(ticket.teamA, ticket.teamB);
      const insights = generateOSINTInsights(data, ticket.teamA, ticket.teamB);
      
      setOsintData(data);
      setOsintInsights(insights);
      
      console.log('✅ Analyse OSINT chargée:', data);
    } catch (error) {
      console.error('❌ Erreur OSINT:', error);
    } finally {
      setLoadingOSINT(false);
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

  return (
    <Card className="gradient-card shadow-lg border-0 animate-fade-in overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            🎯 {ticket.teamA} vs {ticket.teamB}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(ticket.id)}
                className="text-yellow-500 hover:text-yellow-600"
              >
                <Star className={`h-4 w-4 ${ticket.isFavorite ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(ticket.createdAt)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            ID: {ticket.id.slice(-8)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="predictions" className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span className="text-xs">Prédictions</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3" />
              <span className="text-xs">Statistiques</span>
            </TabsTrigger>
            <TabsTrigger 
              value="osint" 
              className="flex items-center space-x-1"
              onClick={loadOSINTAnalysis}
            >
              <Eye className="h-3 w-3" />
              <span className="text-xs">OSINT</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-3 mt-4">
            {ticket.predictions.map((prediction, index) => (
              <div key={index} className="p-3 border rounded-lg bg-white/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{prediction.type}</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(prediction.confidence)}`} />
                    <span className="text-xs text-muted-foreground">{prediction.confidence}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sport-primary">{prediction.prediction}</span>
                    <Badge variant="outline" className="text-xs">
                      Cote: {prediction.odds}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{prediction.reasoning}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="stats" className="space-y-3 mt-4">
            {ticket.statistics ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg bg-white/50">
                  <h4 className="font-medium text-sm mb-2">Forme des équipes</h4>
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="text-muted-foreground">{ticket.teamA}:</span>
                      <span className="ml-2 font-mono">{ticket.statistics.teamAForm}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">{ticket.teamB}:</span>
                      <span className="ml-2 font-mono">{ticket.statistics.teamBForm}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-white/50">
                  <h4 className="font-medium text-sm mb-2">Historique H2H</h4>
                  <div className="text-center">
                    <span className="text-xl font-bold text-sport-primary">
                      {ticket.statistics.headToHead}
                    </span>
                    <p className="text-xs text-muted-foreground">V-N-D</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-white/50">
                  <h4 className="font-medium text-sm mb-2">Moyennes</h4>
                  <div className="space-y-1 text-xs">
                    <div>Buts: {ticket.statistics.avgGoals}</div>
                    <div>Corners: {ticket.statistics.avgCorners}</div>
                    <div>Cartons: {ticket.statistics.avgCards}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune statistique disponible</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="osint" className="mt-4">
            {loadingOSINT ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-muted-foreground">Collecte des données OSINT...</p>
                <p className="text-xs text-muted-foreground mt-1">Sources publiques en ligne</p>
              </div>
            ) : osintData ? (
              <OSINTAnalysis 
                osintData={osintData} 
                insights={osintInsights}
                teamA={ticket.teamA}
                teamB={ticket.teamB}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Cliquez pour charger l'analyse OSINT</p>
                <p className="text-xs mt-1">Données publiques • Sources légales</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        {onDelete && (
          <div className="mt-4 pt-3 border-t">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete(ticket.id)}
              className="w-full"
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
