/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMentorById } from "../../services/mentorService"; 

export default function MentorProfile() {
  const { t } = useTranslation(['common']);
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getMentorById(id)
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          setMentor(data);
        })
        .catch((err) => console.error("Error loading mentor:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">{t('mentorProfile.loading')}</div>;
  if (!mentor) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">{t('mentorProfile.not_found')}</div>;

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-8 rounded-2xl border border-border">
            <h1 className="text-3xl font-bold">{mentor.name}</h1>
            <p className="text-muted-foreground mt-1">{mentor.title || t('mentorProfile.full_stack')}</p>
            <div className="mt-4 flex gap-3">
              <span className="text-xs px-3 py-1 bg-card border border-border text-foreground rounded-full font-mono">
                {mentor.stack?.name || t('mentorProfile.full_stack')}
              </span>
              {mentor.isVerified && (
                <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">✓ {t('mentorProfile.verified_expert')}</span>
              )}
            </div>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border">
            <h2 className="text-xl font-bold mb-4">👤 {t('mentorProfile.about_me')}</h2>
            <p className="text-muted-foreground leading-relaxed">{mentor.bio || t('mentorProfile.no_bio')}</p>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border">
            <h2 className="text-xl font-bold mb-4">📅 {t('mentorProfile.weekly_availability')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentor.availability?.map((slot: any, idx: number) => (
                <div key={idx} className="p-4 bg-card rounded-lg border border-border">
                  <p className="font-semibold text-purple-400">{slot.dayOfWeek}</p>
                  <p className="text-sm text-muted-foreground">{slot.startTime} - {slot.endTime}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border">
            <h2 className="text-xl font-bold mb-6">⭐ {t('mentorProfile.client_reviews')} ({mentor.reviewSessions?.length || 0})</h2>
            <div className="space-y-6">
              {mentor.reviewSessions?.length > 0 ? mentor.reviewSessions.map((rev: any, idx: number) => (
                <div key={idx} className="border-b border-border pb-6 last:border-0">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{rev.student?.name || t('mentorProfile.student_placeholder')}</span>
                    <span className="text-xs text-muted-foreground">{new Date(rev.startTime).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{rev.evaluationNotes}"</p>
                </div>
              )) : <p className="text-muted-foreground text-sm italic">{t('mentorProfile.no_reviews')}</p>}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-2xl border border-border sticky top-24">
            <div className="mb-6">
              <span className="text-4xl font-bold">${mentor.hourlyRate}</span>
              <span className="text-muted-foreground ml-2">/hr</span>
            </div>
            
            <button 
              onClick={() => navigate(`/student/book/${mentor.id}`)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all mb-4"
            >
              {t('mentorProfile.book_session')}
            </button>
            
            <div className="space-y-4 text-sm text-muted-foreground border-t border-border pt-6">
              <p>⭐ {t('mentorProfile.average_rating')}: <span className="text-foreground">{mentor.averageRating} / 5</span></p>
              <p>🚀 {t('mentorProfile.status')}: <span className="text-foreground">{mentor.isVerified ? t('mentorProfile.status_available') : t('mentorProfile.status_pending')}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}