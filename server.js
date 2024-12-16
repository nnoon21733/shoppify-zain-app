require('dotenv').config();
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const app = express();

// Set up your Shopify app's environment variables
const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_SCOPES, SHOPIFY_HOST } = process.env;

// Initialize the Shopify API context
Shopify.Context.initialize({
  API_KEY: SHOPIFY_API_KEY,
  API_SECRET_KEY: SHOPIFY_API_SECRET,
  SCOPES: SHOPIFY_SCOPES.split(','), // For example: 'read_products,write_products'
  HOST_NAME: SHOPIFY_HOST,
  API_VERSION: '2023-10', // Use the latest API version for your app
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(), // Use session storage for your app
});

// Define a basic route
app.get('/', (req, res) => {
  res.send('Shopify Node.js App is Running');
});

// Set up OAuth redirect and Shopify authentication
app.get('/auth', async (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }

  const redirectUri = `${SHOPIFY_HOST}/auth/callback`;
  const installUrl = Shopify.Auth.beginAuth(req, res, shop, redirectUri, false);
  return res.redirect(installUrl);
});

// Handle OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { shop, code, hmac, timestamp } = req.query;
  
  // Validate the request using Shopify’s security protocol
  const session = await Shopify.Auth.validateAuthCallback(req, res, req.query);
  if (!session) {
    return res.status(400).send('Failed to authenticate request');
  }

  // Once validated, you can store the session or use it
  res.send('Shopify authentication successful!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
