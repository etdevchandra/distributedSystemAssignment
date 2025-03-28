require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { auth } = require('express-openid-connect');
const path = require('path');

const app = express();
app.use(express.json());

// Session middleware for storing login state
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Auth0 OIDC configuration
const config = {
  authRequired: false, // Only protect specific routes
  auth0Logout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: 'http://localhost:3100',
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    callback: '/callback',
    postLogoutRedirect: '/',
  }
};

// Enable OpenID Connect auth middleware
app.use(auth(config));

// Serve frontend UI (moderator panel)
app.use('/moderate-ui', (req, res, next) => {
  // Protect this route with login
  if (!req.oidc.isAuthenticated()) {
    return res.oidc.login();
  }
  express.static(path.join(__dirname, 'public'))(req, res, next);
});

// Protect the moderation and category routes
app.use('/moderate', (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).send('Unauthorized');
  }
  require('./routes/moderate')(req, res, next);
});

app.use('/categories', (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).send('Unauthorized');
  }
  require('./routes/categories')(req, res, next);
});

// Optional: debug route
app.get('/debug', (req, res) => {
  res.json({
    authenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user || null
  });
});

// Root route
app.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.redirect('/moderate-ui');
  } else {
    res.oidc.login();
  }
});

// Logout
app.get('/logout', (req, res) => {
    req.oidc.logout({ returnTo: 'http://localhost:3100' });
  });
  

// Start server
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => console.log(`✅ Moderate service running on http://localhost:${PORT}`));
