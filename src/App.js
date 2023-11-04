import React, { useState } from 'react';
import axios from 'axios';
import { ChakraProvider } from '@chakra-ui/react'
import { Box, Button, Input, Spinner, Grid, Link, Flex, Text, Image,  FormControl,
  FormLabel,
 Switch } from '@chakra-ui/react';
import { Analytics } from '@vercel/analytics/react';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

function App() {
  const [text, setText] = useState(''); // For the text input
  const [isLoading, setIsLoading] = useState(false); // To track loading state
  const [images, setImages] = useState([]); // To store the returned images
  const [isEnhanced, setIsEnhanced] = useState(false);


  const handleReset = () => {
    setText(''); 
    setImages([]); 
  }
  const chatGPTInstruction = "You are ChatGPT, an expert text-to-image prompt writer. Your primary responsibility is to accept input text in any given language. Upon receiving the input: 1. Translation: Immediately translate the text to English, ensuring the essence and context of the original description is retained. 2. Enhancement: Once translated, enhance the description according to the specified constraints: - Make the description detailed and suitable for DALL·E image generation. - Add elements to enrich the scene. - Clearly specify descent and gender for human characters to promote diversity. - Use qualifiers like 'photorealistic', 'lifelike', or 'hyper-realistic' to emphasize realism in the generated image. 3. Output: Provide the enhanced prompt to the user. This final prompt should be optimized for DALL·E, aiming to produce a photorealistic image that captures the essence of the user's initial description. Remember, your expertise lies in transforming a simple or complex description from any language into a detailed, photorealistic prompt suitable for DALL·E image generation. Only output the final enhanced prompt in English. Final Prompt:";
  const chatCompletion = '';
  const handleGenerate = async () => {
  setIsLoading(true);
  let finalText = text; // Start with the original text

  if (isEnhanced) {
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "system", content: chatGPTInstruction }, { role: "user", content: text }],
        model: "gpt-3.5-turbo",
        max_tokens: 500
      });
      
      // Update the finalText to be the enhanced text
      finalText = chatCompletion.choices[0].message.content;
      setText(finalText); // Set the state if you want to display it in UI

    } catch (chatError) {
      console.error("ChatGPT call failed:", chatError);
      setIsLoading(false);
      return; // Exit if the ChatGPT call fails
    }
  }

  try {
    const API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
    const response = await axios.post(API_URL, {
      text_prompts: [{ 'text': finalText }],
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
        
        <Flex mb={4} justifyContent="center" alignItems="center" spacing={4}>
          <Button colorScheme="purple" onClick={handleGenerate} mr={3} _hover={{ bg: "purple.700" }}>
            Generate
          </Button>
          <Button colorScheme="red" onClick={handleReset} mr={3} _hover={{ bg: "red.700" }}>
            Reset
          </Button>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="enhance-switch" mb="0" mr={2}>
              Enhance Prompt
            </FormLabel>
            <Switch id="enhance-switch" isChecked={isEnhanced} onChange={(e) => setIsEnhanced(e.target.checked)} />
          </FormControl>
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
