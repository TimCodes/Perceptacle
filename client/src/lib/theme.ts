import { extendTheme } from "@chakra-ui/theme";

export const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.900",
      },
    },
  },
  colors: {
    gray: {
      50: "#F7FAFC",
      100: "#EDF2F7",
      200: "#E2E8F0",
      300: "#CBD5E0",
      400: "#A0AEC0",
      500: "#718096",
      600: "#4A5568",
      700: "#2D3748",
      800: "#1A202C",
      900: "#171923",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "medium",
      },
      defaultProps: {
        colorScheme: "blue",
      },
    },
    FormControl: {
      baseStyle: {
        label: {
          fontWeight: "medium",
        },
      },
    },
    VStack: {
      defaultProps: {
        spacing: 4,
      },
    },
    SimpleGrid: {
      defaultProps: {
        spacing: 4,
      },
    },
  },
});