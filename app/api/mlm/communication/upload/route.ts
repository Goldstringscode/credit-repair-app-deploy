import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Maximum file size for the base64 fallback (5 MB)
const MAX_FALLBACK_SIZE = 5 * 1024 * 1024;

function tryGetSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url === 'https://placeholder.supabase.co') return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const channelId = formData.get('channelId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!channelId) {
      return NextResponse.json(
        { success: false, error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    const supabase = tryGetSupabase();

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (supabase) {
      // Upload to Supabase Storage
      const timestamp = Date.now();
      const storagePath = `${channelId}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('mlm-communication-uploads')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error('Supabase Storage upload error:', error);
        // Fall back to data URL only for small files
        if (buffer.length > MAX_FALLBACK_SIZE) {
          return NextResponse.json(
            { success: false, error: 'File upload failed and file is too large for fallback encoding' },
            { status: 500 }
          );
        }
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        return NextResponse.json({
          success: true,
          url: dataUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('mlm-communication-uploads')
        .getPublicUrl(data.path);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        path: data.path,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    }

    // Supabase not configured — fall back to base64 data URL only for small files
    if (buffer.length > MAX_FALLBACK_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Supabase Storage is not configured and file exceeds maximum fallback size (5 MB)' },
        { status: 503 }
      );
    }

    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
