const prisma = require('../prismaClient');

// Minimum score required to unlock the next level
const PASS_SCORE = 70;

const submitAssessment = async (req, res) => {
  try {
   const childId = req.user.id; // من الـ token
const { score, level } = req.body;
    if (!childId || score === undefined || !level) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: childId, score, and level are required',
      });
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: 'Score must be a number between 0 and 100',
      });
    }

    // Verify child exists
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    // Save the assessment record
    const assessment = await prisma.assessment.create({
      data: { childId, score, level },
    });

    // Only unlock the next level if the child passed
    let levelUnlocked = false;
    if (score >= PASS_SCORE) {
      const nextLevel = level + 1;
      // Only advance if next level is actually higher than what is already allowed
      if (nextLevel > child.allowedLevel) {
        await prisma.child.update({
          where: { id: childId },
          data: { allowedLevel: nextLevel },
        });
        levelUnlocked = true;
      }
    }

    res.status(201).json({
      success: true,
      message: levelUnlocked
        ? `Assessment submitted. Level ${level + 1} unlocked!`
        : score >= PASS_SCORE
        ? 'Assessment submitted. Child already has this level or higher.'
        : `Assessment submitted. Score ${score} is below the passing threshold of ${PASS_SCORE}.`,
      data: assessment,
      levelUnlocked,
      currentAllowedLevel: levelUnlocked ? level + 1 : child.allowedLevel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error in submit assessment API',
      error: error.message,
    });
  }
};

// Get all assessments for a child (used by parent dashboard)
const getChildAssessments = async (req, res) => {
  try {
    const childId = +req.params.childId;

    if (!childId) {
      return res.status(400).json({ success: false, message: 'childId is required' });
    }

    const assessments = await prisma.assessment.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      data: assessments,
    });
  } catch (error) {
    // Fixed: was two properties both named "message" — second overwrote the first
    res.status(500).json({
      success: false,
      message: 'Error in get assessments API',
      error: error.message,
    });
  }
};

module.exports = {
  submitAssessment,
  getChildAssessments,
};