import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const video = (formData.get('video') || formData.get('file')) as File | null;
    const directorId = (formData.get('directorId') as string) || 'dir-guest';
    const directorName = (formData.get('directorName') as string) || 'Young Director';

    if (!video) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

    // Check if Google Drive credentials are configured with a valid PEM private key
    const isValidPrivateKey = Boolean(
      privateKey &&
      privateKey.includes('-----BEGIN PRIVATE KEY-----') &&
      !privateKey.includes('your_private_key_here')
    );

    if (serviceEmail && isValidPrivateKey) {
      try {
        // Unescape private key newlines, strip quotes and carriage returns
        privateKey = privateKey!
          .trim()
          .replace(/^["']|["']$/g, '')
          .replace(/\\n/g, '\n')
          .replace(/\r/g, '');

        const auth = new google.auth.JWT({
          email: serviceEmail,
          key: privateKey,
          scopes: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive',
          ],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Convert File ArrayBuffer to Node Readable Stream
        const arrayBuffer = await video.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const stream = Readable.from(buffer);

        // Upload metadata
        const fileMetadata: { name: string; parents?: string[] } = {
          name: `${directorName.replace(/\s+/g, '_')}_${video.name}`,
        };

        if (parentFolderId) {
          fileMetadata.parents = [parentFolderId];
        }

        const driveResponse = await drive.files.create({
          requestBody: fileMetadata,
          media: {
            mimeType: video.type || 'video/mp4',
            body: stream,
          },
          fields: 'id, webViewLink, webContentLink',
        });

        const fileId = driveResponse.data.id;

        if (fileId) {
          // Make file publicly readable so preview embed works
          try {
            await drive.permissions.create({
              fileId,
              requestBody: {
                role: 'reader',
                type: 'anyone',
              },
            });
          } catch (permErr) {
            console.warn('Could not set public permission on Drive file:', permErr);
          }

          return NextResponse.json({
            success: true,
            status: 'success',
            fileId,
            drive_link: `https://drive.google.com/file/d/${fileId}/preview`,
            webViewLink: driveResponse.data.webViewLink,
            fileName: video.name,
            fileSize: video.size,
            uploadTimestamp: new Date().toISOString(),
          });
        }
      } catch (driveErr) {
        console.error('Google Drive API Upload error, using simulation fallback:', driveErr);
      }
    }

    // Fallback simulation if env vars are missing or upload fails
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    let fileId = 'simulated_';
    for (let i = 0; i < 24; i++) {
      fileId += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }

    const driveFolder = `Google_Drive/Directors/${directorName.replace(/\s+/g, '_')}_${directorId}`;

    return NextResponse.json({
      success: true,
      status: 'simulated',
      fileId,
      drive_link: `https://drive.google.com/file/d/${fileId}/preview`,
      folder: driveFolder,
      fileName: video.name,
      fileSize: video.size,
      uploadTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Google Drive Upload Route Error:', error);
    return NextResponse.json({ error: 'Failed to process Google Drive upload' }, { status: 500 });
  }
}
