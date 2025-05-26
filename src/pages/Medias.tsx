
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { collectSocialPredictions, SocialPrediction } from '@/services/socialPredictionsService';
import { collectExternalPredictions, ExternalPrediction } from '@/services/externalPredictionsService';
import { 
  Loader2, MessageCircle, Twitter, Users, TrendingUp, 
  Hash, Heart, Share2, Eye, Calendar, Globe, Filter
} from 'lucide-react';

interface SocialPost {
  id: string;
  platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'reddit';
  author: string;
  content: string;
  prediction?: string;
  confidence?: number;
  likes: number;
  shares: number;
  views: number;
  timestamp: string;
  hashtags: string[];
  engagement: number;
  verified: boolean;
}

const Medias = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [socialPredictions, setSocialPredictions] = useState<SocialPrediction[]>([]);
  const [externalPredictions, setExternalPredictions] = useState<ExternalPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const { toast } = useToast();

  const platforms = [
    { id: 'all', name: 'Tous', icon: Globe },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'instagram', name: 'Instagram', icon: MessageCircle },
    { id: 'tiktok', name: 'TikTok', icon: Hash },
    { id: 'youtube', name: 'YouTube', icon: Eye },
    { id: 'reddit', name: 'Reddit', icon: Users }
  ];

  const popularMatches = [
    'PSG vs Marseille',
    'Real Madrid vs Barcelona',
    'Manchester City vs Liverpool',
    'Bayern Munich vs Dortmund',
    'Juventus vs AC Milan'
  ];

  useEffect(() => {
    loadSocialContent();
  }, []);

  const loadSocialContent = async () => {
    setIsLoading(true);
    
    try {
      console.log('📱 Chargement contenu social...');
      
      // Génération de posts sociaux réalistes
      const generatedPosts = generateSocialPosts();
      setPosts(generatedPosts);
      
      // Collecte des prédictions sociales
      const socialPreds = await collectSocialPredictions('Équipe A', 'Équipe B');
      setSocialPredictions(socialPreds);
      
      // Collecte des prédictions externes
      const externalPreds = await collectExternalPredictions('Équipe A', 'Équipe B');
      setExternalPredictions(externalPreds);
      
      toast({
        title: "📱 Médias chargés",
        description: `${generatedPosts.length} publications et ${socialPreds.length + externalPreds.length} prédictions collectées`,
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement médias:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger le contenu social",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSpecificMatch = async (match: string) => {
    setIsLoading(true);
    setSelectedMatch(match);
    
    try {
      const [teamA, teamB] = match.split(' vs ');
      
      // Collecte spécifique pour ce match
      const [socialPreds, externalPreds] = await Promise.all([
        collectSocialPredictions(teamA, teamB),
        collectExternalPredictions(teamA, teamB)
      ]);
      
      setSocialPredictions(socialPreds);
      setExternalPredictions(externalPreds);
      
      // Générer des posts spécifiques à ce match
      const matchPosts = generateMatchSpecificPosts(match);
      setPosts(matchPosts);
      
      toast({
        title: `📊 Analyse ${match}`,
        description: `${socialPreds.length + externalPreds.length} prédictions collectées pour ce match`,
      });
      
    } catch (error) {
      console.error('❌ Erreur analyse match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSocialPosts = (): SocialPost[] => {
    const posts: SocialPost[] = [];
    const authors = [
      'PronosFootball', 'BetExpert_FR', 'FootballTips', 'StatsMaster', 'BettingGuru',
      'LeFoot_Analytics', 'PronoKing', 'FootData', 'BetSmart_FR', 'TipsFootball'
    ];
    
    const templates = [
      "🔥 {match} - {prediction} à {odds} ! Confiance {confidence}% #FootballBetting",
      "📊 Analyse {match}: {prediction} selon mes calculs. Value bet détectée ! #Pronostics",
      "⚽ {match} - Mon prono: {prediction}. Statistiques très favorables ! #Football",
      "🎯 {match}: {prediction} ({odds}). Forme récente excellente ! #BettingTips",
      "💡 {match} - {prediction} conseillé. ROI attendu: +12% #ValueBet",
      "🔥 PICK DU JOUR: {match} - {prediction} !!! Ne ratez pas ça ! #Pronostics"
    ];
    
    for (let i = 0; i < 25; i++) {
      const author = authors[Math.floor(Math.random() * authors.length)];
      const template = templates[Math.floor(Math.random() * templates.length)];
      const match = popularMatches[Math.floor(Math.random() * popularMatches.length)];
      const predictions = ['Victoire domicile', 'Plus de 2.5 buts', 'BTTS Oui', 'Victoire extérieur'];
      const prediction = predictions[Math.floor(Math.random() * predictions.length)];
      const odds = (1.5 + Math.random() * 2).toFixed(2);
      const confidence = Math.floor(Math.random() * 30) + 65;
      
      const content = template
        .replace('{match}', match)
        .replace('{prediction}', prediction)
        .replace('{odds}', odds)
        .replace('{confidence}', confidence.toString());
      
      posts.push({
        id: `post_${i}`,
        platform: ['twitter', 'instagram', 'tiktok', 'youtube', 'reddit'][Math.floor(Math.random() * 5)] as any,
        author,
        content,
        prediction,
        confidence,
        likes: Math.floor(Math.random() * 500) + 20,
        shares: Math.floor(Math.random() * 100) + 5,
        views: Math.floor(Math.random() * 2000) + 100,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        hashtags: extractHashtags(content),
        engagement: Math.random() * 10 + 2,
        verified: Math.random() > 0.7
      });
    }
    
    return posts.sort((a, b) => b.engagement - a.engagement);
  };

  const generateMatchSpecificPosts = (match: string): SocialPost[] => {
    const posts: SocialPost[] = [];
    const specificTemplates = [
      `🔥 ${match} DEMAIN ! Mon analyse complète en story ! #${match.replace(' vs ', 'vs').replace(/\s/g, '')}`,
      `📊 STATS ${match}: Historique, forme, blessures... Thread complet ⬇️ #Football`,
      `⚡ ${match} - LIVE PREDICTION dans 30min sur ma chaîne ! #Pronostics`,
      `🎯 ${match}: 3 PARIS SÛRS selon mon modèle IA ! 🤖 #BettingTips`,
      `🔴 ALERTE ${match} ! Cote sous-évaluée détectée ! #ValueBet`
    ];
    
    specificTemplates.forEach((template, index) => {
      posts.push({
        id: `match_post_${index}`,
        platform: ['twitter', 'instagram', 'youtube'][Math.floor(Math.random() * 3)] as any,
        author: `Expert_${match.split(' ')[0]}`,
        content: template,
        likes: Math.floor(Math.random() * 800) + 100,
        shares: Math.floor(Math.random() * 200) + 20,
        views: Math.floor(Math.random() * 5000) + 500,
        timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
        hashtags: extractHashtags(template),
        engagement: Math.random() * 15 + 5,
        verified: index < 2
      });
    });
    
    return posts;
  };

  const extractHashtags = (content: string): string[] => {
    const hashtags = content.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.substring(1));
  };

  const getPlatformIcon = (platform: string) => {
    const icons = {
      twitter: Twitter,
      instagram: MessageCircle,
      tiktok: Hash,
      youtube: Eye,
      reddit: Users
    };
    return icons[platform as keyof typeof icons] || MessageCircle;
  };

  const filteredPosts = selectedPlatform === 'all' 
    ? posts 
    : posts.filter(post => post.platform === selectedPlatform);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gradient">
            📱 Médias & Réseaux
          </h1>
          <p className="text-muted-foreground">
            Prédictions et tendances des réseaux sociaux en temps réel
          </p>
        </div>

        {/* Filtres */}
        <Card className="gradient-card border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 mr-2 text-sport-primary" />
              Filtres et analyses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plateformes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Plateformes</label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Button
                      key={platform.id}
                      variant={selectedPlatform === platform.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPlatform(platform.id)}
                      className="text-xs"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {platform.name}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Matchs populaires */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Analyser un match spécifique</label>
              <div className="flex flex-wrap gap-2">
                {popularMatches.map((match) => (
                  <Button
                    key={match}
                    variant={selectedMatch === match ? "default" : "outline"}
                    size="sm"
                    onClick={() => analyzeSpecificMatch(match)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {match}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={loadSocialContent}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                'Actualiser le contenu'
              )}
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Publications</TabsTrigger>
            <TabsTrigger value="social">Prédictions Sociales</TabsTrigger>
            <TabsTrigger value="pro">Prédictions Pro</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <div className="grid gap-4">
              {filteredPosts.map((post) => {
                const PlatformIcon = getPlatformIcon(post.platform);
                return (
                  <Card key={post.id} className="gradient-card border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <PlatformIcon className="h-4 w-4 text-sport-primary" />
                          <span className="font-semibold text-sm">{post.author}</span>
                          {post.verified && <span className="text-blue-500">✓</span>}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      
                      <p className="text-sm mb-3 leading-relaxed">{post.content}</p>
                      
                      {post.prediction && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                          <div className="text-xs font-medium text-blue-700">
                            Prédiction: {post.prediction}
                            {post.confidence && ` (${post.confidence}% confiance)`}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{formatNumber(post.likes)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="h-3 w-3" />
                            <span>{formatNumber(post.shares)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatNumber(post.views)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{post.engagement.toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.hashtags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid gap-4">
              {socialPredictions.map((pred, index) => (
                <Card key={index} className="gradient-card border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{pred.prediction}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {pred.platform}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{pred.reasoning}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>Popularité: {pred.popularity}%</span>
                      <span>Mentions: {pred.mentions}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pro" className="space-y-4">
            <div className="grid gap-4">
              {externalPredictions.map((pred, index) => (
                <Card key={index} className="gradient-card border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{pred.prediction}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {pred.site}
                        </span>
                        <span className="text-xs font-bold">{pred.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{pred.reasoning}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>Source: {pred.source}</span>
                      {pred.odds && <span className="font-medium">Cote: {pred.odds}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Statistiques globales */}
        <Card className="gradient-card border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2 text-sport-primary" />
              Statistiques globales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
                <div className="text-xs text-muted-foreground">Publications</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{socialPredictions.length}</div>
                <div className="text-xs text-muted-foreground">Prédictions sociales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{externalPredictions.length}</div>
                <div className="text-xs text-muted-foreground">Prédictions pro</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {posts.reduce((sum, p) => sum + p.engagement, 0).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Engagement moyen</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Medias;
