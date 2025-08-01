import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';
import ClientProfileTable from './profile-table-client';

export default function ProfilesPage() {
  return (
    <div>
      <PageHeader
        title="Gerenciamento de Perfis"
        description="Crie, organize e inicie seus perfis de navegador isolados."
      />
      <Card className="bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Seus Perfis</CardTitle>
          <CardDescription>
            Cada perfil simula um dispositivo único com sua própria impressão digital e armazenamento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Carregando perfis...</div>}>
            <ClientProfileTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
