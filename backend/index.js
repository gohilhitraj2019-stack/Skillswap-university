const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
    adapter 
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Authentication Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, credits: user.credits } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- Middleware to Protect Routes ---
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Skills Routes ---
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      include: { provider: { select: { name: true } } }
    });
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

app.post('/api/skills', authMiddleware, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const skill = await prisma.skill.create({
      data: { title, description, category, providerId: req.user.id },
    });
    res.status(201).json(skill);
  } catch (error) {
    console.error("SKILL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Sessions & Credits Routes ---
app.post('/api/sessions/book', authMiddleware, async (req, res) => {
  try {
    const { skillId, teacherId, scheduledAt, cost } = req.body;
    const learnerId = req.user.id;

    if (learnerId === teacherId) {
      return res.status(400).json({ error: 'Cannot book your own skill' });
    }

    // Check credits
    const learner = await prisma.user.findUnique({ where: { id: learnerId } });
    if (learner.credits < cost) {
      return res.status(400).json({ error: 'Insufficient credits' });
    }

    // Start a transaction: deduct credits, add to teacher, create session, record txn
    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: learnerId }, data: { credits: { decrement: cost } } });
      await tx.user.update({ where: { id: teacherId }, data: { credits: { increment: cost } } });

      const session = await tx.session.create({
        data: { learnerId, teacherId, skillId, cost, scheduledAt: new Date(scheduledAt) }
      });

      await tx.transaction.create({
        data: { amount: cost, type: 'session_payment', senderId: learnerId, receiverId: teacherId }
      });

      return session;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Booking failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
