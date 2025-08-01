'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy } from 'lucide-react';

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
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Evitar erro de hidratação garantindo que o componente renderize o mesmo conteúdo no servidor e cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const cloneProfile = (profile: Profile) => {
    const newProfile = { ...profile, id: crypto.randomUUID(), name: profile.name + ' (Clone)' };
    setProfiles([...profiles, newProfile]);
    toast({ title: 'Perfil clonado', description: `O perfil "${profile.name}" foi duplicado com sucesso.` });
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
        profiles={profiles}
        setProfiles={setProfiles}
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
            {!isClient ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Carregando perfis...
                </TableCell>
              </TableRow>
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum perfil criado ainda.
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile: Profile) => (
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
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="flex items-center gap-1.5">
                          <Server className="h-4 w-4" />
                          {getProxyAlias(profile.proxyId)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {(() => {
                          const proxy = getProxyById(profile.proxyId);
                          if (!proxy) return <span>Nenhum proxy associado</span>;
                          return (
                            <div>
                              <div><b>Status:</b> {proxy.status}</div>
                              <div><b>Latência:</b> {proxy.latency ? `${proxy.latency} ms` : 'N/A'}</div>
                              <div><b>País:</b> {proxy.country || 'N/A'}</div>
                              <div><b>Anonimato:</b> {proxy.anonymity || 'N/A'}</div>
                            </div>
                          );
                        })()}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                        <DropdownMenuItem onClick={() => cloneProfile(profile)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Clonar Perfil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );

}

export default ProfileTable;
