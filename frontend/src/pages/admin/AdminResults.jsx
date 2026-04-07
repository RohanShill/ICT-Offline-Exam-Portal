import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Download, Trash2, RefreshCw } from 'lucide-react';

export default function AdminResults() {
    const { getAuthHeaders } = useAdminAuth();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [sortBy, setSortBy] = useState('date'); // 'date' | 'score' | 'name'

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

    const handleDelete = async (roll, studentClass) => {
        if (!window.confirm(`Are you sure you want to delete the result for Roll ${roll}?`)) return;

        try {
            await api.delete(`/admin/results/${roll}/${studentClass}`, { headers: getAuthHeaders() });
            fetchResults();
        } catch (err) {
            alert('Failed to delete result');
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

        const headers = ['Name,Roll Number,Class,Score,Total,Percentage,Date'];
        const csvRows = filteredResults.map(r =>
            `${r.name},${r.roll},${r.class},${r.score},${r.total},${r.percentage},"${new Date(r.date).toLocaleString()}"`
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
                                <th className="p-4 font-bold">Student Name</th>
                                <th className="p-4 font-bold">Roll No</th>
                                <th className="p-4 font-bold text-center">Class</th>
                                <th className="p-4 font-bold text-center">Score</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold hidden md:table-cell">Submitted On</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-gray-500 font-medium bg-gray-50/50">
                                        No results found for current filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result, idx) => {
                                    const isPass = result.percentage >= 50;
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4 font-bold text-gray-900">{result.name}</td>
                                            <td className="p-4 text-gray-600 font-medium">{result.roll}</td>
                                            <td className="p-4 text-center">
                                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">
                                                    C{result.class}
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
                                                <button
                                                    onClick={() => handleDelete(result.roll, result.class)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100 shadow-sm"
                                                    title="Delete Result"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
