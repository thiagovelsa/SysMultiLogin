'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { HardDriveDownload, HardDriveUpload, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Profile, Proxy } from '@/lib/types';

const accentColors = [
  { name: 'Verde', value: '120 100% 50%' },
  { name: 'Azul', value: '224 64% 45%' },
  { name: 'Laranja', value: '25 95% 53%' },
  { name: 'Roxo', value: '262 85% 58%' },
  { name: 'Rosa', value: '340 90% 60%' },
];

export function SettingsForm() {
  const [activeAccent, setActiveAccent] = useState('120 100% 50%');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // On mount, get the current accent from CSS variables
    const rootStyle = getComputedStyle(document.documentElement);
    const accentValue = rootStyle.getPropertyValue('--accent').trim();
    if (accentValue) {
      setActiveAccent(accentValue);
    }
  }, []);

  const handleAccentChange = (value: string) => {
    setActiveAccent(value);
    document.documentElement.style.setProperty('--accent', value);
  };
  
  const handleBackup = () => {
    try {
        const profiles = localStorage.getItem('profiles') || '[]';
        const proxies = localStorage.getItem('proxies') || '[]';

        const backupData = {
            profiles: JSON.parse(profiles),
            proxies: JSON.parse(proxies),
            backupDate: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `privatesys-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
            title: "Backup Concluído",
            description: "Seus dados foram exportados com sucesso.",
        });
    } catch {
         toast({
            variant: 'destructive',
            title: "Erro no Backup",
            description: "Não foi possível fazer o backup dos seus dados.",
        });
    }
  }

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("O arquivo não pôde ser lido.");
            }
            const data = JSON.parse(text);

            if (data.profiles && Array.isArray(data.profiles) && data.proxies && Array.isArray(data.proxies)) {
                // Basic validation for profile and proxy structure
                const isValid = data.profiles.every((p: Profile) => p.id && p.name) && data.proxies.every((p: Proxy) => p.id && p.alias);

                if (!isValid) {
                    throw new Error("O arquivo de backup parece estar corrompido ou em um formato inválido.");
                }

                localStorage.setItem('profiles', JSON.stringify(data.profiles));
                localStorage.setItem('proxies', JSON.stringify(data.proxies));
                
                toast({
                    title: "Restauração Concluída",
                    description: "Seus dados foram restaurados com sucesso. A página será recarregada.",
                });

                // Reload to reflect changes everywhere
                setTimeout(() => window.location.reload(), 2000);

            } else {
                throw new Error("O arquivo de backup não contém os dados esperados.");
            }
        } catch (error) {
             const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido."
             toast({
                variant: 'destructive',
                title: "Erro na Restauração",
                description: message,
            });
        } finally {
            // Reset file input
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium font-headline">Aparência</h3>
        <p className="text-sm text-muted-foreground">Personalize a aparência da aplicação.</p>
        <Separator className="my-4" />
        <div className="space-y-4">
          <Label>Cor de Destaque</Label>
          <div className="flex flex-wrap gap-3">
            {accentColors.map(color => (
              <button
                key={color.name}
                onClick={() => handleAccentChange(color.value)}
                className="flex items-center gap-2 rounded-md border p-2 pr-3 transition-colors hover:bg-muted"
              >
                <div
                  className="h-6 w-6 rounded-md"
                  style={{ backgroundColor: `hsl(${color.value})` }}
                />
                <span className="text-sm">{color.name}</span>
                {activeAccent === color.value && <Check className="h-4 w-4 text-accent" />}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium font-headline">Gerenciamento de Dados</h3>
        <p className="text-sm text-muted-foreground">Faça backup de seus perfis e configurações ou restaure de um estado anterior.</p>
        <Separator className="my-4" />
        <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleBackup}>
                <HardDriveDownload className="mr-2 h-4 w-4" />
                Fazer Backup
            </Button>
            <Button variant="outline" onClick={handleRestoreClick}>
                <HardDriveUpload className="mr-2 h-4 w-4" />
                Restaurar Dados
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="application/json"
            />
        </div>
      </div>
    </div>
  );
}
