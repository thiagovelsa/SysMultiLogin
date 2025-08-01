'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { Profile, Proxy } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, RefreshCw } from 'lucide-react';

const fingerprintSchema = z.object({
  webgl: z.string().optional(),
  canvas: z.string().optional(),
  fonts: z.string().optional(),
  hardwareConcurrency: z.string().optional(),
  deviceMemory: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  platform: z.string().optional(),
  userAgent: z.string().optional(),
  screenWidth: z.string().optional(),
  screenHeight: z.string().optional(),
  colorDepth: z.string().optional(),
  audioContext: z.string().optional(),
  plugins: z.string().optional(),
});

const profileSchema = z.object({
  name: z.string().min(3, { message: 'O nome do perfil deve ter pelo menos 3 caracteres.' }),
  os: z.enum(['windows', 'macos', 'linux'], { required_error: 'Sistema operacional é obrigatório.' }),
  browser: z.enum(['chrome', 'firefox', 'safari'], { required_error: 'Navegador é obrigatório.' }),
  proxyId: z.string().nullable(),
  fingerprint: fingerprintSchema.optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const defaultFingerprint = {
  webgl: '',
  canvas: '',
  fonts: '',
  hardwareConcurrency: '',
  deviceMemory: '',
  timezone: '',
  language: '',
  platform: '',
  userAgent: '',
  screenWidth: '',
  screenHeight: '',
  colorDepth: '',
  audioContext: '',
  plugins: '',
};

const defaultFormValues: ProfileFormValues = {
  name: '',
  os: 'windows',
  browser: 'chrome',
  proxyId: null,
  fingerprint: defaultFingerprint,
};

interface ProfileFormProps {
  profile?: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
}

export function ProfileForm({ profile, open, onOpenChange, profiles, setProfiles }: ProfileFormProps) {
  const { toast } = useToast();
  const [proxies] = useLocalStorage<Proxy[]>('proxies', []);
  const [isGeneratingFingerprint, setIsGeneratingFingerprint] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultFormValues,
  });

  const generateFingerprint = async () => {
    const os = form.getValues('os');
    const browser = form.getValues('browser');
    
    if (!os || !browser) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Selecione o sistema operacional e navegador primeiro.',
      });
      return;
    }

    setIsGeneratingFingerprint(true);
    
    try {
      const response = await fetch('/api/generate-fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ os, browser }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar fingerprint');
      }

      const data = await response.json();
      const fingerprint = data.fingerprint;

      // Atualiza o formulário com o fingerprint gerado
      form.setValue('fingerprint', {
        userAgent: fingerprint.userAgent || '',
        screenWidth: fingerprint.screenWidth?.toString() || '',
        screenHeight: fingerprint.screenHeight?.toString() || '',
        colorDepth: fingerprint.colorDepth?.toString() || '',
        hardwareConcurrency: fingerprint.hardwareConcurrency?.toString() || '',
        deviceMemory: fingerprint.deviceMemory?.toString() || '',
        timezone: fingerprint.timezone || '',
        language: fingerprint.language || '',
        fonts: fingerprint.fonts || '',
        plugins: fingerprint.plugins || '',
        webgl: fingerprint.webgl || '',
        canvas: fingerprint.canvas || '',
        audioContext: fingerprint.audioContext || '',
        platform: os,
      });

      toast({
        title: 'Fingerprint Gerado',
        description: `Fingerprint compatível com ${os}/${browser} foi gerado automaticamente.`,
      });
    } catch {
        toast({
        variant: 'destructive',
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível gerar o fingerprint.',
      });
    } finally {
      setIsGeneratingFingerprint(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (profile) {
        form.reset({
            name: profile.name,
            os: profile.os,
            browser: profile.browser,
            proxyId: profile.proxyId || null,
            fingerprint: profile.fingerprint || defaultFingerprint,
        });
      } else {
        form.reset(defaultFormValues);
      }
    }
  }, [profile, open, form]);

  const onSubmit = (data: ProfileFormValues) => {
    try {
      if (profile) {
        const updatedProfiles = profiles.map(p =>
          p.id === profile.id ? { ...profile, ...data } : p
        );
        setProfiles(updatedProfiles);
        toast({
          title: 'Perfil Atualizado',
          description: `O perfil "${data.name}" foi atualizado com sucesso.`,
        });
      } else {
        const newProfile: Profile = {
          id: crypto.randomUUID(),
          ...data,
          status: 'Pronto',
          coherenceScore: Math.floor(Math.random() * (95 - 75 + 1)) + 75,
        };
        setProfiles([...profiles, newProfile]);
        toast({
          title: 'Perfil Criado',
          description: `O perfil "${data.name}" foi criado com sucesso.`,
        });
      }
      onOpenChange(false);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o perfil.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{profile ? 'Editar Perfil' : 'Criar Novo Perfil'}</DialogTitle>
          <DialogDescription>
            Configure os detalhes do seu perfil de navegador isolado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Perfil</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Perfil de Trabalho" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="os"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sistema Operacional</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um SO" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="windows">Windows</SelectItem>
                        <SelectItem value="macos">macOS</SelectItem>
                        <SelectItem value="linux">Linux</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="browser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navegador</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um navegador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="chrome">Chrome</SelectItem>
                        <SelectItem value="firefox">Firefox</SelectItem>
                        <SelectItem value="safari">Safari</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="proxyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proxy (Opcional)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um proxy para vincular" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {proxies.filter(p => p.status === 'active').map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.alias}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   <FormDescription>
                      Vincule um proxy a este perfil para rotear o tráfego. Apenas proxies ativos são listados.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seção de Fingerprint */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Impressão Digital</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure ou gere automaticamente a impressão digital do navegador
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateFingerprint}
                  disabled={isGeneratingFingerprint}
                  className="flex items-center gap-2"
                >
                  {isGeneratingFingerprint ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {isGeneratingFingerprint ? 'Gerando...' : 'Gerar Automaticamente'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fingerprint.userAgent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Agent</FormLabel>
                      <FormControl>
                        <Input placeholder="Mozilla/5.0..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fingerprint.platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plataforma</FormLabel>
                      <FormControl>
                        <Input placeholder="Win32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="fingerprint.screenWidth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largura da Tela</FormLabel>
                      <FormControl>
                        <Input placeholder="1920" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fingerprint.screenHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altura da Tela</FormLabel>
                      <FormControl>
                        <Input placeholder="1080" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fingerprint.colorDepth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profundidade de Cor</FormLabel>
                      <FormControl>
                        <Input placeholder="24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fingerprint.timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuso Horário</FormLabel>
                      <FormControl>
                        <Input placeholder="America/Sao_Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fingerprint.language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma</FormLabel>
                      <FormControl>
                        <Input placeholder="pt-BR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{profile ? 'Salvar Alterações' : 'Criar Perfil'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}