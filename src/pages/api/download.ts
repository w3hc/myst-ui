import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { artist, userAddress } = req.query

  console.log('Files request received with parameters:')
  console.log(`Artist: ${artist}, User Address: ${userAddress}`)

  if (!artist) {
    console.error('Error: Artist is required')
    res.status(400).json({ error: 'Artist is required' })
    return
  }

  if (!userAddress) {
    console.error('Error: User address is required')
    res.status(400).json({ error: 'User address is required' })
    return
  }

  try {
    // Fetch all files for the artist
    console.log(`Fetching from NestJS API: ${process.env.NEXT_PUBLIC_NESTJS_API_URL}/file/files/${artist}`)
    const filesResponse = await fetch(`${process.env.NEXT_PUBLIC_NESTJS_API_URL}/file/files/${artist}`, {
      method: 'GET',
      headers: {
        'api-key': '1234',
      },
    })

    console.log(`NestJS API response status (files): ${filesResponse.status}`)

    if (filesResponse.status !== 200) {
      const filesData = await filesResponse.json()
      console.error('Error from NestJS API (files):', filesData)
      res.status(filesResponse.status).json(filesData)
      return
    }

    const filesData = await filesResponse.json()
    console.log(`Files data: ${JSON.stringify(filesData)}`)

    // Fetch the latest file for the artist and user address
    console.log(`Fetching from NestJS API: ${process.env.NEXT_PUBLIC_NESTJS_API_URL}/file/download/latest/${artist}/${userAddress}`)
    const latestFileResponse = await fetch(`${process.env.NEXT_PUBLIC_NESTJS_API_URL}/file/download/latest/${artist}/${userAddress}`, {
      method: 'GET',
      headers: {
        'api-key': '1234',
      },
    })

    console.log(`NestJS API response status (latest file): ${latestFileResponse.status}`)

    if (latestFileResponse.status !== 200) {
      const latestFileData = await latestFileResponse.json()
      console.error('Error from NestJS API (latest file):', latestFileData)
      res.status(latestFileResponse.status).json(latestFileData)
      return
    }

    const latestFileData = await latestFileResponse.json()
    console.log(`Latest file data: ${JSON.stringify(latestFileData)}`)

    // Combine the results and send the response
    const responseData = {
      files: filesData,
      latestFile: latestFileData,
    }

    res.status(200).json(responseData)
  } catch (error) {
    console.error('Error fetching files from NestJS API:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
