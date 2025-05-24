
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIData, AIMatchInsight } from '@/services/osintService';
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
  PieChart
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
    <div className="space-y-4">
      {/* Header IA */}
      <Card className="gradient-card border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Analyse IA • Intelligence Artificielle</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Collecte automatisée et analyse approfondie des données publiques
          </p>
        </CardHeader>
      </Card>

      {/* Analyse complète du match */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Target className="h-4 w-4 text-blue-600" />
            <span>Analyse Complète du Match</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-sm">
              {aiData.matchAnalysis}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations IA de paris */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span>Recommandations IA de Paris</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiData.recommendedBets.map((bet, index) => (
            <div key={index} className="p-3 rounded-lg border bg-green-50 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{bet.type}</h4>
                <Badge variant="outline" className="text-xs bg-white">
                  {bet.stake}% de bankroll
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-green-700">{bet.prediction}</span>
                  <PieChart className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-600">{bet.reasoning}</p>
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <strong>💰 Gestion bankroll:</strong> {bet.bankrollAdvice}
                </div>
              </div>
            </div>
          ))}
          
          {/* Conseils généraux de bankroll */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-blue-600" />
              Conseils Gestion de Bankroll
            </h4>
            <div className="text-xs space-y-1 text-blue-700">
              <p>• Ne jamais miser plus de 5% de votre bankroll sur un seul pari</p>
              <p>• Diversifiez vos paris pour réduire les risques</p>
              <p>• Suivez vos résultats sur le long terme</p>
              <p>• Fixez-vous des limites de gains et de pertes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights critiques */}
      {insights.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Target className="h-4 w-4 text-purple-600" />
              <span>Alertes & Insights IA</span>
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
            <span>État & Forme des Équipes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2 text-center">{teamA} (Domicile)</h4>
              <div className="space-y-2">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Forme récente</span>
                  <div className="flex justify-center space-x-1">
                    {aiData.teamForm.recentResults.map((result, i) => (
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
                {aiData.teamForm.injuries.length > 0 && (
                  <div className="text-center">
                    <span className="text-xs text-red-600 block">🏥 Blessures:</span>
                    <div className="text-xs">
                      {aiData.teamForm.injuries.map((injury, i) => (
                        <p key={i} className="text-red-600">• {injury}</p>
                      ))}
                    </div>
                  </div>
                )}
                {aiData.teamForm.suspensions.length > 0 && (
                  <div className="text-center">
                    <span className="text-xs text-orange-600 block">⚠️ Suspensions:</span>
                    <div className="text-xs">
                      {aiData.teamForm.suspensions.map((suspension, i) => (
                        <p key={i} className="text-orange-600">• {suspension}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2 text-center">{teamB} (Extérieur)</h4>
              <div className="space-y-2">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Forme récente</span>
                  <div className="flex justify-center space-x-1">
                    {aiData.teamForm.recentResults.map((result, i) => (
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
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium mb-1">{teamA}</p>
              <p className={`text-lg font-bold ${getSentimentColor(aiData.socialSentiment.homeTeamSentiment)}`}>
                {getSentimentText(aiData.socialSentiment.homeTeamSentiment)}
              </p>
              <div className="text-xs text-muted-foreground">
                Score: {(aiData.socialSentiment.homeTeamSentiment * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium mb-1">{teamB}</p>
              <p className={`text-lg font-bold ${getSentimentColor(aiData.socialSentiment.awayTeamSentiment)}`}>
                {getSentimentText(aiData.socialSentiment.awayTeamSentiment)}
              </p>
              <div className="text-xs text-muted-foreground">
                Score: {(aiData.socialSentiment.awayTeamSentiment * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">📱 Sujets tendance:</p>
            <div className="flex flex-wrap gap-1">
              {aiData.socialSentiment.trendingTopics.map((topic, i) => (
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
            <span>Analyse du Marché des Paris</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-green-50">
              <p className="text-xs text-muted-foreground">Victoire {teamA}</p>
              <p className="font-bold text-lg text-green-700">{aiData.bettingTrends.odds.home}</p>
              <p className="text-xs text-green-600">
                {((1/aiData.bettingTrends.odds.home) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-2 rounded bg-yellow-50">
              <p className="text-xs text-muted-foreground">Match nul</p>
              <p className="font-bold text-lg text-yellow-700">{aiData.bettingTrends.odds.draw}</p>
              <p className="text-xs text-yellow-600">
                {((1/aiData.bettingTrends.odds.draw) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="p-2 rounded bg-blue-50">
              <p className="text-xs text-muted-foreground">Victoire {teamB}</p>
              <p className="font-bold text-lg text-blue-700">{aiData.bettingTrends.odds.away}</p>
              <p className="text-xs text-blue-600">
                {((1/aiData.bettingTrends.odds.away) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">🔥 Paris populaires du public:</p>
            <div className="space-y-1">
              {aiData.bettingTrends.popularBets.map((bet, i) => (
                <p key={i} className="text-xs bg-amber-50 p-2 rounded flex items-center">
                  <span className="mr-2">#{i+1}</span>
                  {bet}
                </p>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
            <span>📊 Volume de paris:</span>
            <Badge 
              variant={aiData.bettingTrends.volume === 'high' ? 'default' : 
                      aiData.bettingTrends.volume === 'medium' ? 'secondary' : 'outline'}
              className="capitalize"
            >
              {aiData.bettingTrends.volume}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Conditions du match */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Cloud className="h-4 w-4 text-sky-600" />
            <span>Conditions & Contexte</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-sky-50 rounded">
              <p className="text-xs text-muted-foreground">☁️ Météo</p>
              <p className="font-medium text-sm">{aiData.matchPreview.weather}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-xs text-muted-foreground">🏟️ Stade</p>
              <p className="font-medium text-sm">{aiData.matchPreview.venue}</p>
            </div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <p className="text-xs text-muted-foreground">⚡ Importance du match</p>
            <Badge 
              variant={aiData.matchPreview.importance === 'high' ? 'default' : 
                      aiData.matchPreview.importance === 'medium' ? 'secondary' : 'outline'}
              className="mt-1 capitalize"
            >
              {aiData.matchPreview.importance}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-2">🔍 Sources de données publiques IA:</p>
          <div className="flex flex-wrap gap-1">
            {aiData.sources.map((source, i) => (
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

export default AIAnalysis;
