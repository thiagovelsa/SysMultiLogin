'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, PlugZap, CheckCircle, XCircle, AlertCircle, Loader2, PlusCircle } from 'lucide-react';
import type { Proxy } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProxyForm } from './proxy-form';

const statusConfig: Record<Proxy['status'], { text: string; icon: React.ReactNode; color: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { text: 'Ativo', icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-400', badgeVariant: 'outline' },
  inactive: { text: 'Inativo', icon: <XCircle className="h-4 w-4" />, color: 'text-gray-400', badgeVariant: 'secondary' },
  error: { text: 'Erro', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-400', badgeVariant: 'destructive' },
  testing: { text: 'Testando', icon: <Loader2 className="h-4 w-4 animate-spin" />, color: 'text-yellow-400', badgeVariant: 'outline' },
};

export function ProxyTable() {
  const [proxies, setProxies] = useLocalStorage<Proxy[]>('proxies', []);
  const { toast } = useToast();
  const [deletingProxy, setDeletingProxy] = useState<Proxy | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const isFormOpen = searchParams.has('new') || searchParams.has('edit');
  const editingProxyId = searchParams.get('edit');
  const editingProxy = editingProxyId ? proxies.find(p => p.id === editingProxyId) : undefined;

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      router.push('/proxies');
    }
  };

  const setProxyStatus = (id: string, status: Proxy['status']) => {
    setProxies(currentProxies => currentProxies.map(p => (p.id === id ? { ...p, status } : p)));
  };

  const handleTest = async (proxy: Proxy) => {
    setProxyStatus(proxy.id, 'testing');
    try {
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxy),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProxyStatus(proxy.id, 'active');
        toast({
          title: 'Proxy Ativo',
          description: `Conexão com ${proxy.alias} bem-sucedida! País: ${result.data.country}, IP: ${result.data.ip}`,
        });
      } else {
        setProxyStatus(proxy.id, 'error');
        toast({
          variant: 'destructive',
          title: 'Falha no Proxy',
          description: result.error || 'Não foi possível conectar ao proxy.',
        });
      }
    } catch (error) {
      setProxyStatus(proxy.id, 'error');
      toast({
        variant: 'destructive',
        title: 'Erro de Conexão',
        description: 'Ocorreu um erro ao tentar testar o proxy.',
      });
    }
  };

  const handleDelete = (id: string) => {
    setProxies(proxies.filter(p => p.id !== id));
    toast({
        title: 'Proxy Deletado',
        description: 'O proxy foi removido com sucesso.',
    });
    setDeletingProxy(null);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button asChild>
            <Link href="/proxies?new=true" prefetch={false}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Proxy
            </Link>
        </Button>
      </div>

      <ProxyForm
        key={editingProxyId}
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        proxy={editingProxy}
      />
      
      <AlertDialog open={!!deletingProxy} onOpenChange={(open) => !open && setDeletingProxy(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Isso irá deletar permanentemente o proxy
                <span className="font-bold"> {deletingProxy?.alias}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingProxy(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(deletingProxy!.id)}>Deletar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Apelido</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proxies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum proxy adicionado ainda.
                  </TableCell>
                </TableRow>
              )}
            {proxies.map((proxy: Proxy) => {
              const config = statusConfig[proxy.status];
              return (
                <TableRow key={proxy.id}>
                  <TableCell className="font-medium">{proxy.alias}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">{proxy.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{proxy.host}:{proxy.port}</TableCell>
                  <TableCell>
                    <Badge variant={config.badgeVariant} className={`flex items-center gap-1.5 w-24 justify-center ${config.color}`}>
                      {config.icon}
                      {config.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleTest(proxy)} disabled={proxy.status === 'testing'}>
                        {proxy.status === 'testing' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <PlugZap className="mr-2 h-4 w-4" />
                        )}
                        Testar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={proxy.status === 'testing'}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                             <Link href={`/proxies?edit=${proxy.id}`} prefetch={false} scroll={false}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => setDeletingProxy(proxy)}
                           >
                             <Trash2 className="mr-2 h-4 w-4" />
                             Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
