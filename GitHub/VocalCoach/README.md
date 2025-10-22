# VocalCoach - AI-Powered Vocal Training Platform

## 🎤 Overview

VocalCoach is a comprehensive AI-powered vocal training platform that provides real-time audio analysis, personalized coaching exercises, and detailed progress tracking for singers of all levels. Built on the **Pantheonic Engine** - a revolutionary 12-agent collaborative system that embodies multiple educational pedagogical philosophies.

## ✨ Features

### 🎵 Real-time Audio Analysis
- **Pitch Detection**: Advanced pitch analysis with multiple algorithms (YIN, AMDF, ACF2, Dynamic Wavelet)
- **Rhythm Analysis**: Tempo detection and rhythm consistency measurement
- **Vocal Quality**: Volume, brightness, and voice activity analysis
- **Frequency Analysis**: Spectral analysis and dominant frequency detection

### 🧠 Pantheonic AI Coaching Engine
The revolutionary **Pantheonic Engine** integrates 12 specialized AI agents, each embodying different educational philosophies:

#### The 12 Pantheonic Agents:
1. **Archivist** (Keeper of Time) - Progress tracking and milestone celebration
2. **Bard** (Storyteller) - Song interpretation and emotional expression
3. **Steward** (Body Keeper) - Vocal health and breath support
4. **Healer** (Wound Tender) - Confidence building and anxiety management
5. **Sentinel** (Boundary Guardian) - Vocal safety and technique protection
6. **Strategist** (Pathfinder) - Goal setting and practice planning
7. **Builder** (Craftsman) - Daily routines and technique building
8. **Oracle** (Seer) - Pattern recognition and performance analysis
9. **Trickster** (Chaos Agent) - Creative experimentation and genre exploration
10. **Ritualist** (Sacred Keeper) - Sacred practice spaces and mindful singing
11. **Legacy Steward** (Keeper of Continuity) - Vocal legacy and knowledge sharing
12. **Faith Keeper** (Bearer of Hope) - Encouragement and passion maintenance

### 🎯 Educational Philosophy Integration
The Pantheonic Engine embodies multiple pedagogical approaches:
- **Constructivist Learning**: Collaborative agent insights for knowledge construction
- **Multiple Intelligences Theory**: Diverse agent expertise addressing different learning styles
- **Holistic Education**: Mind, body, and spirit integration through specialized agents
- **Personalized Learning**: Adaptive agent selection based on individual needs

### 📊 Comprehensive Dashboard
- **Performance Metrics**: Overall scores and skill breakdowns
- **History Tracking**: Complete recording and analysis history
- **Trend Analysis**: Progress visualization over time
- **Pantheonic Insights**: AI-powered recommendations from specialized agents

## 🏗️ Architecture

### Backend (Node.js/Express)
- **RESTful API**: Comprehensive API endpoints for all features
- **Real-time Communication**: Socket.IO for live audio streaming
- **Audio Processing**: Advanced audio analysis with pitchfinder and FFT
- **Database**: MongoDB for data persistence
- **Caching**: Redis for session management and performance
- **Authentication**: JWT-based secure authentication
- **File Upload**: Multer for audio file handling

### Frontend (React/Vite)
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **State Management**: Zustand for efficient state management
- **Real-time Updates**: Live audio visualization and feedback
- **Progressive Web App**: Offline capabilities and mobile optimization
- **Accessibility**: WCAG compliant design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- Redis (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aaj2127/VocalCoach.git
   cd VocalCoach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
VocalCoach/
├── server/                 # Backend application
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   ├── models/           # Database models
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
├── src/                   # Frontend application
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── store/           # State management
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
├── public/               # Static assets
└── uploads/             # File uploads directory
```

## 🔧 Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/vocalcoach

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Optional AI Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-token` - Token verification

### Audio Analysis
- `POST /api/audio/upload` - Upload audio file
- `POST /api/audio/analyze` - Analyze audio data
- `GET /api/audio` - Get user recordings
- `GET /api/audio/:id` - Get specific recording
- `DELETE /api/audio/:id` - Delete recording

### Analysis & Progress
- `GET /api/analysis/history` - Get analysis history
- `GET /api/analysis/:id` - Get detailed analysis
- `POST /api/analysis/compare` - Compare analyses
- `GET /api/analysis/trends` - Get progress trends

### Coaching
- `GET /api/coaching/exercises` - Get available exercises
- `POST /api/coaching/sessions` - Start coaching session
- `PUT /api/coaching/sessions/:id/complete` - Complete session
- `GET /api/coaching/progress` - Get coaching progress

### Pantheonic AI Coaching
- `GET /api/pantheonic/agents` - Get available pantheonic agents
- `POST /api/pantheonic/generate-insights` - Generate insights from selected agents
- `POST /api/pantheonic/session` - Create pantheonic coaching session
- `PUT /api/pantheonic/session/:id/complete` - Complete pantheonic session
- `GET /api/pantheonic/sessions` - Get user's pantheonic sessions
- `GET /api/pantheonic/progress` - Get pantheonic coaching progress

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy with one click

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual image
docker build -t vocalcoach .
docker run -p 5000:5000 vocalcoach
```

## 🧪 Testing

```bash
# Run backend tests
npm run test:server

# Run frontend tests
npm run test:client

# Run all tests
npm test
```

## 📈 Performance

- **Audio Processing**: Optimized for real-time analysis
- **Database**: Efficient queries with MongoDB indexing
- **Caching**: Redis for improved response times
- **CDN**: Static asset optimization
- **Compression**: Gzip compression for API responses

## 🔒 Security

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **HTTPS**: SSL/TLS encryption for all communications
- **CORS**: Properly configured cross-origin resource sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **pitchfinder**: Advanced pitch detection algorithms
- **fft-js**: Fast Fourier Transform implementation
- **React**: Frontend framework
- **Express**: Backend framework
- **MongoDB**: Database
- **Redis**: Caching layer
- **Tailwind CSS**: Styling framework

## 📞 Support

- **Documentation**: [Wiki](https://github.com/aaj2127/VocalCoach/wiki)
- **Issues**: [GitHub Issues](https://github.com/aaj2127/VocalCoach/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aaj2127/VocalCoach/discussions)
- **Email**: support@vocalcoach.app

---

**Built with ❤️ for singers everywhere**
