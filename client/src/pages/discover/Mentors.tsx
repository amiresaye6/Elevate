import { useEffect, useState, useMemo } from "react";
import { getMentors, getStacks } from "../../services/mentorService"; 
import type { MentorProfile } from "../../types/mentor.types";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Mentors() {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [dbStacks, setDbStacks] = useState<{ id: string; name: string }[]>([]); 
  const [loading, setLoading] = useState(true);

  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 150 });
  const [ratingBounds, setRatingBounds] = useState({ min: 0, max: 5 });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]); 
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sessionPrice, setSessionPrice] = useState(150); 
  const [sortBy, setSortBy] = useState("Highest Rated");

  const [showAllStacks, setShowAllStacks] = useState(false);

  useEffect(() => {
    getMentors()
      .then((res: unknown) => {
        const rawData = res as unknown;
        let mentorsList: MentorProfile[] = [];

        if (Array.isArray(rawData)) {
          mentorsList = rawData;
        } else if (typeof rawData === 'object' && rawData !== null) {
          const responseData = rawData as { data?: unknown };
          if (Array.isArray(responseData.data)) {
            mentorsList = responseData.data as MentorProfile[];
          } else if (typeof responseData.data === 'object' && responseData.data !== null) {
            const nested = responseData.data as { data?: unknown };
            if (Array.isArray(nested.data)) {
              mentorsList = nested.data as MentorProfile[];
            }
          }
        }
        setMentors(mentorsList);

        if (mentorsList.length > 0) {
          const prices = mentorsList.map((m) => Number(m.hourlyRate || 0));
          const ratings = mentorsList.map((m) => Number(m.averageRating || 0));

          const minP = Math.min(...prices);
          const maxP = Math.max(...prices);
          const minR = Math.min(...ratings);
          const maxR = Math.max(...ratings);

          setPriceBounds({ min: minP, max: maxP });
          setRatingBounds({ min: minR, max: maxR });
          
          setSessionPrice(maxP);
        }
      })
      .catch((err) => console.error("Error fetching mentors:", err))
      .finally(() => setLoading(false));

    getStacks()
      .then((res: unknown) => {
        const rawData = res as unknown;
        let stacksList: { id: string; name: string }[] = [];

        if (Array.isArray(rawData)) {
          stacksList = rawData;
        } else if (typeof rawData === 'object' && rawData !== null) {
          const responseData = rawData as { data?: unknown };
          if (Array.isArray(responseData.data)) {
            stacksList = responseData.data as { id: string; name: string }[];
          } else if (typeof responseData.data === 'object' && responseData.data !== null) {
            const nested = responseData.data as { data?: unknown };
            if (Array.isArray(nested.data)) {
              stacksList = nested.data as { id: string; name: string }[];
            }
          }
        }
        setDbStacks(stacksList);
      })
      .catch((err) => console.error("Error fetching stacks:", err));
  }, []);

  const ratingOptions = useMemo(() => {
    const options = [];
    const start = Math.floor(ratingBounds.max);
    const end = Math.ceil(ratingBounds.min);
    
    for (let r = start; r >= end; r -= 0.5) {
      if (r > 0 && r < 5) { 
        options.push(r);
      }
    }
    return options.length > 0 ? options.slice(0, 3) : [4.5, 4.0, 3.5];
  }, [ratingBounds]);

  const filteredMentors = useMemo(() => {
    let result = [...mentors];

    if (searchQuery.trim() !== "") {
      result = result.filter(m => 
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStacks.length > 0) {
      result = result.filter(m => {
        const mentorStackId = String(m.stack?.id || "");
        return selectedStacks.includes(mentorStackId);
      });
    }

    if (minRating) {
      result = result.filter(m => Number(m.averageRating || 0) >= minRating);
    }

    result = result.filter(m => Number(m.hourlyRate || 0) <= sessionPrice);

    if (sortBy === "Highest Rated") {
      result.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0));
    } else if (sortBy === "Price: Low to High") {
      result.sort((a, b) => Number(a.hourlyRate || 0) - Number(b.hourlyRate || 0));
    } else if (sortBy === "Price: High to Low") {
      result.sort((a, b) => Number(b.hourlyRate || 0) - Number(a.hourlyRate || 0));
    }

    return result;
  }, [mentors, searchQuery, selectedStacks, minRating, sessionPrice, sortBy]);

  const toggleStackSelection = (stackId: string) => {
    setSelectedStacks(prev => 
      prev.includes(stackId) ? prev.filter(id => id !== stackId) : [...prev, stackId]
    );
  };

  return (
    <div className="min-h-screen font-sans px-4 md:px-12 py-24 bg-background text-foreground">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        <div className="p-6 rounded-xl border bg-card border-border">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-bold tracking-wide uppercase">⚡ {t('mentors.filters')}</span>
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-semibold text-muted-foreground mb-2">{t('mentors.search_mentors')}</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('mentors.search_placeholder')}
                className="w-full pl-4 pr-10 py-2 rounded-lg border text-sm focus:outline-none focus:border-primary/50 bg-background text-foreground border-border"
              />
              <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">🔍</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-muted-foreground mb-3">{t('mentors.technology_stack')}</label>
            <div className="space-y-2.5 text-sm">
              {dbStacks.slice(0, showAllStacks ? dbStacks.length : 4).map((stack) => (
                <label key={stack.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedStacks.includes(String(stack.id))}
                    onChange={() => toggleStackSelection(String(stack.id))}
                    className="rounded border-border bg-background text-primary focus:ring-0 w-4 h-4"
                  />
                  <span className="text-foreground transition-colors">{stack.name}</span>
                </label>
              ))}
            </div>

            {dbStacks.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllStacks(!showAllStacks)}
                className="mt-3 text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                {showAllStacks ? t('mentors.show_less') : t('mentors.show_more', { count: dbStacks.length - 4 })}
              </button>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-muted-foreground mb-3">{t('mentors.minimum_rating')}</label>
            <div className="space-y-2 text-sm">
              {ratingOptions.map((rating) => (
                <label key={rating} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                    className="bg-background border-border text-primary w-4 h-4 focus:ring-0"
                  />
                  <span className="text-foreground">{rating}+ ⭐</span>
                </label>
              ))}
              {minRating !== null && (
                <button 
                  onClick={() => setMinRating(null)} 
                  className="text-[11px] text-red-400 hover:underline block mt-1"
                >
                  {t('mentors.clear_rating_filter')}
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400">{t('mentors.session_price')}</label>
              <span className="text-xs font-mono text-muted-foreground">${priceBounds.min} - ${sessionPrice}/hr</span>
            </div>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step="5"
              value={sessionPrice}
              onChange={(e) => setSessionPrice(Number(e.target.value))}
              className="w-full accent-primary bg-background rounded-lg appearance-none h-1"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground">{t('mentors.discovery_title')}</h1>
              <p className="text-xs text-muted-foreground">{t('mentors.showing_results', { count: filteredMentors.length })}</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{t('mentors.sort_by')}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-purple-500 bg-card border-border text-foreground"
              >
                <option value="Highest Rated">{t('mentors.sort.highest_rated')}</option>
                <option value="Price: Low to High">{t('mentors.sort.price_low_to_high')}</option>
                <option value="Price: High to Low">{t('mentors.sort.price_high_to_low')}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-card h-44 rounded-xl border border-border"></div>
              ))}
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">{t('mentors.no_matches')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="border p-6 rounded-xl transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group relative backdrop-blur-md bg-card border-border hover:border-primary/70"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shrink-0 overflow-hidden border border-border">
                      {mentor.name?.charAt(0) || "M"}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold group-hover:text-purple-400 transition-colors text-foreground">
                          {mentor.name}
                        </h3>
                        <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                          ⭐ {mentor.averageRating || "0"}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground font-medium">
                        {mentor.title || t('mentors.profile_fallback_title')}
                      </p>
                      
                      <p className="text-xs text-emerald-400 font-mono font-medium">
                        ${mentor.hourlyRate || "0"}/hr
                      </p>

                      <p className="text-xs text-muted-foreground leading-relaxed max-w-xl pt-1 line-clamp-2">
                        {mentor.bio || t('mentors.profile_fallback_bio')}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-3">
                        {mentor.stack?.name ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-card border border-border text-foreground font-mono">
                            {mentor.stack.name}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-card border border-border text-foreground font-mono">{t('mentors.full_stack')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full w-full md:w-auto shrink-0 border-t md:border-t-0 border-border pt-4 md:pt-0">
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <Link
                        to={`/mentor/${mentor.id}`}
                        className="w-full text-center bg-card hover:bg-primary/10 text-foreground border border-border px-4 py-2 rounded-lg text-xs font-semibold"
                      >
                        {t('home.view_profile')}
                      </Link>
                      <button 
                        onClick={() => navigate(`/student/book/${mentor.id}`)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold"
                      >
                        {t('mentors.book_now')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-6">
                <button className="px-5 py-2 bg-card hover:bg-primary/10 border border-border text-foreground text-xs font-medium rounded-full transition-all">
                  {t('mentors.load_more_mentors')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}