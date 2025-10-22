import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  Target, 
  Award, 
  TrendingUp,
  BookOpen,
  CheckCircle,
  Circle
} from 'lucide-react';

const Coaching = () => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [progress, setProgress] = useState({
    totalSessions: 25,
    completedSessions: 23,
    averageRating: 4.2,
    totalPracticeTime: 450,
    currentStreak: 7,
    longestStreak: 15
  });

  useEffect(() => {
    // Mock exercises data
    const mockExercises = [
      {
        id: '1',
        title: 'Basic Scale Practice',
        description: 'Practice major scales to improve pitch accuracy',
        category: 'pitch',
        difficulty: 'beginner',
        skill: 'pitch',
        duration: 10,
        instructions: [
          'Start with C major scale',
          'Sing each note clearly',
          'Focus on pitch accuracy',
          'Use a piano or app for reference'
        ],
        tips: [
          'Take deep breaths before each note',
          'Maintain steady tempo',
          'Listen carefully to each pitch'
        ],
        videoUrl: '/videos/scale_practice.mp4',
        audioUrl: '/audio/scale_practice.mp3',
        completed: false
      },
      {
        id: '2',
        title: 'Breath Support Training',
        description: 'Exercises to improve breath control and support',
        category: 'breathing',
        difficulty: 'intermediate',
        skill: 'volume',
        duration: 15,
        instructions: [
          'Stand with good posture',
          'Take deep diaphragmatic breaths',
          'Practice sustained notes',
          'Focus on steady air flow'
        ],
        tips: [
          'Keep shoulders relaxed',
          'Engage core muscles',
          'Don\'t force the breath'
        ],
        videoUrl: '/videos/breath_support.mp4',
        audioUrl: '/audio/breath_support.mp3',
        completed: true
      },
      {
        id: '3',
        title: 'Rhythm and Timing',
        description: 'Practice rhythmic patterns with metronome',
        category: 'rhythm',
        difficulty: 'intermediate',
        skill: 'rhythm',
        duration: 12,
        instructions: [
          'Set metronome to 60 BPM',
          'Clap along with the beat',
          'Practice different rhythmic patterns',
          'Gradually increase tempo'
        ],
        tips: [
          'Start slow and build up speed',
          'Keep steady rhythm',
          'Use body movement to feel the beat'
        ],
        videoUrl: '/videos/rhythm_training.mp4',
        audioUrl: '/audio/rhythm_training.mp3',
        completed: false
      }
    ];

    setExercises(mockExercises);
  }, []);

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentSession({
      exerciseId: exercise.id,
      startTime: new Date(),
      duration: 0,
      status: 'in_progress'
    });
  };

  const completeExercise = () => {
    if (currentSession) {
      setCurrentSession(prev => ({
        ...prev,
        status: 'completed',
        endTime: new Date()
      }));
      
      // Mark exercise as completed
      setExercises(prev => prev.map(ex => 
        ex.id === selectedExercise.id ? { ...ex, completed: true } : ex
      ));
      
      setSelectedExercise(null);
      setCurrentSession(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'pitch': return '🎵';
      case 'breathing': return '🫁';
      case 'rhythm': return '🥁';
      case 'volume': return '📢';
      default: return '🎤';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Vocal Coaching</h1>
          <p className="text-xl text-purple-200">Practice exercises tailored to improve your singing skills</p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total Sessions</p>
                <p className="text-3xl font-bold text-white">{progress.totalSessions}</p>
              </div>
              <BookOpen className="text-purple-400" size={24} />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-white">{progress.completedSessions}</p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-white">{progress.averageRating}</p>
              </div>
              <Award className="text-yellow-400" size={24} />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Practice Time</p>
                <p className="text-3xl font-bold text-white">{Math.floor(progress.totalPracticeTime / 60)}h</p>
              </div>
              <Clock className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exercises List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6">Available Exercises</h2>
              
              <div className="space-y-4">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{getCategoryIcon(exercise.category)}</span>
                          <h3 className="text-xl font-semibold text-white">{exercise.title}</h3>
                          {exercise.completed && (
                            <CheckCircle className="text-green-400 ml-2" size={20} />
                          )}
                        </div>
                        
                        <p className="text-purple-200 mb-4">{exercise.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </span>
                          <span className="flex items-center text-purple-200 text-sm">
                            <Clock size={16} className="mr-1" />
                            {exercise.duration} min
                          </span>
                          <span className="text-purple-200 text-sm capitalize">
                            {exercise.skill} training
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startExercise(exercise)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                          >
                            <Play size={16} className="mr-1" />
                            Start Exercise
                          </button>
                          
                          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Exercise Player */}
          <div className="space-y-6">
            {selectedExercise && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {selectedExercise.title}
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-2">Instructions</h4>
                    <ol className="space-y-2">
                      {selectedExercise.instructions.map((instruction, index) => (
                        <li key={index} className="text-purple-200 text-sm flex items-start">
                          <span className="text-purple-400 mr-2">{index + 1}.</span>
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-2">Tips</h4>
                    <ul className="space-y-2">
                      {selectedExercise.tips.map((tip, index) => (
                        <li key={index} className="text-purple-200 text-sm flex items-start">
                          <Target size={16} className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center"
                    >
                      {isPlaying ? <Pause size={16} className="mr-1" /> : <Play size={16} className="mr-1" />}
                      {isPlaying ? 'Pause' : 'Play'} Audio
                    </button>
                    
                    <button
                      onClick={completeExercise}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Practice Streak */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Practice Streak</h2>
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {progress.currentStreak}
                </div>
                <p className="text-purple-200">days in a row</p>
                <div className="mt-4">
                  <div className="flex justify-center space-x-1">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < progress.currentStreak ? 'bg-green-400' : 'bg-gray-600'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coaching;

