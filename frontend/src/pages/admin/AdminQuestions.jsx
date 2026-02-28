import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import api from '../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Pencil, Trash2, Plus, X, FileQuestion } from 'lucide-react';

export default function AdminQuestions() {
    const { getAuthHeaders } = useAdminAuth();
    const [selectedClass, setSelectedClass] = useState('6');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal / Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        questionText: '',
        options: ['', '', '', ''],
        correctIndex: 0
    });

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/questions/${selectedClass}`, { headers: getAuthHeaders() });
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [selectedClass]);

    const handleOpenForm = (q = null) => {
        if (q) {
            setEditingId(q.id);
            setFormData({
                questionText: q.question,
                options: [...q.options],
                correctIndex: q.correct
            });
        } else {
            setEditingId(null);
            setFormData({
                questionText: '',
                options: ['', '', '', ''],
                correctIndex: 0
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!formData.questionText.trim() || formData.options.some(opt => !opt.trim())) {
            alert('All fields are required');
            return;
        }

        const payload = {
            studentClass: selectedClass,
            questionText: formData.questionText,
            options: formData.options,
            correctIndex: Number(formData.correctIndex)
        };

        try {
            if (editingId) {
                await api.put(`/admin/questions/${editingId}`, payload, { headers: getAuthHeaders() });
            } else {
                await api.post('/admin/questions', payload, { headers: getAuthHeaders() });
            }
            handleCloseForm();
            fetchQuestions();
        } catch (err) {
            alert('Failed to save question');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;

        try {
            await api.delete(`/admin/questions/${id}?studentClass=${selectedClass}`, { headers: getAuthHeaders() });
            fetchQuestions();
        } catch (err) {
            alert('Failed to delete question');
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
                    <p className="text-gray-500 mt-2">Add, edit, and organize exam questions</p>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)] font-medium"
                    >
                        <option value="6">Class 6</option>
                        <option value="7">Class 7</option>
                        <option value="8">Class 8</option>
                    </select>

                    <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                        <Plus size={18} />
                        Add Question
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <CardTitle>Questions for Class {selectedClass}</CardTitle>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                        Total: {questions.length}
                    </span>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading questions...</div>
                    ) : questions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <FileQuestion size={48} className="text-gray-300 mb-4" />
                            <p>No questions found for this class.</p>
                            <Button variant="ghost" className="mt-4" onClick={() => handleOpenForm()}>
                                Add your first question
                            </Button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {questions.map((q, idx) => (
                                <li key={q.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <h3 className="text-lg font-medium text-gray-900 leading-snug">
                                                    {q.question}
                                                </h3>
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-9">
                                                {q.options.map((opt, optIdx) => (
                                                    <div
                                                        key={optIdx}
                                                        className={`p-3 rounded-lg border text-sm flex items-center gap-3 ${q.correct === optIdx
                                                            ? 'border-green-200 bg-green-50 text-green-800 font-medium'
                                                            : 'border-gray-200 bg-gray-50/50 text-gray-600'
                                                            }`}
                                                    >
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${q.correct === optIdx ? 'border-green-400 bg-white' : 'border-gray-300 bg-white'
                                                            }`}>
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </span>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleOpenForm(q)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Question"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Question"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {/* Editor Modal Overlay */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Edit Question' : 'Add New Question'}
                            </h2>
                            <button
                                onClick={handleCloseForm}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                                <textarea
                                    value={formData.questionText}
                                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none"
                                    rows="3"
                                    placeholder="Enter the question..."
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Options & Correct Answer</label>
                                <p className="text-xs text-gray-500 -mt-3 mb-2">Select the radio button next to the correct answer.</p>

                                {formData.options.map((opt, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${formData.correctIndex === idx ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}>
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={formData.correctIndex === idx}
                                            onChange={() => setFormData({ ...formData, correctIndex: idx })}
                                            className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                                        />
                                        <span className="font-mono text-sm text-gray-500 font-bold">{String.fromCharCode(65 + idx)}.</span>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800"
                                            placeholder={`Option ${idx + 1}`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button variant="secondary" type="button" onClick={handleCloseForm}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit">
                                    {editingId ? 'Save Changes' : 'Create Question'}
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
