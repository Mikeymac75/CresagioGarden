const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const PEXELS_API_KEY = 'CueTDEetVAWGqlqGxBymrewwAkAqza5yU1NHIAY6ytdlZ31aJDemFCjh';
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

const aPEXELS_API_URL = 'https://api.pexels.com/v1/search';

const PLANTS_DATA_DIR = path.join(__dirname, '..', 'data', 'plants');
const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'images', 'plants');

async function fetchAndSaveImages() {
  try {
    // Create the images directory if it doesn't exist
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Read all files from the plants data directory
    const files = await fs.readdir(PLANTS_DATA_DIR);

    // Filter for .json files and exclude _faq.json files
    const plantFiles = files.filter(file => file.endsWith('.json') && !file.includes('_faq'));

    for (const file of plantFiles) {
      const filePath = path.join(PLANTS_DATA_DIR, file);
      console.log(`Processing file: ${file}`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const plants = JSON.parse(fileContent);

      for (const plant of plants) {
        const { id, name } = plant;
        const imagePath = path.join(IMAGES_DIR, `${id}.jpg`);

        // Check if the image already exists
        try {
          await fs.access(imagePath);
          console.log(`Image for ${name} (ID: ${id}) already exists. Skipping.`);
          continue;
        } catch (error) {
          // Image doesn't exist, so download it
        }

        console.log(`Fetching image for ${name}...`);

        try {
          const response = await axios.get(PEXELS_API_URL, {
            headers: {
              Authorization: PEXELS_API_KEY,
            },
            params: {
              query: name,
              per_page: 1,
            },
          });

          if (response.data.photos.length > 0) {
            const imageUrl = response.data.photos[0].src.large;
            const imageResponse = await axios.get(imageUrl, {
              responseType: 'arraybuffer',
            });

            await fs.writeFile(imagePath, imageResponse.data);
            console.log(`Saved image for ${name} as ${id}.jpg`);
          } else {
            console.log(`No image found for ${name}`);
          }
        } catch (error) {
          console.error(`Error fetching image for ${name}:`, error.message);
        }
         await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Image fetching complete.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

fetchAndSaveImages();
