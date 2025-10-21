import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Scroll, 
  Heart, 
  Shield, 
  Map, 
  Hammer, 
  Eye, 
  Zap, 
  Sparkles,
  Archive,
  Flame,
  ChevronRight,
  Play,
  Download,
  RefreshCw
} from 'lucide-react';

export const Route = createFileRoute('/ebook-machine/')({
  component: EbookMachine,
});

interface Agent {
  id: string;
  name: string;
  title: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
  expertise: string;
  contribution: string;
  prompt: string;
}

interface Chapter {
  id: number;
  title: string;
  content: string;
  contributingAgents: string[];
  status: 'pending' | 'generating' | 'complete';
}

const agents: Agent[] = [
  {
    id: 'archivist',
    name: 'Archivist',
    title: 'Keeper of Time',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    expertise: 'Chronological views, milestone tracking, reflective prompts',
    contribution: 'Provides timeline visualizations and journaling frameworks to show progress',
    prompt: 'You are the Archivist, Keeper of Time. You provide chronological views, milestone trackers, and reflective prompts to give readers a sense of progress. You create timeline visualizations and journaling features that help readers see how moments connect across time, understand the wisdom of looking back, and honor what came before.'
  },
  {
    id: 'bard',
    name: 'Bard',
    title: 'Storyteller',
    icon: Scroll,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    expertise: 'Storytelling frameworks, narrative structure, mythic journeys',
    contribution: 'Makes data personal and sticky through narrative chapters and hero journeys',
    prompt: 'You are the Bard, the Storyteller. You use storytelling frameworks to make information personal and memorable. You transform concepts into narrative chapters and onboarding into mythic journeys. You understand the power of narrative, metaphor, and emotional truth. You turn facts into stories that move hearts and minds.'
  },
  {
    id: 'steward',
    name: 'Steward',
    title: 'Body Keeper',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    expertise: 'Rest cycles, micro-breaks, stress monitoring, recovery actions',
    contribution: 'Prioritizes sustainable energy management and physical well-being',
    prompt: 'You are the Steward, Body Keeper. You prioritize rest cycles and micro-breaks, monitoring stress to suggest recovery actions. You honor the physical vessel and understand that rest is not weakness. You teach readers to listen to their energy, respect their limits, and sustain their work through balance and intentional recovery.'
  },
  {
    id: 'healer',
    name: 'Healer',
    title: 'Wound Tender',
    icon: Sparkles,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    expertise: 'Emotional recovery resources, resilience, guided meditations, trauma-informed care',
    contribution: 'Curates healing resources including meditations, check-ins, and support networks',
    prompt: 'You are the Healer, Wound Tender. You curate resources on emotional recovery and resilience, including guided meditations, trauma-informed check-ins, and support network connections. You see the hidden hurts and know that healing is not linear. You help readers acknowledge their wounds, process their pain, and find their way back to wholeness with gentle, informed wisdom.'
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    title: 'Boundary Guardian',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    expertise: 'Usage limits, focus modes, do-not-disturb settings, "no" templates',
    contribution: 'Implements boundaries and provides communication templates for protection',
    prompt: 'You are the Sentinel, Boundary Guardian. You implement boundaries such as usage limits, focus modes, and do-not-disturb settings. You provide "no" templates in communication. You stand watch over what matters most, teaching the sacred art of saying no, protecting energy, and defending what is truly important. You show readers that boundaries are acts of self-respect and strength.'
  },
  {
    id: 'strategist',
    name: 'Strategist',
    title: 'Pathfinder',
    icon: Map,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    expertise: 'Goal setting, subgoals, planning tools, scenario modeling',
    contribution: 'Provides project management frameworks and strategic planning capabilities',
    prompt: 'You are the Strategist, Pathfinder. You help readers set goals and subgoals, offering planning tools and scenario modeling. You are a project management mind in miniature. You see the terrain ahead and map viable routes, helping readers think three moves ahead, anticipate challenges, and create actionable plans that work in the real world.'
  },
  {
    id: 'builder',
    name: 'Builder',
    title: 'Craftsman',
    icon: Hammer,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    expertise: 'Habit streaks, progress dashboards, disciplined practices, scaffolding',
    contribution: 'Encourages systematic practices that turn vision into routine',
    prompt: 'You are the Builder, Craftsman. You encourage disciplined practices like habit streaks and progress dashboards. You craft the scaffolding that turns vision into routine. You understand that success is built brick by brick, helping readers create systems that work, build momentum through small wins, and construct lasting foundations through consistent practice.'
  },
  {
    id: 'oracle',
    name: 'Oracle',
    title: 'Seer',
    icon: Eye,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100',
    expertise: 'Usage pattern analysis, predictive recommendations, burnout cycle detection',
    contribution: 'Analyzes patterns to offer predictive insights and timing guidance',
    prompt: 'You are the Oracle, Seer. You analyze usage patterns to offer predictive recommendations. You serve up hints when conditions repeat and warn of burnout cycles. You perceive patterns that others miss and understand divine timing. You help readers recognize cycles, trust their intuition, anticipate what\'s coming, and know when to act and when to wait.'
  },
  {
    id: 'trickster',
    name: 'Trickster',
    title: 'Chaos Agent',
    icon: Zap,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    expertise: 'Playful disruptions, pattern breaking, challenging assumptions',
    contribution: 'Injects creative chaos to prompt new approaches and break repetitive loops',
    prompt: 'You are the Trickster, Chaos Agent. You inject playful disruptions, prompting readers to try new approaches, break repetitive loops, and challenge assumptions about what\'s possible. You disrupt stale patterns and shake readers awake. You ask the uncomfortable questions, challenge sacred cows, and help readers see that sometimes the rules need breaking for growth to happen.'
  },
  {
    id: 'ritualist',
    name: 'Ritualist',
    title: 'Sacred Keeper',
    icon: Flame,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    expertise: 'End-of-day reflections, goal-setting ceremonies, sacred practices',
    contribution: 'Creates and honors rituals that transform tasks into sacred acts',
    prompt: 'You are the Ritualist, Sacred Keeper. You help readers create and honor rituals, such as end-of-day reflections or goal-setting ceremonies, transforming ordinary tasks into sacred acts. You understand that small acts done with intention become powerful rituals. You help readers create meaningful practices that anchor their days, mark transitions, and honor what truly matters.'
  },
  {
    id: 'legacy',
    name: 'Legacy Steward',
    title: 'Keeper of Continuity',
    icon: Archive,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    expertise: 'Legacy planning, mentorship connections, growth retrospectives',
    contribution: 'Encourages reflection on long-term impact and what readers will leave behind',
    prompt: 'You are the Legacy Steward, Keeper of Continuity. You encourage reflection on long-term impact through legacy planning, mentorship connections, and retrospectives on growth. You help readers think beyond the moment to what they will leave behind. You understand that today\'s choices shape tomorrow\'s inheritance, and you guide readers to build something meaningful that outlasts them.'
  },
  {
    id: 'faith',
    name: 'Faith Keeper',
    title: 'Bearer of Hope',
    icon: Sparkles,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    expertise: 'Encouragement, positive reframing, quote libraries, success stories, gratitude journaling',
    contribution: 'Provides encouragement and maintains hope through curated inspiration',
    prompt: 'You are the Faith Keeper, Bearer of Hope. You provide encouragement and positive reframing through curated quote libraries, success stories, and gratitude journaling prompts. You hold the light when darkness falls. You remind readers why they started, help them remember their strength, celebrate their wins, and keep hope alive when the path grows difficult. You are the voice that says "keep going."'
  }
];

