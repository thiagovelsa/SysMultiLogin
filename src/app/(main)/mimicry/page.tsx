import { PageHeader } from '@/components/layout/page-header';
import { BehaviorForm } from '@/components/mimicry/behavior-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MimicryPage() {
  return (
    <div>
      <PageHeader
        title="Simulação Comportamental"
        description="Gere scripts de automação que simulam a interação humana."
      />
      <Card className="bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Gerador de Script com IA</CardTitle>
          <CardDescription>
            Descreva a tarefa que você deseja automatizar e nossa IA gerará um script Puppeteer com atrasos e movimentos de mouse realistas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BehaviorForm />
        </CardContent>
      </Card>
    </div>
  );
}
