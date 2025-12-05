import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { Readable } from 'stream';

// Initialize AWS Polly client
const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Valid voice IDs for AWS Polly
type PollyVoiceId = 
  | 'Joanna' | 'Matthew' | 'Ivy' | 'Kendra' | 'Kimberly' | 'Salli' | 'Joey' | 'Justin' | 'Kevin'
  | 'Amy' | 'Emma' | 'Brian' | 'Aria' | 'Ayanda' | 'Danielle' | 'Gregory' | 'Ruth';

// Valid engine types
type PollyEngine = 'standard' | 'neural';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user's ID from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const { text, voice = 'Amy', engine = 'neural' } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Validate AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'AWS credentials are not configured' },
        { status: 500 }
      );
    }

    // Prepare Polly parameters
    const params = {
      Text: text,
      OutputFormat: 'mp3' as const,
      VoiceId: voice as PollyVoiceId,
      Engine: engine as PollyEngine,
      TextType: 'text' as const,
      SampleRate: '24000'
    };

    // Call AWS Polly
    const command = new SynthesizeSpeechCommand(params);
    const response = await pollyClient.send(command);

    if (!response.AudioStream) {
      throw new Error('No audio stream received from Polly');
    }

    // Convert the audio stream to a buffer
    const audioStream = response.AudioStream as Readable;
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    
    const audioBuffer = Buffer.concat(chunks);

    // Return the audio as a response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error with AWS Polly:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to synthesize speech', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

