import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  BarChart3, 
  GraduationCap, 
  TrendingUp, 
  Clock,
  Target,
  Play,
  Calendar,
  Award,
  Activity
} from 'lucide-react';
import useAudioStore from '../store/audioStore';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRecordings: 15,
    averageScore: 82,
    practiceStreak: 7,
    totalPracticeTime: 1200
  });

  const [recentRecordings, setRecentRecordings] = useState([
    {
      id: '1',
      title: 'Daily Practice Session',
      score: 85,
      date: new Date(Date.now() - 86400000),
      duration: 120
    },
    {
      id: '2',
      title: 'Scale Practice',
      score: 78,
      date: new Date(Date.now() - 172800000),
      duration: 90
    },
    {
      id: '3',
      title: 'Song Practice',
      score: 92,
      date: new Date(Date.now() - 259200000),
      duration: 180
    }
  ]);

  const [upcomingGoals, setUpcomingGoals] = useState([
    { id: '1', title: 'Complete 10 pitch training sessions', progress: 7, total: 10 },
    { id: '2', title: 'Achieve 10 day practice streak', progress: 7, total: 10 },
    { id: '3', title: 'Improve rhythm consistency score', progress: 3, total: 5 }
  ]);

  const { recordings, fetchRecordings } = useAudioStore();

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-xl text-purple-200">Welcome back! Here's your vocal progress overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total Recordings</p>
                <p className="text-3xl font-bold text-white">{stats.totalRecordings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Mic className="text-purple-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-white">{stats.averageScore}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Practice Streak</p>
                <p className="text-3xl font-bold text-white">{stats.practiceStreak} days</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Practice Time</p>
                <p className="text-3xl font-bold text-white">{Math.floor(stats.totalPracticeTime / 60)}h</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="text-yellow-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Recordings */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Recent Recordings</h2>
                <Link
                  to="/analysis"
                  className="text-purple-300 hover:text-white transition-colors flex items-center"
                >
                  View all
                  <Play size={16} className="ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentRecordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {recording.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-purple-200">
                          <span className="flex items-center">
                            <Calendar size={16} className="mr-1" />
                            {recording.date.toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                      <div className={`w-16 h-16 ${getScoreBgColor(recording.score)} rounded-full flex items-center justify-center`}>
                        <span className={`text-xl font-bold ${getScoreColor(recording.score)}`}>
                          {recording.score}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Goals */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/recording"
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  <Mic size={20} className="mr-2" />
                  Start Recording
                </Link>
                <Link
                  to="/coaching"
                  className="w-full flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
                >
                  <GraduationCap size={20} className="mr-2" />
                  Practice Exercises
                </Link>
                <Link
                  to="/analysis"
                  className="w-full flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
                >
                  <BarChart3 size={20} className="mr-2" />
                  View Analysis
                </Link>
              </div>
            </div>

            {/* Goals Progress */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Goals Progress</h2>
                <Award className="text-yellow-400" size={20} />
              </div>
              <div className="space-y-4">
                {upcomingGoals.map((goal) => (
                  <div key={goal.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-purple-200">{goal.title}</span>
                      <span className="text-sm text-white font-semibold">
                        {goal.progress}/{goal.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(goal.progress / goal.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Streak */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Practice Streak</h2>
                <Activity className="text-green-400" size={20} />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {stats.practiceStreak}
                </div>
                <p className="text-purple-200">days in a row</p>
                <div className="mt-4">
                  <div className="flex justify-center space-x-1">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < stats.practiceStreak ? 'bg-green-400' : 'bg-gray-600'
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

export default Dashboard;

