import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getEditor } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// Issues short-lived Vercel Blob upload tokens to signed-in site editors only.
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        const ed = await getEditor()
        if (!ed?.canEdit) throw new Error('Not signed in')
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml', 'video/mp4'],
          maximumSizeInBytes: 60 * 1024 * 1024,
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {},
    })
    return Response.json(json)
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 400 })
  }
}
