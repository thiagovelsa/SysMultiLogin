'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Rocket, Edit, Trash2, Laptop, Globe, Server, Loader2, PlusCircle, CircleDot } from 'lucide-react';
import type { Profile, Proxy } from '@/lib/types';
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
} from "@/components/ui/alert-dialog"
import { ProfileForm } from './profile-form';

const osIcons = {
  windows: <Laptop className="h-4 w-4" />,
  macos: <Laptop className="h-4 w-4" />,
  linux: <Laptop className="h-4 w-4" />,
};

const browserIcons = {
  chrome: <Globe className="h-4 w-4" />,
  firefox: <Globe className="h-4 w-4" />,
  safari: <Globe className="h-4 w-4" />,
};

export function ProfileTable() {
  const [profiles, setProfiles] = useLocalStorage<Profile[]>('profiles', []);
  const [proxies] = useLocalStorage<Proxy[]>('proxies', []);
  const [launchingProfile, setLaunchingProfile] = useState<string | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isFormOpen = searchParams.has('new') || searchParams.has('edit');
  const editingProfileId = searchParams.get('edit');
  const editingProfile = editingProfileId ? profiles.find(p => p.id === editingProfileId) : undefined;

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      router.push('/profiles');
    }
  };

  const getProxyAlias = (proxyId: string | null) => {
    if (!proxyId) return 'Nenhum';
    return proxies.find(p => p.id === proxyId)?.alias || 'Desconhecido';
  };
  
  const getProxyById = (proxyId: string | null): Proxy | undefined => {
    if (!proxyId) return undefined;
    return proxies.find(p => p.id === proxyId);
  }
  
  const handleDelete = (id: string) => {
    setProfiles(profiles.filter(p => p.id !== id));
    toast({
        title: "Perfil Deletado",
        description: "O perfil foi deletado com sucesso.",
    });
    setDeletingProfile(null);
  };

  const handleLaunch = async (profile: Profile) => {
    setLaunchingProfile(profile.id);
    
    setProfiles(currentProfiles => currentProfiles.map(p => 
      p.id === profile.id ? { ...p, status: "Rodando" } : p
    ));

    toast({
        title: `Iniciando ${profile.name}...`,
        description: "Uma janela do navegador será aberta em breve.",
    });

    const proxy = getProxyById(profile.proxyId);
    
    try {
      const response = await fetch('/api/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile, proxy }),
      });
      
      const closingTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao iniciar o navegador');
      }

      toast({
        title: "Navegador Fechado",
        description: `A sessão para o perfil "${profile.name}" foi encerrada.`,
      });
      
      setProfiles(currentProfiles => currentProfiles.map(p => 
        p.id === profile.id ? { ...p, status: `Encerrado em ${closingTime}` } : p
      ));

    } catch (error) {
      console.error("Falha ao iniciar:", error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
      toast({
        variant: 'destructive',
        title: 'Falha ao Iniciar',
        description: errorMessage,
      });
       setProfiles(currentProfiles => currentProfiles.map(p => 
        p.id === profile.id ? { ...p, status: "Erro ao iniciar" } : p
      ));
    } finally {
      setLaunchingProfile(null);
    }
  };


  return (
    <>
      <div className="flex justify-end mb-4">
        <Button asChild>
          <Link href="/profiles?new=true" prefetch={false}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Perfil
          </Link>
        </Button>
      </div>

      <ProfileForm
        key={editingProfileId} // Re-mount form when editing a different profile
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        profile={editingProfile}
      />
      
      <AlertDialog open={!!deletingProfile} onOpenChange={(open) => !open && setDeletingProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o perfil
              <span className="font-bold"> {deletingProfile?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingProfile(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deletingProfile!.id)}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Impressão Digital</TableHead>
              <TableHead>Proxy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum perfil criado ainda.
                </TableCell>
              </TableRow>
            )}
            {profiles.map((profile: Profile) => (
              <TableRow key={profile.id} className={launchingProfile === profile.id ? 'opacity-50' : ''}>
                <TableCell className="font-medium">{profile.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="flex items-center gap-1.5 capitalize">
                      {osIcons[profile.os]}
                      {profile.os}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1.5 capitalize">
                      {browserIcons[profile.browser]}
                      {profile.browser}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="flex items-center gap-1.5">
                    <Server className="h-4 w-4" />
                    {getProxyAlias(profile.proxyId)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {profile.status === "Rodando" ? (
                      <Badge variant="outline" className="text-green-400 border-green-400/50">
                          <CircleDot className="mr-2 h-4 w-4 animate-pulse" />
                          {profile.status}
                      </Badge>
                  ) : (
                      <span className="text-sm text-muted-foreground">{profile.status || 'Pronto'}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleLaunch(profile)} disabled={!!launchingProfile}>
                      {launchingProfile === profile.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Rocket className="mr-2 h-4 w-4" />
                      )}
                      Iniciar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={!!launchingProfile}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem asChild>
                          <Link href={`/profiles?edit=${profile.id}`} prefetch={false} scroll={false}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => setDeletingProfile(profile)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
