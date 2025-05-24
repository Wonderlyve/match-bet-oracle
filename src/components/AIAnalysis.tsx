
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIData, AIMatchInsight } from '@/services/aiService';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Cloud, 
  Target,
  Brain,
  Shield,
  AlertCircle,
  Info,
  DollarSign,
  PieChart,
  Trophy,
  BarChart3
} from 'lucide-react';

interface AIAnalysisProps {
  aiData: AIData;
  insights: AIMatchInsight[];
  teamA: string;
  teamB: string;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ 
  aiData, 
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
    <div className="space-y-3">
      {/* Header IA */}
      <Card className="gradient-card border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Brain className="h-4 w-4 text-purple-600" />
            <span>Analyse IA • Intelligence Artificielle</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Collecte automatisée et analyse approfondie des données publiques
          </p>
        </CardHeader>
      </Card>

      {/* Analyse complète du match - Format mobile optimisé */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Target className="h-4 w-4 text-blue-600" />
            <span>Analyse Complète du Match</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="text-xs leading-relaxed space-y-2">
            {aiData.matchAnalysis.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className={paragraph.startsWith('**') ? 'font-semibold text-blue-800' : ''}>
                  {paragraph.replace(/\*\*/g, '')}
                </p>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations IA de paris - Mobile first */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>Recommandations IA de Paris</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {aiData.recommendedBets.map((bet, index) => (
            <div key={index} className="p-2 rounded-lg border bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-xs">{bet.type}</h4>
                <Badge variant="outline" className="text-xs bg-white px-1 py-0">
                  {bet.stake}%
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-700 text-xs">{bet.prediction}</span>
                  <PieChart className="h-3 w-3 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">{bet.reasoning}</p>
                <div className="p-1 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <strong>💰 Bankroll:</strong> {bet.bankrollAdvice}
                </div>
              </div>
            </div>
          ))}
          
          {/* Conseils généraux - Compact mobile */}
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-xs mb-1 flex items-center">
              <Shield className="h-3 w-3 mr-1 text-blue-600" />
              Gestion Bankroll
            </h4>
            <div className="text-xs space-y-0.5 text-blue-700">
              <p>• Max 5% par pari • Diversifiez vos mises</p>
              <p>• Suivez vos résultats • Fixez des limites</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights critiques - Format compact */}
      {insights.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Target className="h-4 w-4 text-purple-600" />
              <span>Alertes & Insights IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-2 rounded-lg border ${getAlertColor(insight.alertLevel)}`}
              >
                <div className="flex items-start space-x-2">
                  {getAlertIcon(insight.alertLevel)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-xs">{insight.recommendation}</p>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {insight.confidence}%
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

      {/* Forme des équipes - Layout mobile optimisé */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Trophy className="h-4 w-4 text-green-600" />
            <span>État & Forme des Équipes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Team A */}
            <div className="p-2 bg-green-50 rounded-lg">
              <h4 className="font-medium text-xs mb-2 text-center text-green-800">{teamA} (Domicile)</h4>
              <div className="space-y-2">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Forme récente</span>
                  <div className="flex justify-center space-x-1">
                    {aiData.teamForm.recentResults.map((result, i) => (
                      <Badge 
                        key={i} 
                        variant={result === 'W' ? 'default' : result === 'D' ? 'secondary' : 'destructive'}
                        className="text-xs w-5 h-5 p-0 flex items-center justify-center"
                      >
                        {result}
                      </Badge>
                    ))}
                  </div>
                </div>
                {aiData.teamForm.injuries.length > 0 && (
                  <div className="text-center">
                    <span className="text-xs text-red-600 block">🏥 Blessures</span>
                    <div className="text-xs">
                      {aiData.teamForm.injuries.map((injury, i) => (
                        <p key={i} className="text-red-600">• {injury}</p>
                      ))}
                    </div>
                  </div>
                )}
                {aiData.teamForm.suspensions.length > 0 && (
                  <div className="text-center">
                    <span className="text-xs text-orange-600 block">⚠️ Suspensions</span>
                    <div className="text-xs">
                      {aiData.teamForm.suspensions.map((suspension, i) => (
                        <p key={i} className="text-orange-600">• {suspension}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Team B */}
            <div className="p-2 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-xs mb-2 text-center text-blue-800">{teamB} (Extérieur)</h4>
              <div className="space-y-2">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Forme récente</span>
                  <div className="flex justify-center space-x-1">
                    {/* Utilise les mêmes résultats pour la démo, à améliorer avec vraies données */}
                    {aiData.teamForm.recentResults.map((result, i) => (
                      <Badge 
                        key={i} 
                        variant={result === 'W' ? 'default' : result === 'D' ? 'secondary' : 'destructive'}
                        className="text-xs w-5 h-5 p-0 flex items-center justify-center"
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

      {/* Sentiment réseaux sociaux - Compact */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Sentiment Public</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <p className="text-xs font-medium mb-1">{teamA}</p>
              <p className={`text-sm font-bold ${getSentimentColor(aiData.socialSentiment.homeTeamSentiment)}`}>
                {getSentimentText(aiData.socialSentiment.homeTeamSentiment)}
              </p>
              <div className="text-xs text-muted-foreground">
                {(aiData.socialSentiment.homeTeamSentiment * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gray-50">
              <p className="text-xs font-medium mb-1">{teamB}</p>
              <p className={`text-sm font-bold ${getSentimentColor(aiData.socialSentiment.awayTeamSentiment)}`}>
                {getSentimentText(aiData.socialSentiment.awayTeamSentiment)}
              </p>
              <div className="text-xs text-muted-foreground">
                {(aiData.socialSentiment.awayTeamSentiment * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">📱 Tendances:</p>
            <div className="flex flex-wrap gap-1">
              {aiData.socialSentiment.trendingTopics.map((topic, i) => (
                <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marché des paris - Format compact */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <BarChart3 className="h-4 w-4 text-amber-600" />
            <span>Marché des Paris</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="p-2 rounded bg-green-50">
              <p className="text-xs text-muted-foreground">{teamA}</p>
              <p className="font-bold text-sm text-green-700">{aiData.bettingTrends.odds.home}</p>
              <p className="text-xs text-green-600">
                {((1/aiData.bettingTrends.odds.home) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-2 rounded bg-yellow-50">
              <p className="text-xs text-muted-foreground">Nul</p>
              <p className="font-bold text-sm text-yellow-700">{aiData.bettingTrends.odds.draw}</p>
              <p className="text-xs text-yellow-600">
                {((1/aiData.bettingTrends.odds.draw) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-2 rounded bg-blue-50">
              <p className="text-xs text-muted-foreground">{teamB}</p>
              <p className="font-bold text-sm text-blue-700">{aiData.bettingTrends.odds.away}</p>
              <p className="text-xs text-blue-600">
                {((1/aiData.bettingTrends.odds.away) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">🔥 Paris populaires:</p>
            <div className="space-y-1">
              {aiData.bettingTrends.popularBets.slice(0, 2).map((bet, i) => (
                <p key={i} className="text-xs bg-amber-50 p-1 rounded flex items-center">
                  <span className="mr-1">#{i+1}</span>
                  {bet}
                </p>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs p-1 bg-gray-50 rounded">
            <span>📊 Volume:</span>
            <Badge 
              variant={aiData.bettingTrends.volume === 'high' ? 'default' : 
                      aiData.bettingTrends.volume === 'medium' ? 'secondary' : 'outline'}
              className="capitalize text-xs px-1 py-0"
            >
              {aiData.bettingTrends.volume}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Conditions du match - Compact */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Cloud className="h-4 w-4 text-sky-600" />
            <span>Conditions & Contexte</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-sky-50 rounded">
              <p className="text-xs text-muted-foreground">☁️ Météo</p>
              <p className="font-medium text-xs">{aiData.matchPreview.weather}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-xs text-muted-foreground">🏟️ Lieu</p>
              <p className="font-medium text-xs">Domicile</p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
              <p className="text-xs text-muted-foreground">⚡ Enjeu</p>
              <Badge 
                variant={aiData.matchPreview.importance === 'high' ? 'default' : 
                        aiData.matchPreview.importance === 'medium' ? 'secondary' : 'outline'}
                className="text-xs px-1 py-0 capitalize"
              >
                {aiData.matchPreview.importance}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources - Footer compact */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-2">
          <p className="text-xs text-muted-foreground mb-1">🔍 Sources IA:</p>
          <div className="flex flex-wrap gap-1">
            {aiData.sources.slice(0, 4).map((source, i) => (
              <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                {source.split('.')[0]}
              </Badge>
            ))}
            {aiData.sources.length > 4 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{aiData.sources.length - 4}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysis;
