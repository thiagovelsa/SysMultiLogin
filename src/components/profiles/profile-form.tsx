'use client';

import { useEffect } from 'react';
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

const profileSchema = z.object({
  name: z.string().min(3, { message: 'O nome do perfil deve ter pelo menos 3 caracteres.' }),
  os: z.enum(['windows', 'macos', 'linux'], { required_error: 'Sistema operacional é obrigatório.' }),
  browser: z.enum(['chrome', 'firefox', 'safari'], { required_error: 'Navegador é obrigatório.' }),
  proxyId: z.string().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile?: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultFormValues: ProfileFormValues = {
  name: '',
  os: 'windows',
  browser: 'chrome',
  proxyId: null,
};

export function ProfileForm({ profile, open, onOpenChange }: ProfileFormProps) {
  const { toast } = useToast();
  const [profiles, setProfiles] = useLocalStorage<Profile[]>('profiles', []);
  const [proxies] = useLocalStorage<Proxy[]>('proxies', []);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (open) {
      if (profile) {
        form.reset({
            name: profile.name,
            os: profile.os,
            browser: profile.browser,
            proxyId: profile.proxyId || null,
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
    } catch (error) {
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
                        </Trigger>
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
                        </Trigger>
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
                        </Trigger>
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
