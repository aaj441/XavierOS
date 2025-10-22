import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Volume2,
  Music,
  Activity
} from 'lucide-react';
import useAudioStore from '../store/audioStore';

const AnalysisPage = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { recordings, analysisResults } = useAudioStore();

  useEffect(() => {
    // Simulate loading analysis data
    const loadAnalysis = async () => {
      setLoading(true);
      
      // Mock analysis data
      const mockAnalysis = {
        id: id || '1',
        filename: 'practice_session.wav',
        title: 'Daily Practice Session',
        overallScore: 85,
        detailedResults: {
          pitch: {
            averagePitch: 220,
            pitchConsistency: 0.88,
            pitchVariance: 45,
            pitchRange: { min: 180, max: 280 },
            pitchStability: 0.12,
            recommendations: [
              'Practice sustained notes with a metronome',
              'Work on pitch accuracy in higher registers'
            ]
          },
          rhythm: {
            tempo: 120,
            rhythmConsistency: 0.82,
            averageInterval: 0.5,
            onsetCount: 24,
            recommendations: [
              'Maintain steady tempo throughout performance',
              'Practice with metronome for better timing'
            ]
          },
          vocal: {
            volume: 0.65,
            zeroCrossingRate: 0.15,
            spectralCentroid: 1200,
            voiceActivity: true,
            brightness: 0.7,
            recommendations: [
              'Work on breath support for better projection',
              'Practice vocal exercises to improve tone quality'
            ]
          },
          frequency: {
            dominantFrequencies: [
              { frequency: 220, magnitude: 0.8 },
              { frequency: 440, magnitude: 0.6 },
              { frequency: 660, magnitude: 0.4 }
            ],
            spectralRolloff: 1500,
            spectralFlux: 0.3
          }
        },
        createdAt: new Date(),
        duration: 120
      };

      setTimeout(() => {
        setAnalysis(mockAnalysis);
        setLoading(false);
      }, 1000);
    };

    loadAnalysis();
  }, [id]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Analysis not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Voice Analysis</h1>
          <p className="text-xl text-purple-200">{analysis.title}</p>
        </div>

        {/* Overall Score */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Overall Performance Score</h2>
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(analysis.overallScore)} mb-4`}>
              <span className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </span>
            </div>
            <p className="text-purple-200">
              {analysis.overallScore >= 80 ? 'Excellent!' : 
               analysis.overallScore >= 60 ? 'Good work!' : 'Keep practicing!'}
            </p>
          </div>
        </div>

        {/* Detailed Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pitch Analysis */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Music className="text-purple-400 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-white">Pitch Analysis</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">
                    {analysis.detailedResults.pitch.averagePitch} Hz
                  </div>
                  <div className="text-sm text-purple-200">Average Pitch</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {(analysis.detailedResults.pitch.pitchConsistency * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-purple-200">Consistency</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-lg font-semibold text-white mb-2">Pitch Range</div>
                <div className="text-purple-200">
                  {analysis.detailedResults.pitch.pitchRange.min} Hz - {analysis.detailedResults.pitch.pitchRange.max} Hz
                </div>
              </div>
            </div>
          </div>

          {/* Rhythm Analysis */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Clock className="text-blue-400 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-white">Rhythm Analysis</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {analysis.detailedResults.rhythm.tempo} BPM
                  </div>
                  <div className="text-sm text-purple-200">Tempo</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {(analysis.detailedResults.rhythm.rhythmConsistency * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-purple-200">Consistency</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-lg font-semibold text-white mb-2">Rhythmic Events</div>
                <div className="text-purple-200">
                  {analysis.detailedResults.rhythm.onsetCount} detected beats
                </div>
              </div>
            </div>
          </div>

          {/* Vocal Quality */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Volume2 className="text-green-400 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-white">Vocal Quality</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {(analysis.detailedResults.vocal.volume * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-purple-200">Volume</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {analysis.detailedResults.vocal.spectralCentroid} Hz
                  </div>
                  <div className="text-sm text-purple-200">Brightness</div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-lg font-semibold text-white mb-2">Voice Activity</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.detailedResults.vocal.voiceActivity 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {analysis.detailedResults.vocal.voiceActivity ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>

          {/* Frequency Analysis */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <BarChart3 className="text-yellow-400 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-white">Frequency Analysis</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-lg font-semibold text-white mb-2">Dominant Frequencies</div>
                <div className="space-y-2">
                  {analysis.detailedResults.frequency.dominantFrequencies.slice(0, 3).map((freq, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-purple-200">{freq.frequency} Hz</span>
                      <div className="w-20 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${freq.magnitude * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Recommendations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(analysis.detailedResults).map(([category, data]) => (
              <div key={category} className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 capitalize">
                  {category} Improvements
                </h3>
                <ul className="space-y-2">
                  {data.recommendations?.map((rec, index) => (
                    <li key={index} className="text-purple-200 text-sm flex items-start">
                      <Target size={16} className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;

