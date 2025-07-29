'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Copy, Check } from 'lucide-react';
import { simulateUserBehavior, SimulateUserBehaviorInput } from '@/ai/flows/simulate-user-behavior';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  taskDescription: z.string().min(10, {
    message: 'Por favor, forneça uma descrição da tarefa mais detalhada.',
  }),
});

export function BehaviorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskDescription: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedScript('');
    try {
      const input: SimulateUserBehaviorInput = {
        taskDescription: values.taskDescription,
      };
      const result = await simulateUserBehavior(input);
      setGeneratedScript(result.script);
    } catch (error) {
      console.error('Erro ao gerar script:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Gerar Script',
        description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="taskDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição da Tarefa</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ex: 'Fazer login no Twitter, buscar por #NextJS e curtir os 5 primeiros tweets.'"
                    className="min-h-[200px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar Script
          </Button>
        </form>
      </Form>
      <div className="relative rounded-lg border bg-background p-4">
        <h3 className="mb-2 font-semibold">Script Gerado</h3>
        {generatedScript && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-2 h-7 w-7"
            onClick={handleCopy}
          >
            {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
        <pre className="h-[240px] w-full overflow-auto rounded-md bg-muted p-4">
          <code className="font-code text-sm text-muted-foreground">
            {isLoading ? 'Gerando script...' : generatedScript || 'Seu script aparecerá aqui.'}
          </code>
        </pre>
      </div>
    </div>
  );
}
