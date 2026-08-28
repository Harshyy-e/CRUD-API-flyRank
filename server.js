require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const openapiDocument = require('./openapi.json');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Base Info Route
app.get('/', (req, res) => {
  res.json({ message: "Auth API is running and connected to Supabase" });
});

// Stage 1: Signup Endpoint
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || email.trim() === "" || password.trim() === "") {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at
    }
  });
});

// Stage 1: Login Endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || email.trim() === "" || password.trim() === "") {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  res.status(200).json({
    message: "Login successful",
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email
    }
  });
});

// Stage 2: Public Info Route
app.get('/public/info', (req, res) => {
  res.status(200).json({ message: "Welcome stranger! This info is public." });
});

// Stage 4: Reusable Auth Middleware
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = user;
  req.token = token;
  next();
}

// Stage 4: Protected Profile Route
app.get('/protected/profile', requireAuth, (req, res) => {
  res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at
  });
});

// Stage 4: Second Protected Route
app.get('/protected/dashboard', requireAuth, (req, res) => {
  res.status(200).json({
    message: `Welcome to the secure dashboard, ${req.user.email}!`,
    userId: req.user.id
  });
});

// Stage 4: Logout Endpoint
app.post('/auth/logout', requireAuth, async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(204).send();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running and connected to Supabase on http://localhost:${PORT}`);
});