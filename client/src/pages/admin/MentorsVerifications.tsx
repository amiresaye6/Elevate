import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Check, ArrowLeft, ArrowRight, ShieldAlert, Star, DollarSign, Briefcase, Layers, Users, Loader2 } from 'lucide-react'

interface Mentor {
  id: number;
  userId: number;
  stackId: number;
  name: string;
  title: string;
  bio: string;
  isVerified: boolean;
  averageRating: number;
  hourlyRate: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const MentorsVerifications: React.FC = () => {
    const { t, i18n } = useTranslation(['admin']);
    const isRtl = i18n.language.startsWith('ar');
    const navigate = useNavigate();

    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [globalError, setGlobalError] = useState('');

    const fetchPendingMentors = async (page: number) => {
        setLoading(true);
        setGlobalError('');
        try {
            const response = await api.get(`/admin/need-verify?page=${page}`);
            if (response && response.data && response.data.success) {
                setMentors(response.data.data.mentors || response.data.data);
                if (response.data.data.pagination) {
                    setPagination(response.data.data.pagination);
                }
            }
        } catch (err: any) {
            console.error(err);
            setGlobalError(err.message || 'Failed to fetch pending mentors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingMentors(currentPage);
    }, [currentPage]);

    const handleVerifyMentor = async (mentorId: number) => {
        setActionLoadingId(mentorId);
        try {
            const response = await api.post(`/admin/verify/${mentorId}`);
            if (response && response.data && response.data.success) {
                setMentors(prev => prev.filter(m => m.id !== mentorId));
                
                if (mentors.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                } else if (mentors.length === 1) {
                    fetchPendingMentors(currentPage);
                }
            }
        } catch (err: any) {
            console.error(err);
            setGlobalError(err.message || 'Failed to verify mentor');
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            
            <div className={`p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-800 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{t('mentors_verifications')}</h1>
                    <p className="text-sm text-slate-300 max-w-xl">
                        {t('mentors_verifications_subtitle')}
                    </p>
                </div>
                
                <button 
                    onClick={() => navigate('/admin/users')}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 self-stretch sm:self-auto justify-center"
                >
                    <Users className="w-4 h-4" />
                    <span>{t('back_to_users')}</span>
                </button>
            </div>

            {globalError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-2xl text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{globalError}</span>
                </div>
            )}

            <div className="space-y-4 min-h-[350px]">
                {loading ? (
                    [...Array(3)].map((_, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-pulse">
                            <div className="flex gap-4 w-full md:w-3/4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 flex-shrink-0"></div>
                                <div className="space-y-3 w-full">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/4"></div>
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                </div>
                            </div>
                            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full md:w-32"></div>
                        </div>
                    ))
                ) : mentors.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
                        {t('no_pending_mentors') }
                    </div>
                ) : (
                    mentors.map((mentor) => (
                        <div 
                            key={mentor.id} 
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
                        >
                            <div className="flex gap-4 items-start flex-1 w-full">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                                    {mentor.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{mentor.name}</h3>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">{t('Mentor')} {mentor.id}</span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">{t('User')} {mentor.userId}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        <span>{mentor.title}</span>
                                    </div>

                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl pr-2">
                                        {mentor.bio}
                                    </p>

                                    <div className="flex flex-wrap gap-4 pt-2 text-xs">
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Stack ID: <strong className="text-slate-700 dark:text-slate-300">{mentor.stackId}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-0.5 text-slate-500">
                                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                                            <span><strong className="text-emerald-600 dark:text-emerald-400">{mentor.hourlyRate}</strong> / {t('hour')}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-500">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            <span><strong className="text-slate-700 dark:text-slate-300">{mentor.averageRating}</strong> / 5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-auto flex-shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/60 flex justify-end">
                                <button
                                    onClick={() => handleVerifyMentor(mentor.id)}
                                    disabled={actionLoadingId !== null}
                                    className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/10"
                                >
                                    {actionLoadingId === mentor.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    <span>{t('approve_and_verify')}</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {mentors.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || loading}
                            className="flex items-center gap-1 text-xs font-semibold px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors text-slate-700 dark:text-slate-300"
                        >
                            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            {t('pagination_prev')}
                        </button>
                        
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                            {t('page')} {pagination.page} {t('of')} {pagination.totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                            disabled={currentPage >= pagination.totalPages || loading}
                            className="flex items-center gap-1 text-xs font-semibold px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors text-slate-700 dark:text-slate-300"
                        >
                            {t('pagination_next')}
                            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorsVerifications;