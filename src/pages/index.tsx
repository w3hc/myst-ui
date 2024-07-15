import * as React from 'react'
import { Text, Button, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { useWeb3ModalAccount } from '@web3modal/ethers/react'
import { LinkComponent } from '../components/layout/LinkComponent'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import axios from 'axios'

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false)
  const [latestUpload, setLatestUpload] = useState<any>()

  const { isConnected } = useWeb3ModalAccount()
  const toast = useToast()

  const upload = async () => {
    try {
      const fileContent = 'Hello world!'
      const blob = new Blob([fileContent], { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', blob, 'hello-super.txt')

      setIsLoading(true)

      const response = await axios.post('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const data = response.data
      console.log('Upload response:', data.metadata)
      setLatestUpload(JSON.stringify(data.metadata, null, 2))

      setIsLoading(false)
      toast({
        title: 'File uploaded',
        description: 'Your file has been uploaded successfully.',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } catch (e) {
      setIsLoading(false)
      console.log('error:', e)
      toast({
        title: 'Woops',
        description: 'Something went wrong...',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  const download = async () => {
    try {
      setIsLoadingDownload(true)

      const filename = (await JSON.parse(latestUpload)).filename
      console.log('filename:', filename)

      const response = await axios.get('/api/download', {
        params: {
          filename: filename,
        },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'sample.txt'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      setIsLoadingDownload(false)
      toast({
        title: 'File downloaded',
        description: 'Your file has been downloaded successfully.',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } catch (e) {
      setIsLoadingDownload(false)
      console.log('error:', e)
      toast({
        title: 'Woops',
        description: 'Something went wrong...',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  return (
    <>
      <Head title={SITE_NAME} description={SITE_DESCRIPTION} />
      <main>
        <Button
          mt={7}
          colorScheme="blue"
          variant="outline"
          type="submit"
          onClick={upload}
          isLoading={isLoading}
          loadingText="Uploading..."
          spinnerPlacement="end">
          Upload
        </Button>
        <Button
          mt={7}
          ml={5}
          colorScheme="blue"
          variant="outline"
          type="submit"
          onClick={download}
          isLoading={isLoadingDownload}
          loadingText="Downloading..."
          spinnerPlacement="end">
          Download
        </Button>
        {latestUpload && <Text mt={5}>{latestUpload}</Text>}
      </main>
    </>
  )
}
