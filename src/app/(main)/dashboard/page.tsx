'use client';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Profile, Proxy } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Users, Server, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const [profiles] = useLocalStorage<Profile[]>('profiles', []);
  const [proxies] = useLocalStorage<Proxy[]>('proxies', []);

  const activeProfilesCount = profiles.length;
  const healthyProxiesCount = proxies.filter(p => p.status === 'active').length;
  const totalProxiesCount = proxies.length;
  
  return (
    <div>
      <PageHeader
        title="Painel"
        description="Seu centro de comando para operações de navegação segura."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Perfis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProfilesCount}</div>
            <p className="text-xs text-muted-foreground">Perfis de navegador configurados</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saúde dos Proxies</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyProxiesCount} / {totalProxiesCount}</div>
            <p className="text-xs text-muted-foreground">Conexões de proxy saudáveis e ativas</p>
          </CardContent>
        </Card>
      </div>
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500/70" />
            <h3 className="mt-6 text-xl font-semibold">Todos os Sistemas Operacionais</h3>
            <p className="mt-2 text-md text-muted-foreground">
                Seu ambiente está pronto. Crie ou inicie um perfil para começar.
            </p>
        </div>
    </div>
  );
}
