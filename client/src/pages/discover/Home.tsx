import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMentors } from "../../services/mentorService";
import type { MentorProfile } from "../../types/mentor.types";

export default function Home() {
  const { t } = useTranslation(['common']);
  const [featuredMentors, setFeaturedMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMentors()
      .then((res: unknown) => {
        let mentorsList: MentorProfile[] = [];

        if (Array.isArray(res)) {
          mentorsList = res;
        } else if (typeof res === 'object' && res !== null) {
          const responseData = res as { data?: unknown };
          if (Array.isArray(responseData.data)) {
            mentorsList = responseData.data as MentorProfile[];
          } else if (typeof responseData.data === 'object' && responseData.data !== null) {
            const nested = responseData.data as { data?: unknown };
            if (Array.isArray(nested.data)) {
              mentorsList = nested.data as MentorProfile[];
            }
          }
        }

        setFeaturedMentors(mentorsList.slice(0, 3));
      })
      .catch((err) => console.error("Error fetching mentors for home:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-500/30 overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-900/10 via-blue-900/5 to-transparent blur-3xl pointer-events-none" />

      <section className="relative pt-32 pb-20 text-center max-w-4xl mx-auto px-4 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/80 text-xs text-purple-400 mb-6 backdrop-blur-sm">
          <span>{`</>`}</span> {t('discover.tagline')}
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          {t('discover.hero_prefix')}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            {t('discover.hero_highlight')}
          </span>{" "}
          {t('discover.hero_suffix')}
        </h1>

        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto font-light">
          {t('discover.hero_subtitle')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/mentors"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-3 rounded-lg shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5"
          >
            {t('discover.find_your_mentor')}
          </Link>
        </div>
      </section>

      <section className="relative max-w-5xl mx-auto px-4 py-12 border-y border-border z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              500+
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t('home.stats.expert_mentors')}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              10k+
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t('home.stats.sessions_completed')}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              4.9/5
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t('home.stats.average_rating')}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20 relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t('home.featured_title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('home.featured_subtitle')}
            </p>
          </div>
          <Link
            to="/mentors"
            className="text-xs text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 group"
          >
            {t('home.view_all_mentors')}{" "}
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-card h-72 rounded-xl border border-border"
              ></div>
            ))}
          </div>
        ) : featuredMentors.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">
              {t('home.no_mentors_found')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-card border border-border hover:border-primary/70 p-6 rounded-xl transition-all duration-300 flex flex-col justify-between group backdrop-blur-md"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-inner shrink-0">
                      {mentor.name?.charAt(0) || "M"}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10 font-medium">
                        ⭐ {mentor.averageRating || "4.9"}
                      </div>
                      <div className="flex items-center gap-0.5 text-[11px] text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10 font-mono">
                        ${mentor.hourlyRate || "50"}/hr
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-purple-400 transition-colors mb-1">
                    {mentor.name}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground mb-4 font-medium">
                    {mentor.title || t('home.profile_fallback_title')}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4 font-medium">
                    {mentor.bio || t('home.profile_fallback_bio')}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-card border border-border text-foreground font-mono">
                      {mentor.stack?.name || t('mentors.full_stack')}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/mentor/${mentor.id}`}
                  className="w-full block text-center bg-card border border-border hover:bg-primary text-foreground hover:text-white font-medium py-2.5 rounded-lg text-sm transition-all duration-300"
                >
                  {t('home.view_profile')}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-border relative z-10 mb-12">
        <h2 className="text-2xl font-bold text-center text-foreground mb-12 tracking-tight">
          {t('home.testimonial_section_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-xl relative">
            <span className="text-purple-500/20 text-5xl absolute top-4 left-4 font-serif">
              “
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 relative z-10">
              {t('home.testimonial_1')}
            </p>
            <div className="text-xs">
              <div className="font-bold text-foreground">{t('home.testimonial_1_author')}</div>
              <div className="text-muted-foreground">{t('home.testimonial_1_role')}</div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-xl relative">
            <span className="text-purple-500/20 text-5xl absolute top-4 left-4 font-serif">
              “
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 relative z-10">
              {t('home.testimonial_2')}
            </p>
            <div className="text-xs">
              <div className="font-bold text-foreground">{t('home.testimonial_2_author')}</div>
              <div className="text-muted-foreground">{t('home.testimonial_2_role')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
