import * as React from 'react'
import { Text, Button, useToast, Box, List, ListItem, ListIcon } from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import axios from 'axios'
import { BrowserProvider, Eip1193Provider } from 'ethers'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

export default function Home() {
  const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false)
  const [filesMetadata, setFilesMetadata] = useState<any[]>([])

  const { isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const provider: Eip1193Provider | undefined = walletProvider
  const toast = useToast()
  const router = useRouter()
  const { artist } = router.query

  const fetchFilesMetadata = async () => {
    try {
      setIsLoadingDownload(true)

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

      const response = await axios.get(`/api/download`, {
        params: {
          artist: artist,
          userAddress: signer.address,
        },
        responseType: 'json',
      })

      console.log('Download response:', response.data)

      setFilesMetadata(response.data.files)

      setIsLoadingDownload(false)
      toast({
        title: 'Files fetched',
        description: 'Files metadata has been fetched successfully.',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } catch (e) {
      setIsLoadingDownload(false)
      console.log('Fetch files metadata error:', e)
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

  const downloadLatestFile = async () => {
    try {
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
        return
      }

      const ethersProvider = new BrowserProvider(provider as any)
      const signer = await ethersProvider.getSigner()
      console.log('signer address:', signer.address)

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
      a.download = 'latest-file'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

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
      console.log('Download file error:', e)
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
          type="button"
          onClick={fetchFilesMetadata}
          isLoading={isLoadingDownload}
          loadingText="Fetching..."
          spinnerPlacement="end">
          Fetch Files
        </Button>
        <Button mt={7} ml={5} colorScheme="blue" variant="outline" type="button" onClick={downloadLatestFile}>
          Download Latest File
        </Button>
        <Box mt={5}>
          <Text fontSize="xl">Files Metadata</Text>
          <List spacing={3}>
            {filesMetadata.map((file, index) => (
              <ListItem key={index}>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                {file.originalname} - {file.mimetype} - {file.size} bytes - Uploaded on {new Date(file.uploadDate).toLocaleString()}
              </ListItem>
            ))}
          </List>
        </Box>
      </main>
    </>
  )
}
