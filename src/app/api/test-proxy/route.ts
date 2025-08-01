import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxySchema = z.object({
  type: z.enum(['http', 'socks5']),
  host: z.string(),
  port: z.number(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const proxy = proxySchema.parse(body);

    const proxyUrl = `${proxy.type}://${proxy.username && proxy.password ? `${proxy.username}:${proxy.password}@` : ''}${proxy.host}:${proxy.port}`;
    
    let agent;
    if (proxy.type === 'socks5') {
        agent = new SocksProxyAgent(proxyUrl);
    } else { // http
        agent = new HttpsProxyAgent(proxyUrl);
    }
    
    // Medir latência
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7 seconds timeout
    const start = Date.now();
    const response = await fetch('https://ipinfo.io/json', { 
        agent,
        signal: controller.signal 
    });
    const latency = Date.now() - start;
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`O servidor de teste respondeu com o status: ${response.status}`);
    }

    const data = await response.json();

    // Determinar anonimato (simples: se ipinfo.io mostra IP do proxy, assume 'elite')
    let anonymity = 'desconhecido';
    if (data && data.org && data.org.toLowerCase().includes('proxy')) {
      anonymity = 'anonymous';
    } else if (data && data.hostname && data.hostname.toLowerCase().includes('proxy')) {
      anonymity = 'anonymous';
    } else {
      anonymity = 'elite'; // fallback
    }

    return NextResponse.json({ success: true, data: { ...data, latency, anonymity } });

  } catch (error) {
    console.error('Erro ao testar o proxy:', error);
    let errorMessage = 'Falha ao conectar ao proxy.';
    if (error instanceof Error) {
        if(error.name === 'AbortError') {
            errorMessage = 'O teste do proxy expirou (timeout).';
        } else {
            errorMessage = error.message;
        }
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
