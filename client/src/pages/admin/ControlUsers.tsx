import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'
import { useAppDispatch, useAppSelector } from '../../store/index'
import { fetchAdminUsers } from '../../store/slices/adminSlice'
import { Search, UserX, UserCheck, ArrowLeft, ArrowRight, ShieldAlert, RotateCcw } from 'lucide-react'

interface User {
  id: number;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  profilePicture: string | null;
}

const ControlUsers: React.FC = () => {
    const dispatch = useAppDispatch();

    const { 
    users = [], 
    usersPagination = { page: 1, totalPages: 1 },
    loading = false, 
    error = null 
} = useAppSelector((state) => state.admin) || {};

    const { t, i18n } = useTranslation(['admin']);
    const isRtl = i18n.language.startsWith('ar');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [searchId, setSearchId] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchedUser, setSearchedUser] = useState<User | null>(null);
    const [isSearchActive, setIsSearchActive] = useState(false);

    const [loadingTriggerUserState, setLoadingTriggerUserState] = useState(false);
    const [errorTriggerUserState, setErrorTriggerUserState] = useState('');
    const [loadingGetUserState, setLoadingGetUserState] = useState(false);
    const [errorGetUserState, setErrorGetUserState] = useState('');

    useEffect(() => {
        if (!isSearchActive) {
            dispatch(fetchAdminUsers(currentPage));
        }
    }, [dispatch, currentPage, isSearchActive]);

    const BlockUser = async (id: number) => {
        setLoadingTriggerUserState(true);
        setErrorTriggerUserState('');
        try {
            const response = await api.patch(`admin/users/${id}/status`,{isBlocked: true});
            if (response && response.data && (response.data.success === "true" || response.data.success === true)) {
                dispatch(fetchAdminUsers(currentPage));
                if (searchedUser && searchedUser.id === id) {
                    setSearchedUser({ ...searchedUser, isBlocked: true });
                }
            } else {
                setErrorTriggerUserState('An error occurred while blocking the user');
            }
        } catch (err: any) {
            console.error(err);
            setErrorTriggerUserState(err.message || 'Failed to block user');
        } finally {
            setLoadingTriggerUserState(false);
        }
    };

    const UnBlockUser = async (id: number) => {
        setLoadingTriggerUserState(true);
        setErrorTriggerUserState('');
        try {
            const response = await api.patch(`admin/users/${id}/status`, { isBlocked: false });
            if (response && response.data && (response.data.success === "true" || response.data.success === true)) {
                dispatch(fetchAdminUsers(currentPage));
                if (searchedUser && searchedUser.id === id) {
                    setSearchedUser({ ...searchedUser, isBlocked: false });
                }
            } else {
                setErrorTriggerUserState('An error occurred while unblocking the user');
            }
        } catch (err: any) {
            console.error(err);
            setErrorTriggerUserState(err.message || 'Failed to unblock user');
        } finally {
            setLoadingTriggerUserState(false);
        }
    };

    const getUserById = async (id: string) => {
        if (!id.trim()) return;
        setLoadingGetUserState(true);
        setErrorGetUserState('');
        setIsSearchActive(true);
        setSearchedUser(null);
        try {
            const response = await api.get(`users/find/${id}`);
            if (response && response.data && (response.data.success === "true" || response.data.success === true)) {
                setSearchedUser(response.data.data.user);
            } else {
                setErrorGetUserState(t('user_not_found') || 'User not found');
            }
        } catch (err: any) {
            console.error(err);
            setErrorGetUserState(err.message || 'Failed to fetch user by ID');
        } finally {
            setLoadingGetUserState(false);
        }
    };

    const getUserByEmail = async (email: string) => {
        if (!email.trim()) return;
        setLoadingGetUserState(true);
        setErrorGetUserState('');
        setIsSearchActive(true);
        setSearchedUser(null);
        try {
            const response = await api.get(`users/find?email=${email}`);
            if (response && response.data && (response.data.success === "true" || response.data.success === true)) {
                setSearchedUser(response.data.data.user);
            } else {
                setErrorGetUserState(t('user_not_found') || 'User not found');
            }
        } catch (err: any) {
            console.error(err);
            setErrorGetUserState(err.message || 'Failed to fetch user by Email');
        } finally {
            setLoadingGetUserState(false);
        }
    };

    const handleClearSearch = () => {
        setIsSearchActive(false);
        setSearchedUser(null);
        setSearchId('');
        setSearchEmail('');
        setErrorGetUserState('');
        dispatch(fetchAdminUsers(currentPage));
    };

    const displayUsers = isSearchActive ? (searchedUser ? [searchedUser] : []) : users;
    const isPageLoading = loading || loadingGetUserState;

    return (
        <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Header  */}
            <div className={`p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-800 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 rounded-3xl text-white space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h1 className="text-2xl font-bold">{t('users_management')}</h1>
                <p className="text-sm text-slate-300 max-w-2xl">
                    {t('users_management_subtitle') }
                </p>
            </div>

            {/* Error */}
            {(errorTriggerUserState || error || errorGetUserState) && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-2xl text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{errorTriggerUserState || error || errorGetUserState}</span>
                </div>
            )}

            {/* Search Filters Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search by ID */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('search_by_id')}</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={searchId}
                                onChange={(e) => { setSearchId(e.target.value); setSearchEmail(''); }}
                                placeholder="ex: 1"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                            />
                            <button 
                                onClick={() => getUserById(searchId)}
                                disabled={isPageLoading}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
                            >
                                <Search className="w-4 h-4" />
                                <span>{t('search') }</span>
                            </button>
                        </div>
                    </div>

                    {/* Search by Email */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('search_by_email')}</label>
                        <div className="flex gap-2">
                            <input 
                                type="email" 
                                value={searchEmail}
                                onChange={(e) => { setSearchEmail(e.target.value); setSearchId(''); }}
                                placeholder="example@platform.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
                            />
                            <button 
                                onClick={() => getUserByEmail(searchEmail)}
                                disabled={isPageLoading}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
                            >
                                <Search className="w-4 h-4" />
                                <span>{t('search')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reset Filter */}
                {isSearchActive && (
                    <div className="flex justify-end pt-2">
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

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">{t('table_email')}</th>
                                <th className="px-6 py-4">{t('table_role')}</th>
                                <th className="px-6 py-4">{t('table_status')}</th>
                                <th className="px-6 py-4 text-center">{t('table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isPageLoading ? (
                                // Table Skeleton
                                [...Array(5)].map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div></td>
                                        <td className="px-6 py-4"><div className="h-5 w-14 bg-slate-200 dark:bg-slate-800 rounded-full"></div></td>
                                        <td className="px-6 py-4 flex justify-center"><div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div></td>
                                    </tr>
                                ))
                            ) : displayUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400 text-xs">
                                        {t('no_users_found')}
                                    </td>
                                end</tr>
                            ) : (
                                displayUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{user.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200 max-w-[200px] truncate">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.isBlocked 
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                                {user.isBlocked ? (t('status_blocked')) : (t('status_active'))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.isBlocked ? (
                                                <button
                                                    onClick={() => UnBlockUser(user.id)}
                                                    disabled={loadingTriggerUserState}
                                                    className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                    {t('unblock')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => BlockUser(user.id)}
                                                    disabled={loadingTriggerUserState}
                                                    className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    <UserX className="w-3.5 h-3.5" />
                                                    {t('block')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer  */}
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
                            {t('page')} {currentPage}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage >= usersPagination.totalPages || isPageLoading} 
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

export default ControlUsers;