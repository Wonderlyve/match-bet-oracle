
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OSINTData, OSINTMatchInsight } from '@/services/osintService';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Cloud, 
  Target,
  Eye,
  Shield,
  AlertCircle,
  Info
} from 'lucide-react';

interface OSINTAnalysisProps {
  osintData: OSINTData;
  insights: OSINTMatchInsight[];
  teamA: string;
  teamB: string;
}

const OSINTAnalysis: React.FC<OSINTAnalysisProps> = ({ 
  osintData, 
  insights, 
  teamA, 
  teamB 
}) => {
  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600';
    if (sentiment < -0.3) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimentText = (sentiment: number) => {
    if (sentiment > 0.5) return 'Très positif';
    if (sentiment > 0.2) return 'Positif';
    if (sentiment > -0.2) return 'Neutre';
    if (sentiment > -0.5) return 'Négatif';
    return 'Très négatif';
  };

  return (
    <div className="space-y-4">
      {/* Header OSINT */}
      <Card className="gradient-card border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Eye className="h-5 w-5 text-purple-600" />
            <span>Analyse OSINT • Données Publiques</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Collecte automatisée d'informations publiques en ligne
          </p>
        </CardHeader>
      </Card>

      {/* Insights critiques */}
      {insights.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Target className="h-4 w-4 text-purple-600" />
              <span>Alertes & Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${getAlertColor(insight.alertLevel)}`}
              >
                <div className="flex items-start space-x-2">
                  {getAlertIcon(insight.alertLevel)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{insight.recommendation}</p>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confiance
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Forme des équipes */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Forme & État des Équipes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">{teamA}</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Forme récente:</span>
                  <div className="flex space-x-1">
                    {osintData.teamForm.recentResults.map((result, i) => (
                      <Badge 
                        key={i} 
                        variant={result === 'W' ? 'default' : result === 'D' ? 'secondary' : 'destructive'}
                        className="text-xs w-6 h-6 p-0 flex items-center justify-center"
                      >
                        {result}
                      </Badge>
                    ))}
                  </div>
                </div>
                {osintData.teamForm.injuries.length > 0 && (
                  <div>
                    <span className="text-xs text-red-600">Blessures:</span>
                    <div className="ml-2">
                      {osintData.teamForm.injuries.map((injury, i) => (
                        <p key={i} className="text-xs text-red-600">• {injury}</p>
                      ))}
                    </div>
                  </div>
                )}
                {osintData.teamForm.suspensions.length > 0 && (
                  <div>
                    <span className="text-xs text-orange-600">Suspensions:</span>
                    <div className="ml-2">
                      {osintData.teamForm.suspensions.map((suspension, i) => (
                        <p key={i} className="text-xs text-orange-600">• {suspension}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">{teamB}</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Forme récente:</span>
                  <div className="flex space-x-1">
                    {osintData.teamForm.recentResults.map((result, i) => (
                      <Badge 
                        key={i} 
                        variant={result === 'W' ? 'default' : result === 'D' ? 'secondary' : 'destructive'}
                        className="text-xs w-6 h-6 p-0 flex items-center justify-center"
                      >
                        {result}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment des réseaux sociaux */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Sentiment Réseaux Sociaux</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm font-medium">{teamA}</p>
              <p className={`text-2xl font-bold ${getSentimentColor(osintData.socialSentiment.homeTeamSentiment)}`}>
                {getSentimentText(osintData.socialSentiment.homeTeamSentiment)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{teamB}</p>
              <p className={`text-2xl font-bold ${getSentimentColor(osintData.socialSentiment.awayTeamSentiment)}`}>
                {getSentimentText(osintData.socialSentiment.awayTeamSentiment)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Sujets tendance:</p>
            <div className="flex flex-wrap gap-1">
              {osintData.socialSentiment.trendingTopics.map((topic, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tendances de paris */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <span>Tendances de Paris</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Victoire {teamA}</p>
              <p className="font-bold text-lg">{osintData.bettingTrends.odds.home}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Match nul</p>
              <p className="font-bold text-lg">{osintData.bettingTrends.odds.draw}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Victoire {teamB}</p>
              <p className="font-bold text-lg">{osintData.bettingTrends.odds.away}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Paris populaires:</p>
            <div className="space-y-1">
              {osintData.bettingTrends.popularBets.map((bet, i) => (
                <p key={i} className="text-xs bg-amber-50 p-2 rounded">• {bet}</p>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Volume de paris:</span>
            <Badge 
              variant={osintData.bettingTrends.volume === 'high' ? 'default' : 'secondary'}
            >
              {osintData.bettingTrends.volume}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Conditions du match */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Cloud className="h-4 w-4 text-sky-600" />
            <span>Conditions du Match</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Météo:</span>
            <span className="font-medium">{osintData.matchPreview.weather}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Stade:</span>
            <span className="font-medium">{osintData.matchPreview.venue}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Importance:</span>
            <Badge 
              variant={osintData.matchPreview.importance === 'high' ? 'default' : 'secondary'}
            >
              {osintData.matchPreview.importance}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-2">Sources de données publiques:</p>
          <div className="flex flex-wrap gap-1">
            {osintData.sources.map((source, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSINTAnalysis;
