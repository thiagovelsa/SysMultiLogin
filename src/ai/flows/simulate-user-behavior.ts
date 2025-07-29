'use server';

/**
 * @fileOverview A flow to simulate user behavior by generating realistic typing and mouse movements.
 *
 * - simulateUserBehavior - A function that simulates user behavior.
 * - SimulateUserBehaviorInput - The input type for the simulateUserBehavior function.
 * - SimulateUserBehaviorOutput - The return type for the simulateUserBehavior function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateUserBehaviorInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('Uma descrição detalhada da tarefa que o usuário está tentando realizar no navegador.'),
});
export type SimulateUserBehaviorInput = z.infer<typeof SimulateUserBehaviorInputSchema>;

const SimulateUserBehaviorOutputSchema = z.object({
  script: z
    .string()
    .describe(
      'Um script Javascript que usa uma biblioteca como Selenium ou Puppeteer para automatizar a tarefa enquanto imita a digitação e os movimentos do mouse humanos. O script deve implementar atrasos realistas e tratamento de erros.'
    ),
});
export type SimulateUserBehaviorOutput = z.infer<typeof SimulateUserBehaviorOutputSchema>;

export async function simulateUserBehavior(input: SimulateUserBehaviorInput): Promise<SimulateUserBehaviorOutput> {
  return simulateUserBehaviorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateUserBehaviorPrompt',
  input: {schema: SimulateUserBehaviorInputSchema},
  output: {schema: SimulateUserBehaviorOutputSchema},
  prompt: `Você é um especialista em simular o comportamento do usuário em um navegador da web para evitar a detecção como um bot.

Você receberá uma descrição da tarefa que o usuário deseja realizar. Seu objetivo é gerar um script Javascript que use uma biblioteca como Selenium ou Puppeteer para automatizar a tarefa, imitando a digitação humana e os movimentos do mouse. O script deve implementar atrasos realistas e tratamento de erros.

Descrição da Tarefa: {{{taskDescription}}}
`,
});

const simulateUserBehaviorFlow = ai.defineFlow(
  {
    name: 'simulateUserBehaviorFlow',
    inputSchema: SimulateUserBehaviorInputSchema,
    outputSchema: SimulateUserBehaviorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
