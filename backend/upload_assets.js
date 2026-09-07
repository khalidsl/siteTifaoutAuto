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
  '../public/images/image-garage-4.jpg',
  '../public/images/image-dci.jpg',
  '../public/images/dci-200-with-keyboard-monitor-testing.jpg',
  '../public/images/dci200-travail.jpg',
  '../public/images/dci200.jpg',
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
        console.error('Error uploading ' + asset, err.message);
      }
    } else {
      console.error('File not found: ' + fullPath);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'cloudinary_urls.json'), JSON.stringify(result, null, 2));
  console.log('Done! Saved to backend/cloudinary_urls.json');
}

uploadAssets();
