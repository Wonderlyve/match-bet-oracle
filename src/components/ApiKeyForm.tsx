
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { setApiKey, getApiKey, resetApiKeyToDefault } from '@/services/footballApi';

interface ApiKeyFormProps {
  onSaved: () => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSaved }) => {
  const [apiKey, setApiKeyState] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = getApiKey();
    if (savedKey) {
      setApiKeyState(savedKey);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une clé API valide",
        variant: "destructive"
      });
      return;
    }

    setApiKey(apiKey.trim());
    
    toast({
      title: "Clé API sauvegardée",
      description: "Votre clé API a été enregistrée avec succès"
    });
    
    onSaved();
  };

  const handleUseDefault = () => {
    resetApiKeyToDefault();
    setApiKeyState(getApiKey());
    
    toast({
      title: "Clé API par défaut",
      description: "La clé API par défaut a été configurée"
    });
    
    onSaved();
  };

  return (
    <Card className="gradient-card shadow-lg border-0 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center text-gradient">
          📊 Configuration API
        </CardTitle>
        <CardDescription className="text-center">
          Entrez votre clé API-Football (RapidAPI) pour accéder aux données réelles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="block text-sm font-medium">
              Clé API
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Votre clé API-Football"
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              className="h-12 text-base border-2 focus:border-sport-primary transition-colors"
            />
            <p className="text-xs text-muted-foreground">
              Inscrivez-vous sur <a href="https://rapidapi.com/api-sports/api/api-football/" target="_blank" rel="noopener noreferrer" className="underline">RapidAPI</a> pour obtenir une clé
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Sauvegarder la clé API
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              onClick={handleUseDefault}
              className="w-full"
            >
              Utiliser la clé par défaut
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApiKeyForm;
