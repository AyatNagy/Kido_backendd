const prisma = require('../prismaClient');

function buildProgressResponse(progressRows) {
  const grouped = {};

  for (const p of progressRows) {
    const levelName    = p.lesson.category.level.name;
    const categoryName = p.lesson.category.name;

    if (!grouped[levelName])             grouped[levelName] = {};
    if (!grouped[levelName][categoryName]) grouped[levelName][categoryName] = [];

    grouped[levelName][categoryName].push({
      progressId:  p.id,
      lessonId:    p.lessonId,
      lessonTitle: p.lesson.title,
      isCompleted: p.isCompleted,
      completedAt: p.completedAt,
    });
  }

  const totalLessons     = progressRows.length;
  const completedLessons = progressRows.filter((p) => p.isCompleted).length;

  return {
    summary: {
      totalLessons,
      completedLessons,
      completionPercentage:
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
    },
    data: grouped,
  };
}

// ─── include block (reused in both progress queries) ─────────────────────────
const progressInclude = {
  lesson: {
    include: {
      category: { include: { level: true } },
    },
  },
};

// ─── 1. completeLesson ──────────
const completeLesson = async (req, res) => {
  try {
    const lessonId = parseInt(req.body.lessonId, 10);
    const isChild  = req.user?.type === 'child';
    let childId;

    if (isChild) {
      childId = req.user.id;
    } else {
      // Parent flow
      const motherId = req.user?.id;
      childId        = parseInt(req.body.childId, 10);

      if (!motherId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      if (!childId || isNaN(childId)) {
        return res.status(400).json({ success: false, message: 'childId is required when using parent token' });
      }

      const childCheck = await prisma.child.findUnique({ where: { id: childId } });
      if (!childCheck) {
        return res.status(404).json({ success: false, message: 'Child not found' });
      }
      if (childCheck.motherId !== motherId) {
        return res.status(403).json({ success: false, message: 'You are not authorized for this child' });
      }
    }

    if (!childId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!lessonId || isNaN(lessonId)) {
      return res.status(400).json({ success: false, message: 'lessonId is required' });
    }

    // Make sure lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { category: { include: { level: true } } },
    });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check child's allowed level
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (lesson.category.level.id > child.allowedLevel) {
      return res.status(403).json({
        success: false,
        message: `Child is not allowed to access level ${lesson.category.level.id} yet`,
      });
    }

    // Upsert progress record
    const progress = await prisma.progress.upsert({
      where:  { childId_lessonId: { childId, lessonId } },
      update: { isCompleted: true, completedAt: new Date() },
      create: { childId, lessonId, isCompleted: true },
    });

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed',
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in complete lesson API',
      error: error.message,
    });
  }
};

// ─── 2. getMyProgress (Child token) ──────────────────────────────────────────
const getMyProgress = async (req, res) => {
  try {
    const childId = req.user?.id;
    if (!childId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const progress = await prisma.progress.findMany({
      where:   { childId },
      include: progressInclude,
      orderBy: { completedAt: 'desc' },
    });

    const { summary, data } = buildProgressResponse(progress);

    res.status(200).json({
      success: true,
      message: 'Progress retrieved successfully',
      summary,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in get progress API',
      error: error.message,
    });
  }
};

// ─── 3. getChildProgressForParent (Parent token) ─────────────────────────────
const getChildProgressForParent = async (req, res) => {
  try {
    const motherId = req.user?.id;
    const childId  = parseInt(req.params.childId, 10);

    if (!motherId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!childId || isNaN(childId)) {
      return res.status(400).json({ success: false, message: 'Valid childId is required' });
    }

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }
    if (child.motherId !== motherId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this child' });
    }

    const progress = await prisma.progress.findMany({
      where:   { childId },
      include: progressInclude,
      orderBy: { completedAt: 'desc' },
    });

    const { summary, data } = buildProgressResponse(progress);

    res.status(200).json({
      success: true,
      message: 'Progress retrieved successfully',
      summary,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in get child progress API',
      error: error.message,
    });
  }
};

module.exports = {
  completeLesson,
  getMyProgress,
  getChildProgressForParent,
};