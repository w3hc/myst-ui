import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { artist, userAddress } = req.query

  console.log('Download request received with parameters:')
  console.log(`Artist: ${artist}`)
  console.log(`User Address: ${userAddress}`)

  if (!artist) {
    console.error('Error: Artist is required')
    res.status(400).json({ error: 'Artist is required' })
    return
  }

  try {
    console.log(`Fetching from NestJS API: ${process.env.NEXT_PUBLIC_NESTJS_API_URL}/file/download/latest/${artist}/${userAddress}`)
    const response = await fetch(`${process.env.NEXT_PUBLIC_NESTJS_API_URL}/file/download/latest/${artist}/${userAddress}`, {
      method: 'GET',
      headers: {
        'api-key': '1234',
      },
    })

    console.log(`NestJS API response status: ${response.status}`)

    if (response.status !== 200) {
      const data = await response.json()
      console.error('Error from NestJS API:', data)
      res.status(response.status).json(data)
      return
    }

    const buffer = await response.arrayBuffer()
    const contentDisposition = response.headers.get('Content-Disposition')
    const filename = contentDisposition ? contentDisposition.split('filename=')[1] : null
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    res.setHeader('Content-Type', 'application/octet-stream')
    console.log('File fetched successfully, sending to client')
    res.status(200).send(buffer)
  } catch (error) {
    console.error('Error fetching file from NestJS API:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
