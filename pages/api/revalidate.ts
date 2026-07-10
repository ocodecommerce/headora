import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug, slug2, slug3, path, fullUrl } = req.body

    let revalidatePath = ''

    if (fullUrl) {
      revalidatePath = fullUrl.startsWith('/') ? fullUrl : `/${fullUrl}`
    } 
    else if (path) {
      revalidatePath = path
    } 
    else if (slug) {
      let url = slug
      if (slug2) url += `/${slug2}`
      if (slug3) url += `/${slug3}`
      revalidatePath = url.startsWith('/') ? url : `/${url}`
    }

    if (!revalidatePath) {
      return res.status(400).json({ error: 'Provide fullUrl, path or slugs' })
    }

    // Important: Add trailing slash if your config has trailingSlash: true
    if (revalidatePath !== '/' && !revalidatePath.endsWith('/')) {
      revalidatePath += '/'
    }

    console.log(`🔄 Revalidating: ${revalidatePath}`)

    await res.revalidate(revalidatePath)

    console.log(`✅ Successfully revalidated: ${revalidatePath}`)

    return res.status(200).json({
      success: true,
      message: `Revalidated successfully`,
      path: revalidatePath
    })

  } catch (error: any) {
    console.error("Revalidate Error:", error.message)
    return res.status(500).json({ error: error.message })
  }
}