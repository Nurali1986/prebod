import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/api-auth';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const AZURE_KEY = process.env.AZURE_TTS_API_KEY;
  const AZURE_REGION = process.env.AZURE_TTS_REGION;
  
  if (!AZURE_KEY || !AZURE_REGION) {
    console.error('Azure credentials are not configured in .env.local');
    return new NextResponse('Configuration error', { status: 500 });
  }
  
  try {
    const url = `https://${AZURE_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get token, status: ${response.status}`);
    }
    
    const token = await response.text();
    return NextResponse.json({ token, region: AZURE_REGION });
  } catch (error) {
    console.error('Error fetching Azure speech token:', error);
    return new NextResponse('Error generating auth token', { status: 500 });
  }
}
