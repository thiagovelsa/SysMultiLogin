import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { z } from 'zod';
import type { Profile, Proxy } from '@/lib/types';

// This is a basic mapping, a real implementation would have more robust fingerprinting
const userAgents = {
    windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
}

const launchSchema = z.object({
  profile: z.any(), // Using any for simplicity, validation happens on the client
  proxy: z.any().optional(), // Using any for simplicity
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, proxy } = launchSchema.parse(body);
    
    const launchArgs: string[] = [];
    if (proxy) {
        launchArgs.push(`--proxy-server=${proxy.type}://${proxy.host}:${proxy.port}`);
    }

    const browser = await puppeteer.launch({
      headless: false, // We want to see the browser
      args: launchArgs,
      // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // Example for macOS, might need adjustment
    });

    const page = await browser.newPage();
    
    // Set user agent based on profile
    await page.setUserAgent(userAgents[profile.os as keyof typeof userAgents] || userAgents.windows);

    if (proxy && proxy.username && proxy.password) {
        await page.authenticate({
            username: proxy.username,
            password: proxy.password
        });
    }

    // Go to a test page to verify the IP address
    await page.goto('https://www.whatismybrowser.com/detect/what-is-my-user-agent', { waitUntil: 'domcontentloaded' });

    // When the browser is closed by the user, the promise will resolve.
    await new Promise(resolve => browser.on('disconnected', resolve));

    return NextResponse.json({ message: 'Sessão do navegador encerrada' });
  } catch (error) {
    console.error('Erro ao iniciar:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Payload da requisição inválido', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Falha ao iniciar o navegador' }, { status: 500 });
  }
}
