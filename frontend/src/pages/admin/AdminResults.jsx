import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Download, Trash2, RefreshCw, Pencil, X } from 'lucide-react';

export default function AdminResults() {
    const { getAuthHeaders } = useAdminAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [sortBy, setSortBy] = useState('date'); // 'date' | 'score' | 'name'
    const [editModal, setEditModal] = useState(null); // { roll, class, section, currentName }
    const [editName, setEditName] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const data = await api.get('/admin/results', { headers: getAuthHeaders() });
            setResults(data.data || data); // Axios wraps in .data
        } catch (err) {
            setError('Failed to fetch results.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, roll) => {
        if (!window.confirm(`Are you sure you want to delete the result for Roll ${roll}?`)) return;

        try {
            await api.delete(`/admin/results/${id}`, { headers: getAuthHeaders() });
            fetchResults();
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (err) {
            alert('Failed to delete result');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected results?`)) return;

        try {
            await api.post('/admin/results/bulk-delete', { ids: selectedIds }, { headers: getAuthHeaders() });
            setSelectedIds([]);
            fetchResults();
        } catch (err) {
            alert('Failed to bulk delete results');
        }
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredResults.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelectOne = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const openEditModal = (result) => {
        setEditModal({ id: result.id, roll: result.roll, class: result.class, section: result.section || 'A', currentName: result.name });
        setEditName(result.name);
    };

    const handleEditName = async () => {
        if (!editName.trim()) return;
        try {
            await api.put(`/admin/results/${editModal.id}`, {
                newName: editName.trim()
            }, { headers: getAuthHeaders() });
            setEditModal(null);
            fetchResults();
        } catch (err) {
            alert('Failed to update name');
        }
    };

    const filteredResults = results
        .filter(r => filterClass === 'all' || String(r.class) === String(filterClass))
        .sort((a, b) => {
            if (sortBy === 'score') return b.percentage - a.percentage;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return new Date(b.date) - new Date(a.date);
        });

    const exportToCSV = () => {
        if (filteredResults.length === 0) return;

        const headers = ['Name,Roll Number,Class,Section,Score,Total,Percentage,Date'];
        const csvRows = filteredResults.map(r =>
            `${r.name},${r.roll},${r.class},${r.section || 'A'},${r.score},${r.total},${r.percentage},"${new Date(r.date).toLocaleString()}"`
        );

        const csvContent = headers.concat(csvRows).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        const className = filterClass === 'all' ? 'all_classes' : `class_${filterClass}`;
        const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
        link.setAttribute('download', `exam_results_${className}_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading results...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Result Management</h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm">View student scores and manage submissions</p>
                </div>

                <div className="mt-4 sm:mt-0 flex gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 flex items-center gap-2 text-sm font-bold shadow-sm transition-all"
                        >
                            <Trash2 size={16} />
                            Delete ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={exportToCSV}
                        disabled={filteredResults.length === 0}
                        className="px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 disabled:opacity-50 flex items-center gap-2 text-sm font-bold transition-all shadow-sm disabled:cursor-not-allowed"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                    <button
                        onClick={fetchResults}
                        className="px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-sm font-bold shadow-sm transition-all"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold shadow-sm">{error}</div>}

            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 border-b border-gray-100 py-5 px-6 gap-4">
                    <CardTitle className="text-gray-900 font-bold tracking-tight">Exam Submissions ({filteredResults.length})</CardTitle>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold shadow-sm"
                        >
                            <option value="all">All Classes</option>
                            <option value="6">Class 6</option>
                            <option value="7">Class 7</option>
                            <option value="8">Class 8</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold shadow-sm"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="score">Sort by Score</option>
                            <option value="name">Sort by Name</option>
                        </select>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                <th className="p-4 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        checked={filteredResults.length > 0 && selectedIds.length === filteredResults.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="p-4 font-bold">Student Name</th>
                                <th className="p-4 font-bold">Roll No</th>
                                <th className="p-4 font-bold text-center">Class</th>
                                <th className="p-4 font-bold text-center">Section</th>
                                <th className="p-4 font-bold text-center">Score</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold hidden md:table-cell">Submitted On</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-12 text-center text-gray-500 font-medium bg-gray-50/50">
                                        No results found for current filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result, idx) => {
                                    const isPass = result.percentage >= 50;
                                    return (
                                        <tr key={result.id || idx} className={selectedIds.includes(result.id) ? "bg-indigo-50/50 transition-colors" : "hover:bg-gray-50/80 transition-colors"}>
                                            <td className="p-4 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    checked={selectedIds.includes(result.id)}
                                                    onChange={() => toggleSelectOne(result.id)}
                                                />
                                            </td>
                                            <td className="p-4 font-bold text-gray-900">{result.name}</td>
                                            <td className="p-4 text-gray-600 font-medium">{result.roll}</td>
                                            <td className="p-4 text-center">
                                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">
                                                    C{result.class}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-full text-xs font-extrabold">
                                                    {result.section || 'A'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="font-bold text-gray-900 leading-tight">{result.score} / {result.total}</div>
                                                <div className="text-xs text-gray-500 font-medium mt-0.5">{Math.round(result.percentage)}%</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${isPass ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                                    {isPass ? 'PASS' : 'FAIL'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 text-xs font-medium hidden md:table-cell">
                                                {new Date(result.date).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEditModal(result)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100"
                                                        title="Edit Name"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(result.id, result.roll)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                                        title="Delete Result"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Edit Name Modal */}
            {editModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Edit Student Name</h2>
                            <button onClick={() => setEditModal(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-500 font-medium">Roll: {editModal.roll} • Class {editModal.class} • Section {editModal.section}</p>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Student Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium shadow-sm transition-all"
                                    placeholder="Enter corrected name"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button onClick={() => setEditModal(null)} className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold text-sm shadow-sm transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleEditName} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 rounded-xl font-bold text-sm shadow-md transition-all">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
