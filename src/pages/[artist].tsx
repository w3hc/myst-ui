import * as React from 'react'
import { Text, Button, useToast, Box, List, ListItem, ListIcon } from '@chakra-ui/react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import axios from 'axios'
import { BrowserProvider, Eip1193Provider } from 'ethers'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

interface FileMetadata {
  title: string
  description: string
  originalname: string
  mimetype: string
  size: number
  uploadDate: string
}

interface ApiResponse {
  files: FileMetadata[]
  title: string
  description: string
}

export default function Home() {
  const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false)
  const [filesMetadata, setFilesMetadata] = useState<FileMetadata[]>([])
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  const { isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const provider: Eip1193Provider | undefined = walletProvider
  const toast = useToast()
  const router = useRouter()
  const { artist } = router.query

  const fetchFilesMetadata = useCallback(async () => {
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

      const response = await axios.get<ApiResponse>(`/api/download`, {
        params: {
          artist: artist,
          userAddress: signer.address,
        },
        responseType: 'json',
      })

      console.log('Download response:', response.data)

      // Sort files by uploadDate in descending order
      const sortedFiles = response.data.files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())

      setFilesMetadata(sortedFiles)
      setTitle(response.data.title)
      setDescription(response.data.description)

      setIsLoadingDownload(false)
      // toast({
      //   title: 'Files fetched',
      //   description: 'Files metadata has been fetched successfully.',
      //   status: 'success',
      //   position: 'bottom',
      //   variant: 'subtle',
      //   duration: 3000,
      //   isClosable: true,
      // })
    } catch (e) {
      setIsLoadingDownload(false)
      console.log('Fetch files metadata error:', e)
      // toast({
      //   title: 'Woops',
      //   description: 'Something went wrong...',
      //   status: 'error',
      //   position: 'bottom',
      //   variant: 'subtle',
      //   duration: 9000,
      //   isClosable: true,
      // })
    }
  }, [artist, isConnected, provider, toast])

  useEffect(() => {
    if (isConnected) {
      fetchFilesMetadata()
    }
  }, [isConnected, fetchFilesMetadata])

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
        <Box mt={5}>
          <Text fontSize="2xl" fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="lg" mb={5}>
            {description}
          </Text>
        </Box>
        <Box mt={5}>
          <List spacing={3}>
            {filesMetadata.map((file, index) => (
              <Box
                key={index}
                mt={5}
                border="2px"
                borderColor="#8c1c84"
                borderRadius="md"
                p={4}
                animation={index === 0 ? 'blink 10s ease-in-out' : 'none'}>
                <Text fontSize="xl" fontWeight="bold">
                  {file.title}
                </Text>
                <Text fontSize="lg" mb={5}>
                  {file.description}
                </Text>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <strong>{file.originalname}</strong> uploaded on {new Date(file.uploadDate).toLocaleString()}
                </ListItem>
                <Button mt={7} colorScheme="blue" variant="outline" type="button" onClick={downloadLatestFile}>
                  Download
                </Button>
              </Box>
            ))}
          </List>
        </Box>
      </main>
      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            border-color: #8c1c84;
          }
          50% {
            border-color: #45a2f8;
          }
        }
      `}</style>
    </>
  )
}
