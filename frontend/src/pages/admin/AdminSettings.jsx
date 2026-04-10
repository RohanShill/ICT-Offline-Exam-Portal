import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useSettings } from '../../context/SettingsContext';
import api from '../../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Settings2, Building, CheckCircle2, Clock } from 'lucide-react';

export default function AdminSettings() {
    const { getAuthHeaders } = useAdminAuth();
    const { globalSettings, refreshSettings } = useSettings();
    
    // We maintain a local copy of settings to edit before saving
    const [localSettings, setLocalSettings] = useState(() => ({ ...globalSettings }));
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSettingChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleShowAnswers = () => {
        setLocalSettings(prev => ({
            ...prev,
            showAnswers: prev.showAnswers === true || prev.showAnswers === 'true' ? false : true
        }));
    };

    const saveSettings = async () => {
        setIsSaving(true);
        setSuccessMessage('');
        try {
            await api.post('/admin/settings', localSettings, { headers: getAuthHeaders() });
            await refreshSettings();
            setSuccessMessage('Settings updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Platform Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage global configuration and school branding</p>
                </div>
                {successMessage && (
                    <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg font-semibold animate-pulse shadow-sm">
                        <CheckCircle2 size={18} />
                        {successMessage}
                    </div>
                )}
            </div>

            {/* Exam Configuration */}
            <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Settings2 size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl">Global Exam Configuration</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 pl-[52px]">Control the experience dynamically for all active students taking exams.</p>
                    
                    <div className="pl-[52px] flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white text-base">Show Immediate Answers</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">If enabled, students will instantly see whether their selected option is correct or incorrect. They will be locked from modifying their answer.</p>
                        </div>
                        
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={localSettings.showAnswers === true || localSettings.showAnswers === 'true'}
                                onChange={toggleShowAnswers}
                            />
                            <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Branding Configuration */}
            <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Building size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl">School Branding Configuration</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 pl-[52px]">Override the default application branding for a localized test-taking experience.</p>
                    
                    <div className="pl-[52px]">
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">School Name</label>
                                <input 
                                    type="text" 
                                    value={localSettings.schoolName || ''}
                                    onChange={(e) => handleSettingChange('schoolName', e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium dark:text-white transition-all shadow-sm"
                                    placeholder="e.g. PM Shri MS Hiranpur Boys"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">UDISE Code</label>
                                <input 
                                    type="text" 
                                    value={localSettings.udiseCode || ''}
                                    onChange={(e) => handleSettingChange('udiseCode', e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium dark:text-white transition-all shadow-sm"
                                    placeholder="e.g. 20100905901"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold text-lg rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/30"
                >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
