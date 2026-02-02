const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = 'C:\\Users\\joshu\\Downloads\\brading-assets\\branding-assets\\solscan-logo-light.svg';
const outputDir = path.dirname(inputFile);

// Convert to PNG
const pngOutput = path.join(outputDir, 'solscan-logo-light.png');
sharp(inputFile)
  .png()
  .toFile(pngOutput)
  .then(() => {
    console.log(`✅ PNG created: ${pngOutput}`);
    
    // Also create JPEG version
    const jpegOutput = path.join(outputDir, 'solscan-logo-light.jpg');
    return sharp(inputFile)
      .jpeg({ quality: 100 })
      .toFile(jpegOutput);
  })
  .then(() => {
    console.log(`✅ JPEG created: ${path.join(outputDir, 'solscan-logo-light.jpg')}`);
  })
  .catch(err => {
    console.error('Error converting SVG:', err);
  });
