const express = require('express');
const { body, validationResult } = require('express-validator');
const PantheonicVocalCoachingService = require('../services/pantheonicCoachingService');
const logger = require('../utils/logger');

const router = express.Router();
const pantheonicService = new PantheonicVocalCoachingService();

/**
 * @route POST /api/pantheonic/generate-insights
 * @desc Generate insights from selected pantheonic agents
 * @access Private
 */
router.post('/generate-insights',
  [
    body('selectedAgents').isArray().withMessage('Selected agents must be an array'),
    body('selectedAgents.*').isString().withMessage('Each agent must be a string'),
    body('vocalData').isObject().withMessage('Vocal data is required'),
    body('userProfile').optional().isObject(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { selectedAgents, vocalData, userProfile } = req.body;
      
      // Validate selected agents
      const validAgents = [
        'archivist', 'bard', 'steward', 'healer', 'sentinel', 'strategist',
        'builder', 'oracle', 'trickster', 'ritualist', 'legacy', 'faith'
      ];
      
      const invalidAgents = selectedAgents.filter(agent => !validAgents.includes(agent));
      if (invalidAgents.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid agents selected',
          invalidAgents
        });
      }

      // Generate insights
      const result = await pantheonicService.generatePantheonicInsights(
        selectedAgents,
        vocalData,
        userProfile || {}
      );

      res.status(200).json({
        success: true,
        message: 'Pantheonic insights generated successfully',
        data: result
      });

    } catch (error) {
      logger.error('Pantheonic insights generation failed:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to generate pantheonic insights',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route GET /api/pantheonic/agents
 * @desc Get available pantheonic agents
 * @access Private
 */
router.get('/agents', async (req, res) => {
  try {
    const agents = Object.entries(pantheonicService.agents).map(([id, agent]) => ({
      id,
      name: agent.name,
      title: agent.title,
      expertise: agent.expertise,
      focus: agent.focus,
      prompt: agent.prompt
    }));

    res.status(200).json({
      success: true,
      data: agents
    });

  } catch (error) {
    logger.error('Get pantheonic agents failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pantheonic agents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route POST /api/pantheonic/session
 * @desc Create a new pantheonic coaching session
 * @access Private
 */
router.post('/session',
  [
    body('selectedAgents').isArray().withMessage('Selected agents must be an array'),
    body('sessionType').optional().isString().withMessage('Session type must be a string'),
    body('goals').optional().isArray().withMessage('Goals must be an array'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { selectedAgents, sessionType = 'general', goals = [] } = req.body;
      
      const session = {
        id: Date.now().toString(),
        userId: req.user.id,
        selectedAgents,
        sessionType,
        goals,
        startTime: new Date(),
        status: 'active',
        insights: {},
        progress: 0
      };

      // TODO: Save session to database
      // await PantheonicSession.create(session);

      res.status(201).json({
        success: true,
        message: 'Pantheonic coaching session created',
        data: session
      });

    } catch (error) {
      logger.error('Create pantheonic session failed:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to create pantheonic session',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route PUT /api/pantheonic/session/:id/complete
 * @desc Complete a pantheonic coaching session
 * @access Private
 */
router.put('/session/:id/complete',
  [
    body('insights').isObject().withMessage('Insights are required'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('feedback').optional().isString().withMessage('Feedback must be a string'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { insights, rating, feedback } = req.body;
      
      // TODO: Update session in database
      const session = {
        id,
        userId: req.user.id,
        completedAt: new Date(),
        status: 'completed',
        insights,
        rating: rating || null,
        feedback: feedback || ''
      };

      res.status(200).json({
        success: true,
        message: 'Pantheonic coaching session completed',
        data: session
      });

    } catch (error) {
      logger.error('Complete pantheonic session failed:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to complete pantheonic session',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route GET /api/pantheonic/sessions
 * @desc Get user's pantheonic coaching sessions
 * @access Private
 */
router.get('/sessions', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // TODO: Fetch sessions from database with pagination
    const sessions = [
      {
        id: '1',
        selectedAgents: ['archivist', 'bard', 'steward'],
        sessionType: 'general',
        status: 'completed',
        rating: 5,
        feedback: 'Amazing insights from the agents!',
        startTime: new Date(Date.now() - 86400000),
        completedAt: new Date(Date.now() - 86400000 + 1800000), // 30 minutes later
        insights: {
          archivist: { title: 'Progress Tracking', recommendation: 'Keep documenting your journey' },
          bard: { title: 'Storytelling', recommendation: 'Connect emotions to lyrics' },
          steward: { title: 'Vocal Health', recommendation: 'Maintain breath support' }
        }
      },
      {
        id: '2',
        selectedAgents: ['oracle', 'trickster', 'faith'],
        sessionType: 'creative',
        status: 'active',
        rating: null,
        feedback: '',
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        completedAt: null,
        insights: {}
      }
    ];

    // Apply status filter
    let filteredSessions = sessions;
    if (status) {
      filteredSessions = sessions.filter(session => session.status === status);
    }

    res.status(200).json({
      success: true,
      data: {
        sessions: filteredSessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredSessions.length,
          pages: Math.ceil(filteredSessions.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get pantheonic sessions failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pantheonic sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/pantheonic/session/:id
 * @desc Get specific pantheonic coaching session
 * @access Private
 */
router.get('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Fetch session from database
    const session = {
      id,
      userId: req.user.id,
      selectedAgents: ['archivist', 'bard', 'steward'],
      sessionType: 'general',
      status: 'completed',
      rating: 5,
      feedback: 'Excellent session with valuable insights',
      startTime: new Date(Date.now() - 86400000),
      completedAt: new Date(Date.now() - 86400000 + 1800000),
      insights: {
        archivist: {
          title: 'Your Vocal Journey Timeline',
          content: 'Based on your practice history, you\'ve shown remarkable consistency.',
          recommendation: 'Continue tracking your daily practice - consistency is your superpower.',
          exercises: ['Daily practice log', 'Weekly progress videos', 'Monthly milestones']
        },
        bard: {
          title: 'Storytelling Through Song',
          content: 'Your emotional expression has deepened significantly.',
          recommendation: 'Practice connecting your own experiences to the songs you sing.',
          exercises: ['Lyric interpretation', 'Personal story connection', 'Emotional range exploration']
        },
        steward: {
          title: 'Vocal Health Assessment',
          content: 'Your breath support is strong, but watch for tension in your shoulders.',
          recommendation: 'Add 5 minutes of relaxation exercises before each practice session.',
          exercises: ['Diaphragmatic breathing', 'Shoulder relaxation', 'Vocal cord hydration']
        }
      }
    };

    res.status(200).json({
      success: true,
      data: session
    });

  } catch (error) {
    logger.error('Get pantheonic session failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pantheonic session',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/pantheonic/progress
 * @desc Get pantheonic coaching progress overview
 * @access Private
 */
router.get('/progress', async (req, res) => {
  try {
    // TODO: Calculate progress from database
    const progress = {
      totalSessions: 15,
      completedSessions: 13,
      averageRating: 4.6,
      favoriteAgents: ['archivist', 'bard', 'steward'],
      agentUsage: {
        archivist: 12,
        bard: 10,
        steward: 11,
        healer: 8,
        sentinel: 7,
        strategist: 9,
        builder: 10,
        oracle: 6,
        trickster: 5,
        ritualist: 4,
        legacy: 3,
        faith: 8
      },
      insightsGenerated: 156,
      goalsAchieved: 8,
      currentStreak: 5,
      longestStreak: 12
    };

    res.status(200).json({
      success: true,
      data: progress
    });

  } catch (error) {
    logger.error('Get pantheonic progress failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pantheonic progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

