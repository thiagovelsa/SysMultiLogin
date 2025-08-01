import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { launchProfile } from './launch';

const launchSchema = z.object({
  profile: z.object({
    id: z.string(),
    name: z.string(),
    os: z.enum(['windows', 'macos', 'linux']),
    browser: z.enum(['chrome', 'firefox', 'safari']),
    fingerprint: z.object({
      userAgent: z.string().optional(),
      webgl: z.string().optional(),
      canvas: z.string().optional(),
      language: z.string().optional(),
      timezone: z.string().optional(),
      hardwareConcurrency: z.string().optional(),
      deviceMemory: z.string().optional(),
      fonts: z.string().optional(),
    }).optional(),
  }),
  proxy: z.object({
    id: z.string(),
    type: z.enum(['http', 'socks5']),
    host: z.string(),
    port: z.number(),
    username: z.string().optional(),
    password: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, proxy } = launchSchema.parse(body);
    
    console.log(`Iniciando navegador para o perfil: ${profile.name}`);
    
    // Chama a função de lançamento do Puppeteer
    const result = await launchProfile(profile, proxy);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao iniciar:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Payload da requisição inválido', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Falha ao iniciar o navegador' }, { status: 500 });
  }
}
