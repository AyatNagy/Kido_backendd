const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET || 'mySuperSecretKey';

// Register new child (requires parent authentication)
const childRegister = async (req, res) => {
  try {
    const { username, name, password, dateOfBirth } = req.body;
    const motherId = req.user?.id;

    if (!motherId) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in as a parent.' });
    }

    if (!username || !name || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields: username, name, and password are required' });
    }

    const existingChild = await prisma.child.findUnique({ where: { username } });
    if (existingChild) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const mother = await prisma.user.findUnique({ where: { id: motherId } });
    if (!mother) {
      return res.status(404).json({ success: false, message: 'Parent user not found' });
    }

    const hash = await bcrypt.hash(password, 10);

    const child = await prisma.child.create({
      data: {
        username,
        name,
        password: hash,
        motherId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Child registered successfully',
      child: {
        id: child.id,
        username: child.username,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        motherId: child.motherId,
        allowedLevel: child.allowedLevel,
        createdAt: child.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error registering child', error: error.message });
  }
};

// Child login
const childLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const child = await prisma.child.findUnique({ where: { username } });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const comparedPass = await bcrypt.compare(password, child.password);
    if (!comparedPass) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: child.id, username: child.username, type: 'child' },
      jwt_secret,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Child login successful',
      token,
      child: {
        id: child.id,
        username: child.username,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        motherId: child.motherId,
        allowedLevel: child.allowedLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in child login API', error: error.message });
  }
};

// Set or update the allowed level for a child
const setInitialLevel = async (req, res) => {
  try {
    const { childId, levelId } = req.body;
    const motherId = req.user?.id;

    if (!childId || !levelId) {
      return res.status(400).json({ success: false, message: 'childId and levelId are required' });
    }

    // Make sure this child belongs to the authenticated mother
    const child = await prisma.child.findUnique({ where: { id: parseInt(childId) } });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }
    if (child.motherId !== motherId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this child' });
    }

    const updatedChild = await prisma.child.update({
      where: { id: parseInt(childId) },
      data: { allowedLevel: parseInt(levelId) },
    });

    res.status(200).json({
      success: true,
      message: `Child level set to ${levelId}`,
      allowedLevel: updatedChild.allowedLevel,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in set level API', error: error.message });
  }
};

// GET /children/my  —  Home screen: all children of the authenticated mother
const getMyChildren = async (req, res) => {
  try {
    const motherId = req.user?.id;

    if (!motherId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const children = await prisma.child.findMany({
      where: { motherId },
      include: {
        progress: {
          where: { isCompleted: true },
        },
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1, // latest assessment only
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = children.map((child) => {
      const completedLessons = child.progress.length;
      const latestAssessment = child.assessments[0] ?? null;

      return {
        id: child.id,
        name: child.name,
        username: child.username,
        dateOfBirth: child.dateOfBirth,
        allowedLevel: child.allowedLevel,
        createdAt: child.createdAt,
        progress: {
          completedLessons,
        },
        latestAssessment: latestAssessment
          ? {
              score: latestAssessment.score,
              level: latestAssessment.level,
              date: latestAssessment.createdAt,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Children retrieved successfully',
      totalChildren: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in get children API', error: error.message });
  }
};

module.exports = {
  childLogin,
  childRegister,
  setInitialLevel,
  getMyChildren,
};