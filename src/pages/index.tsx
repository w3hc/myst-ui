import * as React from 'react'
import { Text, Button, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { LinkComponent } from '../components/layout/LinkComponent'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import axios from 'axios'
import { BrowserProvider, Eip1193Provider } from 'ethers'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false)
  const [latestUpload, setLatestUpload] = useState<any>('file-1721123051908-173684948.txt')

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const provider: Eip1193Provider | undefined = walletProvider
  const toast = useToast()
  const router = useRouter()

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
      console.log('Upload error:', e)
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

  const redirectToArtistAlpha = () => {
    router.push({
      pathname: '/artistAlpha',
      query: { latestUpload },
    })
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
          type="button"
          onClick={redirectToArtistAlpha}
          isLoading={isLoadingDownload}
          loadingText="Redirecting..."
          spinnerPlacement="end">
          Download
        </Button>
        {latestUpload && <Text mt={5}>{latestUpload}</Text>}
      </main>
    </>
  )
}
