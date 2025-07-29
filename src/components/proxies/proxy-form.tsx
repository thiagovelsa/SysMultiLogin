'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Proxy } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { useEffect } from 'react';

const proxySchema = z.object({
  alias: z.string().min(1, 'Apelido é obrigatório'),
  type: z.enum(['http', 'socks5'], { required_error: 'O tipo de proxy é obrigatório' }),
  host: z.string().min(1, 'Host é obrigatório'),
  port: z.coerce.number().min(1, 'Porta é obrigatória'),
  username: z.string().optional(),
  password: z.string().optional(),
});

type ProxyFormValues = z.infer<typeof proxySchema>;

interface ProxyFormProps {
  proxy?: Proxy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProxyForm({ proxy, open, onOpenChange }: ProxyFormProps) {
  const { toast } = useToast();
  const [proxies, setProxies] = useLocalStorage<Proxy[]>('proxies', []);
  const form = useForm<ProxyFormValues>({
    resolver: zodResolver(proxySchema),
    defaultValues: {
      alias: '',
      type: 'http',
      host: '',
      port: undefined,
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    if (proxy) {
      form.reset({
        alias: proxy.alias || '',
        type: proxy.type || 'http',
        host: proxy.host || '',
        port: proxy.port || undefined,
        username: proxy.username || '',
        password: proxy.password || '',
      });
    } else {
      form.reset({
        alias: '',
        type: 'http',
        host: '',
        port: undefined,
        username: '',
        password: '',
      });
    }
  }, [proxy, form, open]);


  const onSubmit = (data: ProxyFormValues) => {
    try {
      if(proxy) {
          // Editing existing proxy
          const updatedProxies = proxies.map(p => p.id === proxy.id ? { ...p, ...data } : p);
          setProxies(updatedProxies);
          toast({
              title: 'Proxy Atualizado',
              description: 'Sua configuração de proxy foi atualizada com sucesso.',
          });
      } else {
          // Creating new proxy
          const newProxy: Proxy = {
            id: crypto.randomUUID(),
            alias: data.alias,
            type: data.type,
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password,
            status: 'inactive', // Default status for new proxies
          };
          setProxies([...proxies, newProxy]);
          toast({
            title: 'Proxy Salvo',
            description: 'Sua configuração de proxy foi salva com sucesso.',
          });
      }
      onOpenChange(false);
    } catch(e) {
       toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o proxy.',
      });
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData('text').trim();
    // Support multiple lines
    const lines = pastedText.split(/\r?\n/);
    if (lines.length > 1) {
       toast({
          title: 'Adição em Massa em Progresso',
          description: `Tentando adicionar ${lines.length} proxies.`,
        });
       const newProxies: Proxy[] = [];
       lines.forEach((line) => {
         try {
           const [host, port, username, password] = line.split(':');
           if(host && port) {
             const newProxy: Proxy = {
                id: crypto.randomUUID(),
                alias: `Proxy Colado #${proxies.length + newProxies.length + 1}`,
                type: 'http', // assumption
                host,
                port: parseInt(port, 10),
                username,
                password,
                status: 'inactive',
             };
             if (!isNaN(newProxy.port)) {
                newProxies.push(newProxy);
             }
           }
         } catch (e) {
            // ignore lines that fail to parse
         }
       });
       if(newProxies.length > 0) {
         setProxies([...proxies, ...newProxies]);
         toast({
            title: 'Proxies Adicionados',
            description: `${newProxies.length} proxies foram adicionados com sucesso.`
         })
       }
       onOpenChange(false);
    } else {
        // Example format: host:port:username:password
        const parts = pastedText.split(':');
        if (parts.length >= 2) {
            try {
                const [host, port, username, password] = parts;
                form.setValue('host', host);
                form.setValue('port', parseInt(port, 10));
                if (username) form.setValue('username', username);
                if (password) form.setValue('password', password);
                if(!form.getValues('alias')){
                    form.setValue('alias', `Proxy ${host}`)
                }
                toast({
                    title: 'Preenchido Automaticamente',
                    description: 'Os detalhes do proxy foram preenchidos a partir do texto colado.',
                });
            } catch (e) {
                // Ignore parse errors, let the user input manually
            }
        }
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{proxy ? 'Editar Proxy' : 'Adicionar Novo Proxy'}</DialogTitle>
          <DialogDescription>
            {proxy ? 'Atualize os detalhes da sua conexão de proxy.' : 'Adicione uma nova conexão de proxy para usar com seus perfis.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
             <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apelido</FormLabel>
                  <FormControl>
                    <Input placeholder="ex. Meu Proxy de Casa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Proxy</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo de conexão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="http">HTTP</SelectItem>
                      <SelectItem value="socks5">SOCKS5</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
                <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                    <FormItem className="col-span-2">
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                        <Input placeholder="123.123.123.123" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Porta</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="8080" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Usuário do proxy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Senha do proxy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            {!proxy && (
              <FormItem>
                  <FormLabel>Ou Cole os Proxies</FormLabel>
                  <FormControl>
                      <Textarea
                          placeholder="host:porta:usuario:senha (um por linha para adição em massa)"
                          className="min-h-[100px] resize-y"
                          onPaste={handlePaste}
                      />
                  </FormControl>
                  <FormDescription>
                      Você pode colar um ou vários proxies de uma vez.
                  </FormDescription>
                  <FormMessage />
              </FormItem>
            )}


            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{proxy ? 'Salvar Alterações' : 'Salvar Proxy'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
