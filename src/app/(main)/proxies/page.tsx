import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProxyTable } from '@/components/proxies/proxy-table';

export default function ProxiesPage() {
  return (
    <div>
      <PageHeader
        title="Gerenciamento de Proxy"
        description="Gerencie e teste suas conexões de proxy para roteamento seguro."
      />
      <Card className="bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Seus Proxies</CardTitle>
          <CardDescription>
            Este é o seu banco de dados de proxies disponíveis para a criação de perfis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProxyTable />
        </CardContent>
      </Card>
    </div>
  );
}
