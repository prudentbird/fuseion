import { env } from '~/env';
import { headers } from 'next/headers';
import { generateUUID } from '~/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { postRequestBodySchema, PostRequestBody } from './schema';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let requestBody: PostRequestBody;

  try {
    const json = await req.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (err) {
    return NextResponse.json(
      { error: 'bad_request:api' },
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const headersList = await headers();
    const apiHeaders = {
      'Content-Type': 'application/json',
      'openai-api-key': headersList.get('openai-api-key') || '',
      'openrouter-api-key': headersList.get('openrouter-api-key') || '',
      'google-generative-ai-api-key':
        headersList.get('google-generative-ai-api-key') || '',
    };

    const streamId = generateUUID();

    const convexUrl = `${env.CONVEX_SITE_URL}/api/chat/stream`;
    console.log('Convex URL => ', convexUrl);
    const convexRes = await fetch(convexUrl, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({
        streamId,
        messages: requestBody.messages,
      }),
      signal: req.signal,
    });

    console.log('Convex Response => ', convexRes);

    return new Response(convexRes.body, {
      status: convexRes.status,
      headers: {
        'Content-Type': convexRes.headers.get('Content-Type') || 'text/plain',
      },
    });
  } catch (error) {
    console.error('[Chat Route Error]:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
