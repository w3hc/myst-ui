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
  const [latestUpload, setLatestUpload] = useState<any>()
  const [artistAlpha, setArtistAlpha] = useState<string | string[] | undefined>(undefined)

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const provider: Eip1193Provider | undefined = walletProvider
  const toast = useToast()
  const router = useRouter()

  const download = async () => {
    try {
      setIsLoadingDownload(true)

      const { artist } = router.query
      console.log(`artistAlpha: ${artist}`)

      if (!isConnected) {
        toast({
          title: 'Connect wallet',
          description: 'Please connect your wallet first.',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 9000,
          isClosable: true,
        })
        setIsLoadingDownload(false)
        return
      }

      const ethersProvider = new BrowserProvider(provider as any)
      const signer = await ethersProvider.getSigner()
      console.log('signer address:', signer.address)
      console.log('artist:', artist)

      const response = await axios.get(`/api/download`, {
        params: {
          artist: artist,
          userAddress: signer.address,
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
        {artistAlpha && <Text mt={5}>Artist Alpha: {artistAlpha}</Text>}
        {latestUpload && <Text mt={5}>Latest Upload: {latestUpload}</Text>}
      </main>
    </>
  )
}
