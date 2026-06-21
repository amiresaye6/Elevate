import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../services/api'
import { Plus, Edit2, Trash2, ArrowLeft, ArrowRight, ShieldAlert, X, Check, Loader2 } from 'lucide-react'

interface Stack {
  id: number;
  name: string;
  description: string;
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const ControlStacks: React.FC = () => {
    const { t, i18n } = useTranslation(['admin']);
    const isRtl = i18n.language.startsWith('ar');

    const [stacks, setStacks] = useState<Stack[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedStackId, setSelectedStackId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [formErrors, setFormErrors] = useState({ name: '', description: '' });
    const [stackToDelete, setStackToDelete] = useState<number | null>(null);

    const fetchStacks = async (page: number) => {
        setLoading(true);
        setGlobalError('');
        try {
            const response = await api.get(`/stacks?page=${page}`);
            if (response && response.data && response.data.success) {
                setStacks(response.data.data.stacks || response.data.data);
                if (response.data.data.pagination) {
                    setPagination(response.data.data.pagination);
                }
            }
        } catch (err: any) {
            console.error(err);
            setGlobalError(err.message || 'Failed to fetch stacks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStacks(currentPage);
    }, [currentPage]);

    const validateForm = () => {
        let isValid = true;
        const errors = { name: '', description: '' };

        if (!formData.name.trim()) {
            errors.name = t('name_required');
            isValid = false;
        } else if (formData.name.length < 3 || formData.name.length > 30) {
            errors.name = t('name_length_error');
            isValid = false;
        }

        if (!formData.description.trim()) {
            errors.description = t('desc_required');
            isValid = false;
        } else if (formData.description.length < 10 || formData.description.length > 200) {
            errors.description = t('desc_length_error');
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    // Post & Patch
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setModalLoading(true);
        try {
            if (formMode === 'create') {
                const response = await api.post('/stacks', formData);
                if (response && response.data && response.data.success) {
                    setIsFormModalOpen(false);
                    fetchStacks(currentPage);
                }
            } else if (formMode === 'edit' && selectedStackId) {
                const response = await api.patch(`/stacks/${selectedStackId}`, formData);
                if (response && response.data && response.data.success) {
                    setIsFormModalOpen(false);
                    fetchStacks(currentPage);
                }
            }
        } catch (err: any) {
            console.error(err);
            setFormErrors(prev => ({ ...prev, name: err.message || 'Action failed' }));
        } finally {
            setModalLoading(false);
        }
    };

    // Delete after confirmation
    const handleConfirmDelete = async () => {
        if (!stackToDelete) return;
        setModalLoading(true);
        try {
            const response = await api.delete(`/stacks/${stackToDelete}`);
            if (response && response.data && response.data.success) {
                setIsDeleteModalOpen(false);
                setStackToDelete(null);
                const nextPage = stacks.length === 1 ? Math.max(currentPage - 1, 1) : currentPage;
                setCurrentPage(nextPage);
                fetchStacks(nextPage);
            }
        } catch (err: any) {
            console.error(err);
            setGlobalError(err.message || 'Failed to delete stack');
            setIsDeleteModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };


    // modals for add, edit and delete
    const openCreateModal = () => {
        setFormMode('create');
        setFormData({ name: '', description: '' });
        setFormErrors({ name: '', description: '' });
        setIsFormModalOpen(true);
    };

    const openEditModal = (stack: Stack) => {
        setFormMode('edit');
        setSelectedStackId(stack.id);
        setFormData({ name: stack.name, description: stack.description });
        setFormErrors({ name: '', description: '' });
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (id: number) => {
        setStackToDelete(id);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Header section */}
            <div className={`p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-800 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{t('stacks_management')}</h1>
                    <p className="text-sm text-slate-300 max-w-xl">
                        {t('stacks_management_subtitle')}
                    </p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-white text-indigo-950 hover:bg-slate-100 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 self-stretch sm:self-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    <span>{t('add_new_stack')}</span>
                </button>
            </div>

            {globalError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-2xl text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{globalError}</span>
                </div>
            )}

            {/* Stacks Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">{t('table_stack_name')}</th>
                                <th className="px-6 py-4">{t('table_stack_desc')}</th>
                                <th className="px-6 py-4 text-center">{t('table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                // Skeleton 
                                [...Array(5)].map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded"></div></td>
                                        <td className="px-6 py-4 flex justify-center gap-2"><div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div><div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div></td>
                                    </tr>
                                ))
                            ) : stacks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 text-slate-400 text-xs">
                                        {t('no_stacks_found')}
                                    </td>
                                </tr>
                            ) : (
                                stacks.map((stack) => (
                                    <tr key={stack.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{stack.id}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">{stack.name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-sm truncate" title={stack.description}>
                                            {stack.description}
                                        </td>
                                        <td className="px-6 py-4 text-center flex justify-center gap-2">
                                            <button
                                                onClick={() => openEditModal(stack)}
                                                className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 p-2 rounded-xl text-xs font-bold transition-all"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(stack.id)}
                                                className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 p-2 rounded-xl text-xs font-bold transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className={`flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6 mt-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
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

            {/* create and edit modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {formMode === 'create' ? (t('create_stack_title')) : (t('edit_stack_title'))}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('stack_name_label')}</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100`}
                                    placeholder="ex: React.js"
                                />
                                {formErrors.name && <p className="text-[11px] text-rose-500 font-medium">{formErrors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('stack_desc_label')}</label>
                                <textarea 
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.description ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} bg-slate-50/50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100`}
                                    placeholder={t('stack_desc_placeholder')}
                                />
                                {formErrors.description && <p className="text-[11px] text-rose-500 font-medium">{formErrors.description}</p>}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {t('cancel') }
                                </button>
                                <button 
                                    type="submit"
                                    disabled={modalLoading}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                                >
                                    {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    <span>{formMode === 'create' ? (t('save')) : (t('update'))}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/*  Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-xl space-y-4 text-center">
                        <div className="mx-auto w-12 w-12 h-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                {t('confirm_delete_title')}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 px-2">
                                {t('confirm_delete_desc')}
                            </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button 
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={modalLoading}
                                className="w-full px-4 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button 
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={modalLoading}
                                className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                            >
                                {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>{t('delete_confirm_btn')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControlStacks;