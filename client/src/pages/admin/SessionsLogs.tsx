import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'
import { useAppDispatch, useAppSelector } from '../../store/index'
import { fetchAdminSessions } from '../../store/slices/adminSlice'
import { Search, Calendar, Clock, ArrowLeft, ArrowRight, ShieldAlert, RotateCcw, FileText } from 'lucide-react'

interface Session {
  id: number;
  mentorId: number;
  studentId: number;
  startTime: string;
  endTime: string;
  description: string;
  status: string;
  evaluationNotes?: string;
}

const SessionsLogs: React.FC = () => {
    const dispatch = useAppDispatch();

    // جلب بيانات الجلسات والصفحات من الـ Redux Store
    const { 
        sessions = [], 
        sessionsPagination = { page: 1, totalPages: 1 }, 
        loading = false, 
        error = null 
    } = useAppSelector((state) => state.admin) || {};

    const { t, i18n } = useTranslation(['admin']);
    const isRtl = i18n.language.startsWith('ar');

    // حالات التحكم في الصفحة والبحث
    const [currentPage, setCurrentPage] = useState(1);
    const [searchId, setSearchId] = useState('');
    const [searchedSession, setSearchedSession] = useState<Session | null>(null);
    const [isSearchActive, setIsSearchActive] = useState(false);

    // حالات التحميل والأخطاء المحلية للبحث
    const [loadingGetSessionState, setLoadingGetSessionState] = useState(false);
    const [errorGetSessionState, setErrorGetSessionState] = useState('');

    // جلب البيانات عند تغيير الصفحة (في حال عدم تفعيل وضع البحث)
    useEffect(() => {
        if (!isSearchActive) {
            dispatch(fetchAdminSessions(currentPage));
        }
    }, [dispatch, currentPage, isSearchActive]);

    // دالة البحث عن جلسة بواسطة الـ ID
    const getSessionById = async (id: string) => {
        if (!id.trim()) return;
        setLoadingGetSessionState(true);
        setErrorGetSessionState('');
        setIsSearchActive(true);
        setSearchedSession(null);
        try {
            const response = await api.get(`sessions/${id}`);
            if (response && response.data && (response.data.success === "true" || response.data.success === true)) {
                const sessionData = response.data.data.session || response.data.data;
                setSearchedSession(sessionData);
            } else {
                setErrorGetSessionState(t('session_not_found'));
            }
        } catch (err: any) {
            console.error(err);
            setErrorGetSessionState(err.message || 'Failed to fetch session by ID');
        } finally {
            setLoadingGetSessionState(false);
        }
    };

    const handleClearSearch = () => {
        setIsSearchActive(false);
        setSearchedSession(null);
        setSearchId('');
        setErrorGetSessionState('');
        dispatch(fetchAdminSessions(currentPage));
    };

    const displaySessions = isSearchActive ? (searchedSession ? [searchedSession] : []) : sessions;
    const isPageLoading = loading || loadingGetSessionState;

    return (
        <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Header Card */}
            <div className={`p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-800 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 rounded-3xl text-white space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h1 className="text-2xl font-bold">{t('sessions_logs')}</h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                    {t('sessions_logs_subtitle')}
                </p>
            </div>

            {/* Error handling alert */}
            {(error || errorGetSessionState) && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-2xl text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{error || errorGetSessionState}</span>
                </div>
            )}

            {/* Search Filter Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                <div className="max-w-md space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {t('search_session_by_id')}
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="ex: 102"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                        />
                        <button 
                            onClick={() => getSessionById(searchId)}
                            disabled={isPageLoading}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
                        >
                            <Search className="w-4 h-4" />
                            <span>{t('search')}</span>
                        </button>
                    </div>
                </div>

                {isSearchActive && (
                    <div className="flex justify-start pt-3">
                        <button 
                            onClick={handleClearSearch}
                            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {t('clear_search')}
                        </button>
                    </div>
                )}
            </div>

            {/* Sessions Table  */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">{t('table_mentor_id')}</th>
                                <th className="px-6 py-4">{t('table_student_id')}</th>
                                <th className="px-6 py-4">{t('table_description') }</th>
                                <th className="px-6 py-4">{t('table_date') }</th>
                                <th className="px-6 py-4 text-center">{t('table_status') }</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isPageLoading ? (
                                // Table Skeleton
                                [...Array(5)].map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4 flex justify-center"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div></td>
                                    </tr>
                                ))
                            ) : displaySessions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                                        {t('no_sessions_found')}
                                    </td>
                                </tr>
                            ) : (
                                displaySessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{session.id}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{session.mentorId}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{session.studentId}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200 max-w-[220px] truncate" title={session.description}>
                                            {session.description || <span className="text-slate-300 dark:text-slate-700">---</span>}
                                        </td>
                                        <td className="px-6 py-4 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-indigo-500" />
                                                <span>{new Date(session.startTime).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                <Clock className="w-2.5 h-2.5" />
                                                <span>
                                                    {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                                    {' - '} 
                                                    {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 text-xs rounded-lg font-semibold ${
                                                session.status === 'COMPLETED' ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' :
                                                session.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' :
                                                session.status === 'SCHEDULED' ? 'bg-amber-50 text-blue-600 dark:bg-amber-950/30 dark:text-blue-400' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                                {session.status=="COMPLETED"&&t('COMPLETED')}
                                                {session.status=="SCHEDULED"&&t('SCHEDULED')}
                                                {session.status=="CANCELED"&&t('CANCELLED')}
                                                {session.status=="PENDING"&&t('PENDING')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isSearchActive && (
                    <div className={`flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 mt-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isPageLoading}
                            className="flex items-center gap-1 text-xs font-semibold px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors text-slate-700 dark:text-slate-300"
                        >
                            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            {t('pagination_prev')}
                        </button>
                        
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                            {t('page')} {sessionsPagination.page} 
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, sessionsPagination.totalPages))}
                            disabled={currentPage >= sessionsPagination.totalPages || isPageLoading}
                            className="flex items-center gap-1 text-xs font-semibold px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors text-slate-700 dark:text-slate-300"
                        >
                            {t('pagination_next')}
                            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionsLogs;