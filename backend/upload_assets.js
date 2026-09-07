
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const assets = [
  '../public/images/logo-header.png',
  '../public/images/logo-footer.png',
  '../public/images/logo-invoice.png',
  '../public/images/image-garage.jpg',
  '../public/images/image-garage-2.jpg',
  '../public/images/image-garage-3.jpg',
  '../public/images/image-garage-4.jpg'
];

async function uploadAssets() {
  console.log('Uploading to Cloudinary...');
  const result = {};
  for (const asset of assets) {
    const fullPath = path.join(__dirname, asset);
    if (fs.existsSync(fullPath)) {
      try {
        const res = await cloudinary.uploader.upload(fullPath, { folder: 'tifaout-auto-assets' });
        result[asset] = res.secure_url;
        console.log('Uploaded: ' + asset + ' -> ' + res.secure_url);
      } catch (err) {
        console.error('Error uploading ' + asset, err);
      }
    } else {
      console.error('File not found: ' + fullPath);
    }
  }
  
  fs.writeFileSync('backend/cloudinary_urls.json', JSON.stringify(result, null, 2));
  console.log('Done! Saved to backend/cloudinary_urls.json');
}

uploadAssets();
