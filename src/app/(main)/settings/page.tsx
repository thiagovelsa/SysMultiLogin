import { PageHeader } from '@/components/layout/page-header';
import { SettingsForm } from '@/components/settings/settings-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Personalize sua aplicação e gerencie seus dados."
      />
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Configuração</CardTitle>
            <CardDescription>
              Ajuste as configurações da aplicação para se adequar ao seu fluxo de trabalho.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
