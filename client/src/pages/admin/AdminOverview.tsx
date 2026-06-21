import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'
import { useAppDispatch, useAppSelector } from '../../store/index'
import { fetchAdminUsers, fetchAdminSessions } from '../../store/slices/adminSlice'
import { TrendingUp, ChartArea, ArrowLeft, ArrowRight } from 'lucide-react'

interface DashboardAPI {
  success: boolean | string; 
  message: string;
  data: {
    dashboard: {
        usersCount: number;
        mentorsCount: number;
        studentsCount: number;
        sessionCount: number;
    };
  }
}

const AdminOverview: React.FC = () => {
    const dispatch = useAppDispatch();
    
    const { 
        users: storeUsers, 
        sessions: storeSessions, 
        loading: storeLoading, 
        error: storeError 
    } = useAppSelector((state) => state.admin);

    const { t, i18n } = useTranslation(['admin']);
    const isRtl = i18n.language.startsWith('ar');

    const [usersCount, setUsersCount] = useState(0);
    const [mentorsCount, setMentorsCount] = useState(0);
    const [studentsCount, setStudentsCount] = useState(0);
    const [sessionCount, setSessionCount] = useState(0);

    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState<string | null>(null);

    const FetchDashboardData = async () => {
        setDashboardLoading(true);
        setDashboardError(null);
        try {
            const response = await api.get<DashboardAPI>('admin/dashboard');
            if (response && response.data && response.data.success) {
                setMentorsCount(response.data.data.dashboard.mentorsCount);
                setStudentsCount(response.data.data.dashboard.studentsCount);
                setUsersCount(response.data.data.dashboard.usersCount);
                setSessionCount(response.data.data.dashboard.sessionCount);
            }
        } catch (err: any) {
            console.error(err);
            setDashboardError(err.message || 'Failed to fetch dashboard metrics');
        } finally {
            setDashboardLoading(false);
        }
    };

    useEffect(() => {
        FetchDashboardData();
        dispatch(fetchAdminUsers(1));
        dispatch(fetchAdminSessions(1));
    }, [dispatch]);

    const isPageLoading = dashboardLoading || storeLoading;
    const pageError = dashboardError || storeError;

    return (
        <div className="space-y-8">
            {isPageLoading ? (
                <div className="space-y-9 animate-pulse">
                    {/* Header skeleton */}
                    <div className="h-40 w-auto bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>

                    {/* Statistics title skeleton */}
                    <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>

                    {/* Cards grid skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                    </div>

                    {/* Tables grid skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                    </div>
                </div>
            ) : pageError ? (
                <div className="bg-rose-500/5 border border-rose-500/15 p-6 rounded-2xl text-center max-w-md mx-auto space-y-4 py-8">
                    <TrendingUp className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{t('error_loading')}</h3>
                    <p className="text-xs text-slate-400">{pageError}</p>
                    <button
                        onClick={() => { FetchDashboardData(); dispatch(fetchAdminUsers(1)); dispatch(fetchAdminSessions(1)); }}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-500 transition-colors text-xs"
                    >
                        {t('error_retry')}
                    </button>
                </div>
            ) : (
                <div className="space-y-9">
                    {/*  Header Card */}
                    <div className={`h-40 w-auto bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-800 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 rounded-3xl flex flex-col justify-center text-white p-11 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <div className="text-2xl font-bold">{t('welcome_admin')}</div>
                        <div className="text-sm">{t('welcome_admin_subtitle')}</div>
                    </div>

                    {/* Title section */}
                    <div className={`flex flex-row items-center text-black dark:text-white ${isRtl ? 'justify-start' : 'justify-start'}`}>
                        <ChartArea className="w-6 h-6 text-indigo-600 mx-2" />
                        <span className="font-semibold">{t('statistics')}</span>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className={`flex items-center justify-between p-6 h-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm transition-all hover:shadow-md ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('users_count')}</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{usersCount}</p>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                            </div>
                        </div>

                        <div className={`flex items-center justify-between p-6 h-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm transition-all hover:shadow-md ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('mentors_count')}</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{mentorsCount}</p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-2xl text-purple-600 dark:text-purple-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.425 2.188l3.711 3.711m-1.286-5.899a24.26 24.26 0 0 0 5.488-2.421m12.483 2.422a50.636 50.636 0 0 1 2.425 2.188l-3.711 3.711m1.286-5.899a24.26 24.26 0 0 1-5.488-2.421M12 3.076c1.396 0 2.785.135 4.141.397m-8.282 0A41.53 41.53 0 0 1 12 3.076M12 3.076v3.315" /></svg>
                            </div>
                        </div>

                        <div className={`flex items-center justify-between p-6 h-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm transition-all hover:shadow-md ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('students_count')}</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{studentsCount}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                            </div>
                        </div>

                        <div className={`flex items-center justify-between p-6 h-32 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm transition-all hover:shadow-md ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('sessions_count')}</p>
                                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{sessionCount}</p>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl text-amber-600 dark:text-amber-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Tables Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" dir={isRtl ? 'rtl' : 'ltr'}>
                        {/* Users Table Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[420px]">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('latest_users')}</h3>
                                    <Link to="/admin/users" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                        {t('view_all')}
                                        {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                            <tr>
                                                <th className="px-4 py-3">{t('table_email')}</th>
                                                <th className="px-4 py-3">{t('table_role')}</th>
                                                <th className="px-4 py-3">{t('table_status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {storeUsers.slice(0, 5).map((user) => (
                                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200 max-w-[150px] truncate">{user.email}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-xs rounded-lg font-semibold ${
                                                            user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' :
                                                            user.role === 'MENTOR' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' :
                                                            'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                                                        }`}>
                                                            {user.role=="ADMIN"&&t('ADMIN')}
                                                            {user.role=="MENTOR"&&t('MENTOR')}
                                                            {user.role=="STUDENT"&&t('STUDENT')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.isBlocked ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                                                            {user.isBlocked ? t('status_blocked') : t('status_active')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Sessions Table Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[420px]">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('latest_sessions')}</h3>
                                    <Link to="/admin/sessions" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                        {t('view_all')}
                                        {isRtl ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                            <tr>
                                                <th className="px-4 py-3">{t('table_description')}</th>
                                                <th className="px-4 py-3">{t('table_date')}</th>
                                                <th className="px-4 py-3">{t('table_status')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {storeSessions.slice(0, 5).map((session) => (
                                                <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200 max-w-[150px] truncate">{session.description}</td>
                                                    <td className="px-4 py-3 text-xs">{new Date(session.startTime).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}</td>
                                                    <td className="px-4 py-3">
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOverview;