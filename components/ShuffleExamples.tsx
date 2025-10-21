import { Store, Utensils, Heart, GraduationCap, Briefcase, Home, Palette, Wrench, Sparkles } from "lucide-react";

interface ShuffleExample {
  category: string;
  demographics: string;
  color: string;
}

interface ShuffleExampleSection {
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  examples: ShuffleExample[];
}

interface ShuffleExamplesProps {
  onExampleClick: (category: string, demographics: string) => void;
  compact?: boolean;
}

export function ShuffleExamples({ onExampleClick, compact = false }: ShuffleExamplesProps) {
  const exampleSections: ShuffleExampleSection[] = [
    {
      icon: Store,
      category: "Retail & E-commerce",
      examples: [
        { category: "boutique clothing stores", demographics: "in downtown areas", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
        { category: "organic grocery stores", demographics: "family-owned", color: "bg-green-100 text-green-700 hover:bg-green-200" },
        { category: "local bookstores", demographics: "independent", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
      ]
    },
    {
      icon: Utensils,
      category: "Food & Dining",
      examples: [
        { category: "farm-to-table restaurants", demographics: "in California", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
        { category: "craft breweries", demographics: "microbrewery", color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
        { category: "vegan cafes", demographics: "small business", color: "bg-lime-100 text-lime-700 hover:bg-lime-200" },
      ]
    },
    {
      icon: Heart,
      category: "Health & Wellness",
      examples: [
        { category: "dental clinics", demographics: "private practice", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
        { category: "yoga studios", demographics: "boutique", color: "bg-teal-100 text-teal-700 hover:bg-teal-200" },
        { category: "chiropractic offices", demographics: "local", color: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
      ]
    },
    {
      icon: GraduationCap,
      category: "Education & Training",
      examples: [
        { category: "music schools", demographics: "private instruction", color: "bg-violet-100 text-violet-700 hover:bg-violet-200" },
        { category: "tutoring centers", demographics: "K-12", color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
        { category: "coding bootcamps", demographics: "online and in-person", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
      ]
    },
    {
      icon: Briefcase,
      category: "Professional Services",
      examples: [
        { category: "law firms", demographics: "small practice", color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
        { category: "accounting firms", demographics: "CPA", color: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200" },
        { category: "real estate agencies", demographics: "independent", color: "bg-stone-100 text-stone-700 hover:bg-stone-200" },
      ]
    },
    {
      icon: Home,
      category: "Home & Garden",
      examples: [
        { category: "landscaping companies", demographics: "residential", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
        { category: "interior designers", demographics: "boutique", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" },
        { category: "home renovation contractors", demographics: "local", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
      ]
    },
    {
      icon: Palette,
      category: "Creative & Arts",
      examples: [
        { category: "art galleries", demographics: "contemporary", color: "bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200" },
        { category: "photography studios", demographics: "portrait and wedding", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
        { category: "graphic design agencies", demographics: "small team", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
      ]
    },
    {
      icon: Wrench,
      category: "Trades & Services",
      examples: [
        { category: "auto repair shops", demographics: "independent", color: "bg-red-100 text-red-700 hover:bg-red-200" },
        { category: "plumbing services", demographics: "local", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
        { category: "electrical contractors", demographics: "residential and commercial", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
      ]
    },
  ];

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {exampleSections.map((section, idx) => (
        <div key={idx}>
          <div className="flex items-center space-x-2 mb-2">
            <section.icon className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-gray-500`} />
            <h4 className={`${compact ? "text-xs" : "text-sm"} font-semibold text-gray-700`}>{section.category}</h4>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {section.examples.map((example, exIdx) => (
              <button
                key={exIdx}
                type="button"
                onClick={() => onExampleClick(example.category, example.demographics)}
                className={`${example.color} ${compact ? "px-2 py-1.5" : "px-3 py-2"} rounded-lg text-left transition-all duration-200 group`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${compact ? "text-xs" : "text-sm"} font-medium`}>{example.category}</p>
                    <p className={`${compact ? "text-xs" : "text-xs"} opacity-75`}>{example.demographics}</p>
                  </div>
                  <Sparkles className={`${compact ? "h-3 w-3" : "h-4 w-4"} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
