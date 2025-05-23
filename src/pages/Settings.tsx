
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiKeyForm from '@/components/ApiKeyForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { clearTickets } from '@/services/storage';
import { Trash2, Key, Info } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();

  const handleClearAllData = () => {
    clearTickets();
    toast({
      title: "Données effacées",
      description: "Toutes les analyses ont été supprimées",
    });
  };

  const handleApiSaved = () => {
    toast({
      title: "Configuration sauvegardée",
      description: "Votre clé API a été mise à jour",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gradient">
            ⚙️ Paramètres
          </h1>
          <p className="text-muted-foreground">
            Configuration et gestion des données
          </p>
        </div>

        {/* Configuration API */}
        <Card className="gradient-card border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Key className="h-5 w-5 mr-2 text-sport-primary" />
              Configuration API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApiKeyForm onSaved={handleApiSaved} />
          </CardContent>
        </Card>

        {/* Gestion des données */}
        <Card className="gradient-card border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Trash2 className="h-5 w-5 mr-2 text-sport-danger" />
              Gestion des données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Supprimez toutes vos analyses et recommencez à zéro.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleClearAllData}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer toutes les données
            </Button>
          </CardContent>
        </Card>

        {/* Informations */}
        <Card className="gradient-card border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Info className="h-5 w-5 mr-2 text-sport-secondary" />
              À propos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API</span>
                <span className="font-medium">API-Football</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stockage</span>
                <span className="font-medium">Local</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-muted-foreground text-center">
                🤖 Analyses alimentées par l'intelligence artificielle<br/>
                📊 Données sportives en temps réel
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
