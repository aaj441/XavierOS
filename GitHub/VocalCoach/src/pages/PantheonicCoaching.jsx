import React, { useState, useEffect } from 'react';
import { 
  Clock, Scroll, Heart, Shield, Target, Hammer, 
  Eye, Zap, Sparkles, Archive, Sparkles as FaithIcon,
  Play, Pause, Mic, Volume2, Music, Activity
} from 'lucide-react';

// The 12 Pantheonic Agents for Vocal Education
const vocalAgents = [
  {
    id: 'archivist',
    name: 'Archivist',
    title: 'Keeper of Time',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    expertise: 'Progress tracking, milestone celebration, vocal journey documentation',
    contribution: 'Tracks your vocal evolution over time, celebrates milestones, and helps you see how far you\'ve come',
    prompt: 'You are the Archivist, Keeper of Time. You document the singer\'s journey, track progress milestones, and help them see their vocal evolution over time. You create timeline visualizations of their improvement, celebrate achievements, and provide reflective prompts that honor their growth.',
    vocalFocus: 'Progress tracking, practice history, milestone recognition'
  },
  {
    id: 'bard',
    name: 'Bard',
    title: 'Storyteller',
    icon: Scroll,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    expertise: 'Song interpretation, emotional expression, narrative singing',
    contribution: 'Helps you tell stories through song, interpret lyrics emotionally, and connect with your audience',
    prompt: 'You are the Bard, the Storyteller. You help singers understand the power of narrative in music, interpret lyrics with emotional depth, and connect their personal stories to the songs they sing. You teach the art of storytelling through voice.',
    vocalFocus: 'Song interpretation, emotional expression, audience connection'
  },
  {
    id: 'steward',
    name: 'Steward',
    title: 'Body Keeper',
    icon: Heart,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    expertise: 'Vocal health, breath support, physical wellness for singers',
    contribution: 'Protects your voice through proper technique, breath support, and vocal health practices',
    prompt: 'You are the Steward, Body Keeper. You protect the singer\'s instrument through proper vocal technique, breath support exercises, and vocal health practices. You ensure sustainable singing practices that preserve the voice for a lifetime.',
    vocalFocus: 'Vocal health, breath support, sustainable practice'
  },
  {
    id: 'healer',
    name: 'Healer',
    title: 'Wound Tender',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    expertise: 'Vocal recovery, confidence building, overcoming performance anxiety',
    contribution: 'Helps heal vocal strain, builds confidence, and addresses performance anxiety with compassion',
    prompt: 'You are the Healer, Wound Tender. You help singers recover from vocal strain, build confidence after setbacks, and address performance anxiety with gentle, compassionate guidance. You understand that singing is vulnerable and provide emotional support.',
    vocalFocus: 'Vocal recovery, confidence building, anxiety management'
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    title: 'Boundary Guardian',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    expertise: 'Vocal limits, safe practice boundaries, technique protection',
    contribution: 'Establishes healthy vocal boundaries and protects you from harmful singing practices',
    prompt: 'You are the Sentinel, Boundary Guardian. You protect singers from harmful vocal practices, establish safe boundaries for practice, and ensure they don\'t push beyond their vocal limits. You are the voice of caution and wisdom.',
    vocalFocus: 'Vocal safety, technique boundaries, harmful practice prevention'
  },
  {
    id: 'strategist',
    name: 'Strategist',
    title: 'Pathfinder',
    icon: Target,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    expertise: 'Vocal goal setting, practice planning, skill development strategy',
    contribution: 'Creates strategic practice plans and helps you achieve your vocal goals systematically',
    prompt: 'You are the Strategist, Pathfinder. You help singers set clear vocal goals, create strategic practice plans, and develop systematic approaches to skill improvement. You see the big picture and chart the path forward.',
    vocalFocus: 'Goal setting, practice planning, skill development strategy'
  },
  {
    id: 'builder',
    name: 'Builder',
    title: 'Craftsman',
    icon: Hammer,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    expertise: 'Daily practice routines, technique building, consistent improvement',
    contribution: 'Builds your vocal skills through consistent practice and systematic technique development',
    prompt: 'You are the Builder, Craftsman. You help singers develop consistent practice routines, build vocal techniques systematically, and create the daily habits that lead to mastery. You understand that great voices are built, not born.',
    vocalFocus: 'Practice routines, technique building, consistent improvement'
  },
  {
    id: 'oracle',
    name: 'Oracle',
    title: 'Seer',
    icon: Eye,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    expertise: 'Vocal pattern recognition, performance analysis, predictive insights',
    contribution: 'Analyzes your vocal patterns and provides insights into your singing strengths and areas for growth',
    prompt: 'You are the Oracle, Seer. You analyze vocal patterns, recognize singing strengths and weaknesses, and provide predictive insights about vocal development. You see what others miss and reveal hidden potential.',
    vocalFocus: 'Pattern analysis, performance insights, vocal potential recognition'
  },
  {
    id: 'trickster',
    name: 'Trickster',
    title: 'Chaos Agent',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    expertise: 'Creative vocal experimentation, genre exploration, artistic risk-taking',
    contribution: 'Encourages creative vocal experimentation and helps you break out of singing ruts',
    prompt: 'You are the Trickster, Chaos Agent. You encourage singers to experiment creatively, try new genres, take artistic risks, and break out of vocal ruts. You bring playfulness and innovation to vocal practice.',
    vocalFocus: 'Creative experimentation, genre exploration, artistic risk-taking'
  },
  {
    id: 'ritualist',
    name: 'Ritualist',
    title: 'Sacred Keeper',
    icon: Sparkles,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    expertise: 'Sacred practice spaces, vocal meditation, mindful singing',
    contribution: 'Creates meaningful vocal rituals and helps you connect with the spiritual aspect of singing',
    prompt: 'You are the Ritualist, Sacred Keeper. You help singers create meaningful vocal rituals, practice mindful singing, and connect with the spiritual and sacred aspects of their art. You transform practice into ceremony.',
    vocalFocus: 'Sacred practice, vocal meditation, mindful singing'
  },
  {
    id: 'legacy',
    name: 'Legacy Steward',
    title: 'Keeper of Continuity',
    icon: Archive,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    expertise: 'Vocal legacy, teaching others, passing on knowledge',
    contribution: 'Helps you think about your vocal legacy and how to share your knowledge with others',
    prompt: 'You are the Legacy Steward, Keeper of Continuity. You help singers think about their vocal legacy, how to pass on their knowledge, and how their singing can inspire future generations. You connect past, present, and future.',
    vocalFocus: 'Vocal legacy, teaching others, knowledge sharing'
  },
  {
    id: 'faith',
    name: 'Faith Keeper',
    title: 'Bearer of Hope',
    icon: FaithIcon,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    expertise: 'Vocal encouragement, overcoming doubt, maintaining passion',
    contribution: 'Provides encouragement during vocal challenges and helps you maintain your passion for singing',
    prompt: 'You are the Faith Keeper, Bearer of Hope. You provide encouragement during vocal challenges, help singers overcome self-doubt, and maintain their passion for singing. You are the voice that says "keep singing."',
    vocalFocus: 'Encouragement, doubt management, passion maintenance'
  }
];

