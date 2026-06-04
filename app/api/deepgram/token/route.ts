import { NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

export async function GET() {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  if (!deepgramApiKey) {
    console.error('DEEPGRAM_API_KEY is missing');
    return NextResponse.json(
      { error: 'Deepgram API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const deepgram = createClient(deepgramApiKey);

    // Attempt to get project ID.  A user's token might be tied to a specific project.
    // We try to list projects and use the first one.
    const { result: projectsResult, error: projectsError } = await deepgram.manage.getProjects();

    if (projectsError) {
      console.error('Failed to get Deepgram projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to access Deepgram projects' },
        { status: 500 }
      );
    }

    const project = projectsResult?.projects?.[0];

    if (!project) {
        return NextResponse.json(
          { error: 'No Deepgram projects found' },
          { status: 500 }
        );
    }

    // Generate a temporary key
    const { result: keyResult, error: keyError } = await deepgram.manage.createProjectKey(
      project.project_id,
      {
        comment: 'Temporary Jarvis Client Token',
        scopes: ['usage:write'],
        tags: ['jarvis-client'],
        time_to_live_in_seconds: 60,
      }
    );

    if (keyError) {
       console.error("Failed to generate temporary Deepgram token:", keyError);
       return NextResponse.json(
         { error: 'Failed to generate token' },
         { status: 500 }
       );
    }

    return NextResponse.json({ key: keyResult.key });

  } catch (error) {
    console.error('Error generating Deepgram token:', error);
    return NextResponse.json(
      { error: 'Internal server error generating token' },
      { status: 500 }
    );
  }
}