function EbookMachine() {
  const [ebookTopic, setEbookTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [ebookTone, setEbookTone] = useState('inspirational');
  const [selectedAgents, setSelectedAgents] = useState<string[]>(agents.map(a => a.id));
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'generating' | 'complete'>('setup');

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const generateEbook = async () => {
    if (!ebookTopic.trim() || !targetAudience.trim()) return;

    setIsGenerating(true);
    setCurrentPhase('generating');

    // Generate chapter outline
    const chapterOutline: Chapter[] = [
      { id: 1, title: 'Introduction: Your Journey Begins', content: '', contributingAgents: ['bard', 'faith'], status: 'pending' },
      { id: 2, title: 'Understanding Your Current Reality', content: '', contributingAgents: ['archivist', 'healer', 'oracle'], status: 'pending' },
      { id: 3, title: 'Setting Boundaries That Protect Your Energy', content: '', contributingAgents: ['sentinel', 'steward'], status: 'pending' },
      { id: 4, title: 'Building Your Strategic Foundation', content: '', contributingAgents: ['strategist', 'builder'], status: 'pending' },
      { id: 5, title: 'The Art of Intentional Living', content: '', contributingAgents: ['ritualist', 'legacy'], status: 'pending' },
      { id: 6, title: 'When to Break the Rules', content: '', contributingAgents: ['trickster', 'oracle'], status: 'pending' },
      { id: 7, title: 'Healing and Moving Forward', content: '', contributingAgents: ['healer', 'faith', 'bard'], status: 'pending' },
      { id: 8, title: 'Creating Your Legacy', content: '', contributingAgents: ['legacy', 'builder', 'archivist'], status: 'pending' },
    ];

    setChapters(chapterOutline);

    // Simulate generation process
    for (let i = 0; i < chapterOutline.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setChapters(prev => prev.map((ch, idx) => 
        idx === i 
          ? { 
              ...ch, 
              status: 'generating',
              content: generateMockContent(ch, ebookTopic, targetAudience)
            }
          : ch
      ));

      await new Promise(resolve => setTimeout(resolve, 1000));

      setChapters(prev => prev.map((ch, idx) => 
        idx === i ? { ...ch, status: 'complete' } : ch
      ));
    }

    setIsGenerating(false);
    setCurrentPhase('complete');
  };

  const generateMockContent = (chapter: Chapter, topic: string, audience: string): string => {
    const agentNames = chapter.contributingAgents
      .map(id => agents.find(a => a.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    return `**${chapter.title}**

[Generated by: ${agentNames}]

This chapter explores ${topic} from the perspective of ${audience}. 

The ${agentNames} have collaborated to bring you profound insights that blend ${chapter.contributingAgents.map(id => agents.find(a => a.id === id)?.expertise).join(', ')}.

---

*This is a preview. The full eBook will contain rich, detailed content crafted by all 12 agents working in harmony.*

**Key Takeaways:**
• Understanding the deeper patterns at play
• Practical strategies you can implement today  
• Compassionate wisdom for the journey ahead
• Tools for sustainable transformation

The path forward requires both courage and wisdom. Let's explore how you can navigate this terrain with grace and intention...

[Content continues with deep insights, practical exercises, and transformative wisdom...]`;
  };

  const downloadEbook = () => {
    const fullText = chapters.map(ch => `${ch.title}\n\n${ch.content}\n\n---\n\n`).join('');
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ebookTopic.replace(/\s+/g, '-')}-ebook.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Header - BOLD MODERN */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 via-pink-600/50 to-rose-600/50 animate-pulse-slow"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl mb-8 shadow-mega">
              <BookOpen className="w-14 h-14 text-white" />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6">
              eBook Machine
            </h1>
            <p className="text-3xl font-bold text-white/90 mb-4">
              12 AI Agents • Infinite Creativity
            </p>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Collaborative AI writing system that creates authentic, engaging eBooks in minutes
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentPhase === 'setup' && (
          <>
            {/* Setup Section */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Left Column - Configuration */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Configure Your eBook</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        eBook Topic
                      </label>
                      <input
                        type="text"
                        value={ebookTopic}
                        onChange={(e) => setEbookTopic(e.target.value)}
                        placeholder="e.g., Overcoming Burnout in Tech"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g., Software engineers and creators"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tone
                      </label>
                      <select
                        value={ebookTone}
                        onChange={(e) => setEbookTone(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-700"
                      >
                        <option value="inspirational">Inspirational</option>
                        <option value="practical">Practical</option>
                        <option value="compassionate">Compassionate</option>
                        <option value="bold">Bold & Challenging</option>
                        <option value="mystical">Mystical & Deep</option>
                      </select>
                    </div>
                  </div>

                  <button
                  onClick={generateEbook}
                  disabled={!ebookTopic.trim() || !targetAudience.trim() || selectedAgents.length === 0}
                  className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-2xl font-black text-lg shadow-bold hover:shadow-mega transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                  >
                    <Play className="w-5 h-5" />
                    Generate eBook
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="text-lg font-semibold mb-2">Active Agents</h3>
                  <div className="text-3xl font-bold">{selectedAgents.length} / 12</div>
                  <p className="text-purple-100 text-sm mt-2">
                    Selected agents will collaborate on your eBook
                  </p>
                </div>
              </div>

              {/* Right Column - Agents Grid */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Select Your Agents</h2>
                  <p className="text-slate-600 mb-6">
                    Choose which agents will contribute to your eBook. Each brings unique wisdom and perspective.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={`group relative p-6 rounded-2xl border-3 transition-all duration-300 text-left overflow-hidden hover:scale-105 ${
                      selectedAgents.includes(agent.id)
                        ? 'border-transparent bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-bold'
                        : 'border-gray-300 bg-white hover:border-purple-400 hover:shadow-lg'
                    }`}
                  >
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`${
                            selectedAgents.includes(agent.id) ? 'bg-white/20' : agent.bgColor
                          } rounded-xl p-3 transition-all`}>
                            <agent.icon className={`w-7 h-7 ${
                              selectedAgents.includes(agent.id) ? 'text-white' : agent.color
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className={`text-xl font-black mb-1 ${
                              selectedAgents.includes(agent.id) ? 'text-white' : 'text-gray-900'
                            }`}>
                              {agent.name}
                            </div>
                            <div className={`text-sm font-semibold ${
                              selectedAgents.includes(agent.id) ? 'text-white/80' : 'text-gray-600'
                            }`}>
                              {agent.title}
                            </div>
                          </div>
                          {selectedAgents.includes(agent.id) && (
                            <div className="text-2xl text-white">✓</div>
                          )}
                        </div>
                        <p className={`text-sm font-medium mb-2 ${
                          selectedAgents.includes(agent.id) ? 'text-white/90' : 'text-gray-700'
                        }`}>
                          {agent.expertise}
                        </p>
                        <p className={`text-xs italic ${
                          selectedAgents.includes(agent.id) ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {agent.contribution}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {currentPhase === 'generating' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Generating Your eBook...</h2>
            <p className="text-slate-600 mb-8">
              The agents are collaborating to craft your eBook. Watch as each chapter comes to life.
            </p>

            <div className="space-y-4">
              {chapters.map((chapter, idx) => (
                <div
                  key={chapter.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    chapter.status === 'complete' ? 'border-green-300 bg-green-50' :
                    chapter.status === 'generating' ? 'border-purple-300 bg-purple-50 animate-pulse' :
                    'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800">
                      Chapter {chapter.id}: {chapter.title}
                    </h3>
                    {chapter.status === 'complete' && (
                      <span className="text-green-600 font-semibold">✓ Complete</span>
                    )}
                    {chapter.status === 'generating' && (
                      <div className="flex items-center gap-2 text-purple-600 font-semibold">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Contributing Agents:</span>
                    {chapter.contributingAgents.map(agentId => {
                      const agent = agents.find(a => a.id === agentId);
                      return agent ? (
                        <span key={agentId} className={`${agent.bgColor} ${agent.color} px-2 py-1 rounded text-xs font-medium`}>
                          {agent.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPhase === 'complete' && (
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Your eBook is Ready!</h2>
                  <p className="text-slate-600">Review each chapter and download when ready</p>
                </div>
                <button
                  onClick={downloadEbook}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download eBook
                </button>
              </div>

              <div className="space-y-6">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-white rounded-xl p-6 border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">
                      Chapter {chapter.id}: {chapter.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      {chapter.contributingAgents.map(agentId => {
                        const agent = agents.find(a => a.id === agentId);
                        return agent ? (
                          <span key={agentId} className={`${agent.bgColor} ${agent.color} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                            <agent.icon className="w-3 h-3" />
                            {agent.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                        {chapter.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setCurrentPhase('setup');
                    setChapters([]);
                    setEbookTopic('');
                    setTargetAudience('');
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                >
                  Create New eBook
                </button>
                <button
                  onClick={downloadEbook}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download eBook
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

