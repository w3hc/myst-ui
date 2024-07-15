import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query

  if (!filename) {
    res.status(400).json({ error: 'Filename is required' })
    return
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_NESTJS_API_URL}/file/download/${filename}`, {
    method: 'GET',
    headers: {
      'api-key': '1234',
    },
  })

  if (response.status !== 200) {
    const data = await response.json()
    res.status(response.status).json(data)
    return
  }

  const buffer = await response.buffer()
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
  res.setHeader('Content-Type', 'application/octet-stream')
  res.status(200).send(buffer)
}
