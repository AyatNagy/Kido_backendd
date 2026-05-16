const prisma = require('../prismaClient');

const completeLesson = async (req, res) => {
  try {
    const childId = req.user?.id;
    const lessonId = parseInt(req.body.lessonId);

    if (!childId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!lessonId || isNaN(lessonId)) {
      return res.status(400).json({ success: false, message: 'lessonId is required' });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        category: {
          include: { level: true },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const lessonLevel = lesson.category.level.levelNumber;
    if (lessonLevel > child.allowedLevel) {
      return res.status(403).json({
        success: false,
        message: `This lesson belongs to Level ${lessonLevel}. Child is only allowed up to Level ${child.allowedLevel}.`,
      });
    }

    const progress = await prisma.progress.upsert({
      where: { childId_lessonId: { childId, lessonId } },
      update: { isCompleted: true },
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

const getMyProgress = async (req, res) => {
  try {
    const childId = req.user?.id;

    if (!childId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const progress = await prisma.progress.findMany({
      where: { childId },
      include: {
        lesson: {
          include: {
            category: {
              include: { level: true },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const grouped = {};
    for (const p of progress) {
      const levelName = p.lesson.category.level.name;
      const categoryName = p.lesson.category.name;

      if (!grouped[levelName]) grouped[levelName] = {};
      if (!grouped[levelName][categoryName]) grouped[levelName][categoryName] = [];

      grouped[levelName][categoryName].push({
        progressId: p.id,
        lessonId: p.lessonId,
        lessonTitle: p.lesson.title,
        isCompleted: p.isCompleted,
        completedAt: p.completedAt,
      });
    }

    const totalLessons = progress.length;
    const completedLessons = progress.filter((p) => p.isCompleted).length;

    res.status(200).json({
      success: true,
      message: 'Progress retrieved successfully',
      summary: {
        totalLessons,
        completedLessons,
        completionPercentage: totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
      },
      data: grouped,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in get progress API',
      error: error.message,
    });
  }
};

module.exports = { completeLesson, getMyProgress };
