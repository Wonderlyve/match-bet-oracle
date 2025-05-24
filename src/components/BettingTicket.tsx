import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, Users, MapPin, Clock, Target, Brain } from 'lucide-react';

export interface BettingTicketData {
  id: string;
  teamA: string;
  teamB: string;
  predictions: {
    result: string;
    goalsOver: boolean;
    goalsUnder: boolean;
    bothTeamsScore: boolean;
    confidence: number;
  };
  createdAt: string;
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
    recommendedBets: {
      type: string;
      prediction: string;
      reasoning: string;
      bankrollAdvice: string;
      stake: number;
    }[];
    socialSentiment: {
      homeTeamSentiment: number;
      awayTeamSentiment: number;
      trendingTopics: string[];
    };
    bettingTrends: {
      popularBets: string[];
      odds: {
        home: number;
        draw: number;
        away: number;
      };
      volume: 'low' | 'medium' | 'high';
    };
    matchPreview: {
      weather?: string;
      venue: string;
      referee?: string;
      importance: 'low' | 'medium' | 'high';
    };
  };
  matchInfo?: {
    league: string;
    country: string;
    venue: string;
    time: string;
    status: string;
  };
}

interface BettingTicketProps {
  ticket: BettingTicketData;
  onDelete: (id: string) => void;
}

const BettingTicket: React.FC<BettingTicketProps> = ({ ticket, onDelete }) => {
  const createdAtDate = new Date(ticket.createdAt);
  const formattedDate = createdAtDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader className="px-4 py-3 flex items-center justify-between">
        <CardTitle className="text-lg font-semibold">{ticket.teamA} vs {ticket.teamB}</CardTitle>
        <Button variant="destructive" size="icon" onClick={() => onDelete(ticket.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{ticket.matchInfo?.time || 'N/A'}</span>
            <MapPin className="h-4 w-4" />
            <span>{ticket.matchInfo?.venue || 'N/A'}, {ticket.matchInfo?.country || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{ticket.matchInfo?.league || 'N/A'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm font-semibold text-gray-700">Prédiction:</div>
            <div className="text-lg font-bold text-sport-primary">{ticket.predictions.result}</div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">Confiance: {ticket.predictions.confidence}%</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-700">Options:</div>
            <div className="flex flex-col space-y-1">
              {ticket.predictions.goalsOver && <Badge variant="secondary">Plus de buts</Badge>}
              {ticket.predictions.goalsUnder && <Badge variant="secondary">Moins de buts</Badge>}
              {ticket.predictions.bothTeamsScore && <Badge variant="secondary">Les deux équipes marquent</Badge>}
            </div>
          </div>
        </div>

        {ticket.statistics && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Statistiques:</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs text-gray-500">Forme A:</div>
                <div className="text-sm font-medium">{ticket.statistics.teamAForm}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Forme B:</div>
                <div className="text-sm font-medium">{ticket.statistics.teamBForm}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">H2H:</div>
                <div className="text-sm font-medium">{ticket.statistics.headToHead}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Moy. Buts:</div>
                <div className="text-sm font-medium">{ticket.statistics.avgGoals}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Moy. Corners:</div>
                <div className="text-sm font-medium">{ticket.statistics.avgCorners}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Moy. Cartons:</div>
                <div className="text-sm font-medium">{ticket.statistics.avgCards}</div>
              </div>
            </div>
          </div>
        )}

        {ticket.aiAnalysis && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
              <Brain className="h-4 w-4" />
              <span>Analyse IA:</span>
            </div>
            <div className="text-xs text-gray-500 italic">{ticket.aiAnalysis.matchAnalysis}</div>
          </div>
        )}

        <div className="text-xs text-gray-500">Créé le: {formattedDate}</div>
      </CardContent>
    </Card>
  );
};

export default BettingTicket;