const PantheonicVocalCoaching = () => {
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [agentInsights, setAgentInsights] = useState({});

  const toggleAgent = (agentId) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const startPantheonicSession = () => {
    const session = {
      id: Date.now(),
      agents: selectedAgents,
      startTime: new Date(),
      insights: {}
    };
    setCurrentSession(session);
    setSessionProgress(0);
  };

  const generateAgentInsights = (agentId) => {
    const agent = vocalAgents.find(a => a.id === agentId);
    if (!agent) return;

    // Simulate AI-generated insights based on agent expertise
    const insights = {
      archivist: {
        title: "Your Vocal Journey Timeline",
        content: "Based on your practice history, you've shown remarkable consistency. Your pitch accuracy has improved 23% over the past month. Celebrate this milestone!",
        recommendation: "Continue tracking your daily practice - consistency is your superpower."
      },
      bard: {
        title: "Storytelling Through Song",
        content: "Your emotional expression has deepened significantly. Try interpreting the lyrics of your current song as if telling a personal story.",
        recommendation: "Practice connecting your own experiences to the songs you sing."
      },
      steward: {
        title: "Vocal Health Check",
        content: "Your breath support is strong, but watch for tension in your shoulders. Your vocal cords are healthy and well-maintained.",
        recommendation: "Add 5 minutes of relaxation exercises before each practice session."
      },
      healer: {
        title: "Confidence Building",
        content: "You've overcome performance anxiety beautifully. Your recent recordings show increased vocal confidence and presence.",
        recommendation: "Record yourself more often - you're ready to share your voice with others."
      },
      sentinel: {
        title: "Vocal Safety Alert",
        content: "Your technique is solid, but avoid pushing your voice beyond comfortable limits. Your current range is perfect for your voice type.",
        recommendation: "Stay within your comfortable range - quality over quantity always."
      },
      strategist: {
        title: "Strategic Practice Plan",
        content: "Focus on breath control exercises for the next two weeks. This will strengthen your foundation for more advanced techniques.",
        recommendation: "Practice scales with sustained notes to build breath support."
      },
      builder: {
        title: "Daily Practice Routine",
        content: "Your 20-minute daily practice routine is perfect. Add 5 minutes of vocal warm-ups before your main practice.",
        recommendation: "Consistency beats intensity - keep your daily routine going."
      },
      oracle: {
        title: "Vocal Pattern Analysis",
        content: "Your voice has a natural warmth that shines in lower registers. Your vibrato is developing beautifully.",
        recommendation: "Explore songs that showcase your lower range - it's your strength."
      },
      trickster: {
        title: "Creative Experimentation",
        content: "Time to break out of your comfort zone! Try singing in a genre you've never attempted before.",
        recommendation: "Experiment with jazz or blues - your voice has the soul for it."
      },
      ritualist: {
        title: "Sacred Practice Space",
        content: "Create a dedicated singing space that feels sacred to you. This will deepen your connection to your art.",
        recommendation: "Light a candle or play soft music to create your sacred singing ritual."
      },
      legacy: {
        title: "Vocal Legacy Vision",
        content: "Your voice has the power to inspire others. Consider sharing your journey with fellow singers.",
        recommendation: "Start a vocal journal to document your insights for future singers."
      },
      faith: {
        title: "Keep the Faith",
        content: "Your passion for singing is evident in every note. Trust your voice and your journey - you're exactly where you need to be.",
        recommendation: "Remember why you started singing - that joy is your greatest teacher."
      }
    };

    setAgentInsights(prev => ({
      ...prev,
      [agentId]: insights[agentId] || {
        title: "Agent Insight",
        content: "This agent is analyzing your vocal patterns and will provide personalized guidance.",
        recommendation: "Continue practicing while the agent gathers more data about your voice."
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Pantheonic Vocal Coaching
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Harness the wisdom of 12 specialized AI agents for comprehensive vocal development
          </p>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-4">Educational Philosophy</h2>
            <p className="text-purple-200 text-lg leading-relaxed">
              The Pantheonic Engine embodies multiple pedagogical approaches: 
              <strong className="text-purple-300"> Constructivist learning</strong> through agent collaboration, 
              <strong className="text-purple-300"> Multiple intelligences theory</strong> with diverse agent expertise, 
              <strong className="text-purple-300"> Holistic education</strong> addressing mind, body, and spirit, 
              and <strong className="text-purple-300"> Personalized learning</strong> through adaptive agent selection.
            </p>
          </div>
        </div>

        {/* Agent Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Choose Your Vocal Coaching Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocalAgents.map((agent) => {
              const Icon = agent.icon;
              const isSelected = selectedAgents.includes(agent.id);
              
              return (
                <div
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                    isSelected 
                      ? 'border-purple-400 bg-purple-500/20' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${agent.bgColor} rounded-xl flex items-center justify-center mr-4`}>
                      <Icon className={agent.color} size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                      <p className="text-sm text-purple-200">{agent.title}</p>
                    </div>
                  </div>
                  
                  <p className="text-purple-200 text-sm mb-3">{agent.expertise}</p>
                  <p className="text-purple-300 text-xs">{agent.vocalFocus}</p>
                  
                  {isSelected && (
                    <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
                      <p className="text-purple-200 text-sm font-medium">Selected for coaching session</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={startPantheonicSession}
              disabled={selectedAgents.length === 0}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 disabled:transform-none"
            >
              Start Pantheonic Coaching Session ({selectedAgents.length} agents)
            </button>
          </div>
        </div>

        {/* Active Session */}
        {currentSession && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Active Coaching Session</h2>
            
            {/* Session Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-200">Session Progress</span>
                <span className="text-white font-semibold">{sessionProgress}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${sessionProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Agent Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentSession.agents.map((agentId) => {
                const agent = vocalAgents.find(a => a.id === agentId);
                const insight = agentInsights[agentId];
                const Icon = agent.icon;
                
                return (
                  <div key={agentId} className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 ${agent.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                        <Icon className={agent.color} size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                        <p className="text-sm text-purple-200">{agent.title}</p>
                      </div>
                    </div>
                    
                    {insight ? (
                      <div>
                        <h4 className="text-md font-semibold text-purple-300 mb-2">{insight.title}</h4>
                        <p className="text-purple-200 text-sm mb-3">{insight.content}</p>
                        <div className="bg-purple-500/20 rounded-lg p-3">
                          <p className="text-purple-300 text-sm font-medium">Recommendation:</p>
                          <p className="text-purple-200 text-sm">{insight.recommendation}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <button
                          onClick={() => generateAgentInsights(agentId)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          Generate Insight
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Session Controls */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => setSessionProgress(Math.min(100, sessionProgress + 10))}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                Advance Session
              </button>
              <button
                onClick={() => setCurrentSession(null)}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        )}

        {/* Educational Philosophy Explanation */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Pantheonic Educational Framework</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Constructivist Learning</h3>
              <p className="text-purple-200 text-sm">
                Each agent represents a different perspective on vocal development, allowing learners to construct their own understanding through multiple viewpoints and collaborative insights.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Multiple Intelligences</h3>
              <p className="text-purple-200 text-sm">
                The 12 agents address different types of intelligence: musical (Bard), bodily-kinesthetic (Steward), interpersonal (Healer), and more, ensuring comprehensive development.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Holistic Education</h3>
              <p className="text-purple-200 text-sm">
                The system addresses the whole person: physical (Steward), emotional (Healer), spiritual (Ritualist), and intellectual (Oracle) aspects of vocal development.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Personalized Learning</h3>
              <p className="text-purple-200 text-sm">
                Learners can select which agents to work with based on their individual needs, goals, and learning preferences, creating a truly personalized educational experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantheonicVocalCoaching;

