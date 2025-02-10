import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: true,
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.900',
      },
    }),
  },
  colors: {
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
  },
  components: {
    Button: {
      baseStyle: (props: { colorMode: string }) => ({
        _hover: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
        },
      }),
    },
    Input: {
      variants: {
        outline: (props: { colorMode: string }) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
            },
          },
        }),
      },
    },
  },
});