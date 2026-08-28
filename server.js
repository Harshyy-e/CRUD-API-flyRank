require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get('/', (req, res) => {
  res.json({ message: "Auth API is running and connected to Supabase" });
});

// GET /public/info (No auth required)
app.get('/public/info', (req, res) => {
  res.status(200).json({ message: "Welcome stranger! This info is public." });
});

// GET /protected/profile (Stage 3: Verified with Supabase)
app.get('/protected/profile', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  // Ask Supabase to verify the token
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.status(200).json({
    id: user.id,
    email: user.email,
    created_at: user.created_at
  });
});


app.listen(PORT, () => {
  console.log(`Server running and connected to Supabase on http://localhost:${PORT}`);
});


// POST /auth/signup
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

// POST /auth/login
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



