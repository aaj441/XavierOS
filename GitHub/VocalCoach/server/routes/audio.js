const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AudioAnalysisService = require('../services/audioAnalysisService');
const logger = require('../utils/logger');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const audioAnalysisService = new AudioAnalysisService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/webm',
      'audio/m4a',
      'audio/aac'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  }
});

/**
 * @route POST /api/audio/upload
 * @desc Upload and analyze audio file
 * @access Private
 */
router.post('/upload', 
  upload.single('audio'),
  [
    body('title').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().isString().trim().isLength({ max: 500 }),
    body('tags').optional().isArray(),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file uploaded'
        });
      }

      logger.info(`Audio upload started: ${req.file.originalname}`);

      // Read the uploaded file
      const audioBuffer = fs.readFileSync(req.file.path);
      
      // Analyze the audio
      const analysisResults = await audioAnalysisService.analyzeAudio(
        audioBuffer, 
        req.file.originalname
      );

      // Save analysis results to database (you would implement this)
      const audioRecord = {
        userId: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        title: req.body.title || req.file.originalname,
        description: req.body.description || '',
        tags: req.body.tags || [],
        analysisResults: analysisResults,
        uploadedAt: new Date(),
      };

      // TODO: Save to database
      // const savedRecord = await AudioRecord.create(audioRecord);

      // Clean up temporary file if needed
      // fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        message: 'Audio uploaded and analyzed successfully',
        data: {
          id: 'temp-id', // savedRecord._id,
          filename: req.file.filename,
          originalName: req.file.originalname,
          analysis: analysisResults,
          uploadTime: audioRecord.uploadedAt,
        }
      });

    } catch (error) {
      logger.error('Audio upload failed:', error);
      
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: 'Audio upload failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route POST /api/audio/analyze
 * @desc Analyze audio data from buffer
 * @access Private
 */
router.post('/analyze',
  [
    body('audioData').isString().withMessage('Audio data is required'),
    body('filename').isString().withMessage('Filename is required'),
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

      const { audioData, filename } = req.body;
      
      // Convert base64 audio data to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');
      
      // Analyze the audio
      const analysisResults = await audioAnalysisService.analyzeAudio(
        audioBuffer, 
        filename
      );

      res.status(200).json({
        success: true,
        message: 'Audio analysis completed successfully',
        data: analysisResults
      });

    } catch (error) {
      logger.error('Audio analysis failed:', error);
      
      res.status(500).json({
        success: false,
        message: 'Audio analysis failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route GET /api/audio/:id
 * @desc Get audio record by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Fetch from database
    // const audioRecord = await AudioRecord.findById(id).where({ userId: req.user.id });
    
    // Mock response for now
    const audioRecord = {
      id,
      filename: 'sample.wav',
      originalName: 'sample.wav',
      title: 'Sample Recording',
      description: 'A sample audio recording',
      analysisResults: {
        pitch: { averagePitch: 220, pitchConsistency: 0.85 },
        rhythm: { tempo: 120, rhythmConsistency: 0.75 },
        vocal: { volume: 0.5, voiceActivity: true },
        overallScore: 80
      },
      uploadedAt: new Date(),
    };

    if (!audioRecord) {
      return res.status(404).json({
        success: false,
        message: 'Audio record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: audioRecord
    });

  } catch (error) {
    logger.error('Get audio record failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audio record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/audio
 * @desc Get user's audio records
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'uploadedAt', sortOrder = 'desc' } = req.query;
    
    // TODO: Implement pagination and sorting with database
    // const audioRecords = await AudioRecord.find({ userId: req.user.id })
    //   .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    //   .limit(limit * 1)
    //   .skip((page - 1) * limit);

    // Mock response for now
    const audioRecords = [
      {
        id: '1',
        filename: 'recording1.wav',
        originalName: 'My Recording 1.wav',
        title: 'Practice Session 1',
        description: 'Daily vocal practice',
        analysisResults: {
          overallScore: 85,
          pitch: { averagePitch: 220, pitchConsistency: 0.9 },
          rhythm: { tempo: 120, rhythmConsistency: 0.8 },
        },
        uploadedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        id: '2',
        filename: 'recording2.wav',
        originalName: 'My Recording 2.wav',
        title: 'Practice Session 2',
        description: 'Scale practice',
        analysisResults: {
          overallScore: 78,
          pitch: { averagePitch: 200, pitchConsistency: 0.75 },
          rhythm: { tempo: 110, rhythmConsistency: 0.7 },
        },
        uploadedAt: new Date(Date.now() - 172800000), // 2 days ago
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        records: audioRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: audioRecords.length,
          pages: Math.ceil(audioRecords.length / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get audio records failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audio records',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route DELETE /api/audio/:id
 * @desc Delete audio record
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Delete from database and file system
    // const audioRecord = await AudioRecord.findById(id).where({ userId: req.user.id });
    // if (audioRecord) {
    //   fs.unlinkSync(audioRecord.filePath);
    //   await AudioRecord.findByIdAndDelete(id);
    // }

    res.status(200).json({
      success: true,
      message: 'Audio record deleted successfully'
    });

  } catch (error) {
    logger.error('Delete audio record failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete audio record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

