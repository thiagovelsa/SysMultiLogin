'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FingerprintData {
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  hardwareConcurrency: number;
  deviceMemory?: number;
  webglVendor: string;
  webglRenderer: string;
  canvasFingerprint: string;
  fonts: string[];
  plugins: string[];
}

export default function FingerprintTestPage() {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const detectFingerprint = async () => {
    setIsLoading(true);
    try {
      // Simular detecção de fingerprint do navegador atual
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('Fingerprint Test', 10, 10);
      const canvasFingerprint = canvas.toDataURL();

      const webgl = document.createElement('canvas').getContext('webgl');
      const debugInfo = webgl?.getExtension('WEBGL_debug_renderer_info');

      const data: FingerprintData = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
        webglVendor: debugInfo ? webgl?.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'N/A',
        webglRenderer: debugInfo ? webgl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'N/A',
        canvasFingerprint: canvasFingerprint.substring(0, 50) + '...',
        fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New'], // Simplificado
        plugins: Array.from(navigator.plugins).map(p => p.name)
      };

      setFingerprint(data);
      toast({
        title: 'Fingerprint Detectado',
        description: 'Impressão digital do navegador atual foi capturada com sucesso.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível detectar a impressão digital.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openTestSites = () => {
    const testSites = [
      'https://www.whatismybrowser.com/detect/what-is-my-user-agent/',
      'https://browserleaks.com/webgl',
      'https://fingerprintjs.github.io/fingerprintjs/',
      'https://amiunique.org/fp'
    ];

    testSites.forEach(url => {
      window.open(url, '_blank');
    });

    toast({
      title: 'Sites de Teste Abertos',
      description: 'Várias abas foram abertas para testar sua impressão digital.',
    });
  };

  const getConsistencyScore = () => {
    if (!fingerprint) return 0;
    
    let score = 100;
    
    // Verificações de consistência
    if (fingerprint.platform.includes('Win') && !fingerprint.userAgent.includes('Windows')) {
      score -= 20;
    }
    if (fingerprint.platform.includes('Mac') && !fingerprint.userAgent.includes('Macintosh')) {
      score -= 20;
    }
    if (fingerprint.hardwareConcurrency < 2 || fingerprint.hardwareConcurrency > 32) {
      score -= 10;
    }
    if (fingerprint.colorDepth !== 24 && fingerprint.colorDepth !== 32) {
      score -= 5;
    }

    return Math.max(score, 0);
  };

  const consistencyScore = getConsistencyScore();

  return (
    <div>
      <PageHeader
        title="Teste de Impressão Digital"
        description="Analise e valide a impressão digital do seu navegador atual."
      />

      <div className="grid gap-6">
        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle>Detectar Impressão Digital</CardTitle>
            <CardDescription>
              Capture a impressão digital do navegador atual para análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={detectFingerprint} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isLoading ? 'Detectando...' : 'Detectar Fingerprint'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={openTestSites}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir Sites de Teste
              </Button>
            </div>

            {fingerprint && (
              <div className="flex items-center gap-2">
                {consistencyScore >= 80 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm font-medium">
                  Score de Consistência: {consistencyScore}%
                </span>
                <Badge variant={consistencyScore >= 80 ? 'default' : 'secondary'}>
                  {consistencyScore >= 80 ? 'Consistente' : 'Inconsistente'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resultados */}
        {fingerprint && (
          <Card>
            <CardHeader>
              <CardTitle>Dados da Impressão Digital</CardTitle>
              <CardDescription>
                Informações capturadas do navegador atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="font-semibold mb-3">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">User Agent:</span>
                    <p className="text-muted-foreground break-all">{fingerprint.userAgent}</p>
                  </div>
                  <div>
                    <span className="font-medium">Plataforma:</span>
                    <p className="text-muted-foreground">{fingerprint.platform}</p>
                  </div>
                  <div>
                    <span className="font-medium">Idioma:</span>
                    <p className="text-muted-foreground">{fingerprint.language}</p>
                  </div>
                  <div>
                    <span className="font-medium">Fuso Horário:</span>
                    <p className="text-muted-foreground">{fingerprint.timezone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Hardware */}
              <div>
                <h3 className="font-semibold mb-3">Hardware</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Resolução:</span>
                    <p className="text-muted-foreground">{fingerprint.screenResolution}</p>
                  </div>
                  <div>
                    <span className="font-medium">Cores:</span>
                    <p className="text-muted-foreground">{fingerprint.colorDepth}-bit</p>
                  </div>
                  <div>
                    <span className="font-medium">CPU Cores:</span>
                    <p className="text-muted-foreground">{fingerprint.hardwareConcurrency}</p>
                  </div>
                  {fingerprint.deviceMemory && (
                    <div>
                      <span className="font-medium">Memória:</span>
                      <p className="text-muted-foreground">{fingerprint.deviceMemory}GB</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* WebGL */}
              <div>
                <h3 className="font-semibold mb-3">WebGL</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Vendor:</span>
                    <p className="text-muted-foreground">{fingerprint.webglVendor}</p>
                  </div>
                  <div>
                    <span className="font-medium">Renderer:</span>
                    <p className="text-muted-foreground">{fingerprint.webglRenderer}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Canvas */}
              <div>
                <h3 className="font-semibold mb-3">Canvas Fingerprint</h3>
                <p className="text-sm text-muted-foreground break-all">
                  {fingerprint.canvasFingerprint}
                </p>
              </div>

              <Separator />

              {/* Plugins */}
              <div>
                <h3 className="font-semibold mb-3">Plugins ({fingerprint.plugins.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {fingerprint.plugins.slice(0, 10).map((plugin, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {plugin}
                    </Badge>
                  ))}
                  {fingerprint.plugins.length > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{fingerprint.plugins.length - 10} mais
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dicas */}
        <Card>
          <CardHeader>
            <CardTitle>Sites Recomendados para Teste</CardTitle>
            <CardDescription>
              Use estes sites para validar suas impressões digitais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">User Agent & Básicos</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• whatismybrowser.com</li>
                  <li>• useragentstring.com</li>
                  <li>• httpbin.org/user-agent</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Fingerprint Avançado</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• browserleaks.com</li>
                  <li>• fingerprintjs.com</li>
                  <li>• amiunique.org</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}