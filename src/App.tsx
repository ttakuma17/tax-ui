import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ChakraProvider } from '@chakra-ui/react'

import { theme } from './theme'
import { Page } from './Page'

const queryClient = new QueryClient()

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <ChakraProvider theme={theme}>
      <Page />
    </ChakraProvider>
  </QueryClientProvider>
)
