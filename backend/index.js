const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

const prisma = new PrismaClient();

const PORT = process.env.PORT || 5050;

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
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 86400000 });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, credits: user.credits, bio: user.bio } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- Middleware to Protect Routes ---
const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  
  if (!token && req.headers.cookie) {
    const cookieMap = {};
    req.headers.cookie.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length === 2) {
        cookieMap[parts[0].trim()] = decodeURIComponent(parts[1].trim());
      }
    });
    token = cookieMap.token;
  }

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

// --- User Profile Routes ---
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, credits: true, bio: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ error: 'Email is already in use by another account' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        ...(name && { name }),
        ...(email && { email }),
        ...(bio !== undefined && { bio })
      },
      select: { id: true, name: true, email: true, role: true, credits: true, bio: true, createdAt: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// --- Skills Routes ---
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      include: { provider: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

app.get('/api/user/skills', authMiddleware, async (req, res) => {
  try {
    const userSkills = await prisma.skill.findMany({
      where: { providerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(userSkills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user skills' });
  }
});

app.post('/api/skills', authMiddleware, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const skill = await prisma.skill.create({
      data: { title, description, category, providerId: req.user.id },
      include: { provider: { select: { name: true } } }
    });
    res.status(201).json(skill);
  } catch (error) {
    console.error("SKILL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    
    if (skill.providerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to edit this skill' });
    }

    const updated = await prisma.skill.update({
      where: { id },
      data: { title, description, category },
      include: { provider: { select: { name: true } } }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    
    if (skill.providerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this skill' });
    }

    await prisma.skill.delete({ where: { id } });
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// --- Sessions & Credits Routes ---
app.get('/api/user/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        OR: [
          { learnerId: req.user.id },
          { teacherId: req.user.id }
        ]
      },
      include: {
        skill: true,
        learner: { select: { id: true, name: true, email: true } },
        teacher: { select: { id: true, name: true, email: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.get('/api/user/booked-skills', authMiddleware, async (req, res) => {
  try {
    const bookedSessions = await prisma.session.findMany({
      where: { learnerId: req.user.id },
      include: {
        skill: {
          include: { provider: { select: { id: true, name: true, email: true } } }
        },
        teacher: { select: { id: true, name: true, email: true } }
      },
      orderBy: { scheduledAt: 'desc' }
    });
    res.json(bookedSessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch booked skills' });
  }
});

app.delete('/api/sessions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (session.learnerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to cancel this session' });
    }

    // Refund credits to learner and deduct from teacher in transaction
    await prisma.$transaction([
      prisma.user.update({ where: { id: session.learnerId }, data: { credits: { increment: session.cost } } }),
      prisma.user.update({ where: { id: session.teacherId }, data: { credits: { decrement: session.cost } } }),
      prisma.session.delete({ where: { id } })
    ]);

    res.json({ message: 'Session cancelled and credits refunded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cancel session' });
  }
});
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

// --- Admin Auto-Seed ---
async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          credits: 100,
          bio: 'Platform administrator'
        }
      });
      console.log(`[Seed] Created admin user from .env: ${adminEmail}`);

      // Seed a sample skill for admin
      await prisma.skill.create({
        data: {
          title: 'Full Stack Web Development (React & Node.js)',
          description: 'Learn how to build full stack web applications with React, Node.js, and Express.',
          category: 'Web Development',
          providerId: admin.id
        }
      });
      console.log(`[Seed] Created sample skill for ${adminEmail}`);
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
}

app.listen(PORT, async () => {
  await seedAdmin();
  console.log(`Backend server running on http://localhost:${PORT}`);
});
