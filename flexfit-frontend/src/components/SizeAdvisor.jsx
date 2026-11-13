import { useState } from 'react';
import { Sparkles, Ruler } from 'lucide-react';

export default function SizeAdvisor({ onRecommend }) {
    const [open, setOpen] = useState(false);
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [fit, setFit] = useState('regular');
    const [recommendation, setRecommendation] = useState('');

    const handleCalculate = (e) => {
        e.preventDefault();
        if (!height || !weight) return;
        
        // Simple logic for dummy AI recommendation
        const h = parseInt(height);
        const w = parseInt(weight);
        
        let recSize = 'M';
        if (w < 60) recSize = 'S';
        else if (w < 75) recSize = 'M';
        else if (w < 90) recSize = 'L';
        else if (w < 110) recSize = 'XL';
        else recSize = 'XXL';
        
        if (fit === 'loose' && recSize !== 'XXL') {
            const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
            recSize = sizes[sizes.indexOf(recSize) + 1] || 'XXL';
        } else if (fit === 'tight' && recSize !== 'S') {
            const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            recSize = sizes[sizes.indexOf(recSize) - 1] || 'XS';
        }
        
        setRecommendation(`Recommended: Size ${recSize}`);
        if (onRecommend) onRecommend(recSize);
    };

    if (!open) {
        return (
            <button 
                type="button"
                onClick={() => setOpen(true)}
                className="mt-1 mb-3 flex items-center gap-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg transition border border-brand-200"
            >
                <Sparkles size={16} /> AI Size Advisor
            </button>
        );
    }

    return (
        <div className="mt-1 mb-4 p-4 border border-brand-200 bg-brand-50/50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-brand-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-brand-600" /> AI Size Advisor
                </h4>
                <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Close</button>
            </div>
            
            <form onSubmit={handleCalculate} className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input 
                        type="number" 
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-lg p-2 bg-white focus:ring-brand-500 focus:border-brand-500 outline-none border"
                        placeholder="e.g. 175"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input 
                        type="number" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-lg p-2 bg-white focus:ring-brand-500 focus:border-brand-500 outline-none border"
                        placeholder="e.g. 70"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fit Preference</label>
                    <div className="flex gap-2">
                        {['tight', 'regular', 'loose'].map(f => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFit(f)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize border transition ${
                                    fit === f ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <button 
                    type="submit"
                    className="col-span-2 mt-2 bg-gray-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                    <Ruler size={16} /> Get Recommendation
                </button>
            </form>
            
            {recommendation && (
                <div className="mt-3 p-3 bg-white border border-brand-200 rounded-lg text-center shadow-sm">
                    <p className="text-brand-700 font-bold">{recommendation}</p>
                </div>
            )}
        </div>
    );
}
