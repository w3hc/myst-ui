import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

export const config = {
  api: {
    bodyParser: false,
  },
}

const uploadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` })
    return
  }

  try {
    const contentType = req.headers['content-type'] || 'application/octet-stream'

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => resolve(Buffer.concat(chunks)))
      req.on('error', reject)
    })

    const response = await fetch(`${process.env.NEXT_PUBLIC_NESTJS_API_URL}/file/upload`, {
      method: 'POST',
      body: buffer,
      headers: {
        'Content-Type': contentType,
        'api-key': '1234',
      },
    })

    const text = await response.text()

    let data
    try {
      data = JSON.parse(text)
    } catch (err) {
      console.error('Response is not valid JSON:', text)
      res.status(500).json({ error: 'Invalid JSON response from server', response: text })
      return
    }

    res.status(response.status).json(data)
  } catch (error) {
    console.error('Error forwarding request:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export default uploadHandler
