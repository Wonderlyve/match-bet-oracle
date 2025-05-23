
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trash2, Star, StarOff } from 'lucide-react';
import { deleteTicket } from '@/services/storage';

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
  favorite?: boolean;
  statistics?: {
    teamAForm: string;
    teamBForm: string;
    headToHead: string;
    avgGoals: string;
    avgCorners?: string;
    avgCards?: string;
  };
}

interface BettingTicketProps {
  ticket: BettingTicketData;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

const BettingTicket: React.FC<BettingTicketProps> = ({ 
  ticket, 
  onDelete,
  onToggleFavorite
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-sport-success text-white';
    if (confidence >= 60) return 'bg-sport-warning text-white';
    return 'bg-sport-danger text-white';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Très probable';
    if (confidence >= 60) return 'Probable';
    return 'Incertain';
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(ticket.id);
    } else {
      deleteTicket(ticket.id);
      window.location.reload();
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(ticket.id);
    }
  };

  const getTopPredictions = () => {
    // Afficher les 3 prédictions les plus probables lorsque le ticket n'est pas étendu
    return [...ticket.predictions]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  };

  return (
    <Card className={`gradient-card shadow-lg border-0 hover:shadow-xl transition-all duration-300 animate-slide-up ${ticket.favorite ? 'ring-2 ring-sport-warning' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-sport-primary">
            {ticket.teamA} vs {ticket.teamB}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {onToggleFavorite && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={handleToggleFavorite}
              >
                {ticket.favorite ? (
                  <Star className="h-4 w-4 text-sport-warning" fill="currentColor" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
        
        {ticket.statistics && (
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-slate-50 p-2 rounded">
              <span className="font-medium">Forme:</span>
              <div>{ticket.teamA}: {ticket.statistics.teamAForm}</div>
              <div>{ticket.teamB}: {ticket.statistics.teamBForm}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="font-medium">H2H:</span>
              <div>{ticket.statistics.headToHead}</div>
              <div>Moy. buts: {ticket.statistics.avgGoals}</div>
              {ticket.statistics.avgCorners && (
                <div>Moy. corners: {ticket.statistics.avgCorners}</div>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {(expanded ? ticket.predictions : getTopPredictions()).map((prediction, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-sport-primary">
                  {prediction.type}
                </span>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getConfidenceColor(prediction.confidence)}`}>
                    {getConfidenceLabel(prediction.confidence)}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-bold">
                    {prediction.odds}
                  </Badge>
                </div>
              </div>
              
              <div className="mb-2">
                <span className="font-bold text-sport-secondary">
                  {prediction.prediction}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {prediction.reasoning}
              </p>
              
              <div className="mt-2 bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-sport-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${prediction.confidence}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                Confiance: {prediction.confidence}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground hover:text-sport-danger"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Supprimer
        </Button>
        
        {ticket.predictions.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-sport-primary"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Réduire
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Voir tout ({ticket.predictions.length})
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BettingTicket;
