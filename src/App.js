import React, { useState } from 'react';
import axios from 'axios';
import { ChakraProvider } from '@chakra-ui/react'
import { Box, Button, Input, Spinner, Grid, Link, Flex, Text, Image } from '@chakra-ui/react';
import { Analytics } from '@vercel/analytics/react';

function App() {
  const [text, setText] = useState(''); // For the text input
  const [isLoading, setIsLoading] = useState(false); // To track loading state
  const [images, setImages] = useState([]); // To store the returned images


  const handleReset = () => {
    setText(''); 
    setImages([]); 
  }

  const handleGenerate = async () => {
  setIsLoading(true);
  try {
    const API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
    const response = await axios.post(API_URL, {
      text_prompts: [{ text }],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      samples: 4,
      steps: 30
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_STABILITY_API_KEY}`
      },
      responseType: 'json' // Expecting a JSON response
    });
    console.log(response);

    if (response.data && response.data.artifacts && Array.isArray(response.data.artifacts)) {
      const base64Images = response.data.artifacts.map(item => item.base64);
      setImages(base64Images);
    }
  } catch (error) {
    console.error("API call failed:", error);
  } finally {
    setIsLoading(false);
  }
}


return (
  <ChakraProvider>
  <div className="App">
  <Flex flexDirection="column" alignItems="center" minHeight="100vh" bg="gray.50">

      {/* Header Navbar */}
      <Flex 
        as="nav" 
        width="100%" 
        py={4} 
        px={6} 
        backgroundColor="purple.600" 
        justifyContent="center"
        boxShadow="md"
      >
        <Text fontSize="2xl" fontWeight="bold" color="white">Chitrakar.ai - Text-to-Image</Text>
      </Flex>

      <Box 
        mt={6} 
        py={6} 
        px={{ base: 4, md: 8 }} 
        width="100%" 
        maxWidth="600px" 
        bg="white" 
        boxShadow="lg" 
        borderRadius="md"
      >
        <Input 
          size="lg"
          mb={5}
          type="text" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Enter text..." 
          focusBorderColor="purple.400"
        />
        
        <Flex mb={5} justifyContent="center" spacing={4}>
          <Button size="lg" colorScheme="purple" onClick={handleGenerate} mr={3} _hover={{ bg: "purple.700" }}>
            Generate
          </Button>
          <Button size="lg" colorScheme="red" onClick={handleReset} _hover={{ bg: "red.700" }}>
            Reset
          </Button>
        </Flex>

        {isLoading ? (
          <Box mt={5} textAlign="center">
            <Spinner color="purple.500" size="xl" />
          </Box>
        ) : (
          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6} mt={5}>
            {images.map((img, index) => (
              <Link 
                key={index} 
                href={`data:image/png;base64,${img}`} 
                download={`generated_image_${index + 1}.png`}
              >
                <Image 
                  src={`data:image/png;base64,${img}`} 
                  alt={`Generated content ${index + 1}`} 
                  width="100%" 
                  objectFit="cover" 
                  borderRadius="md" 
                  boxShadow="md"
                />
              </Link>
            ))}
          </Grid>
        )}

      </Box>
    </Flex>
    <Analytics />
    </div>
  </ChakraProvider>
);

}

export default App;
