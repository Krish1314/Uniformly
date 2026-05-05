"use client";

import React, { useState } from 'react';

interface Category {
  id: number | string;
  name: string;
  size_guide_image_url?: string;
  size_guide_notes?: string;
  size_chart_data?: string;
}

const SizeGuide = ({ category }: { category: Category }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'measure'>('chart');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  let chartData = null;
  try {
    chartData = category.size_chart_data ? JSON.parse(category.size_chart_data) : null;
  } catch (e) {
    console.error("Invalid chart data", e);
  }

  const convertValue = (val: string) => {
    if (unit === 'in') return val;
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return (num * 2.54).toFixed(1);
  };

  return (
    <div className="size-guide">
      <div className="flex border-b border-gray-100 mb-8">
        <button 
          className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-all ${activeTab === 'chart' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
          onClick={() => setActiveTab('chart')}
        >
          Size Chart
        </button>
        <button 
          className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-all ${activeTab === 'measure' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
          onClick={() => setActiveTab('measure')}
        >
          How to measure
        </button>
      </div>

      {activeTab === 'chart' ? (
        <div className="fade-in">
          <div className="flex justify-end mb-4">
            <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
              <button 
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${unit === 'in' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                onClick={() => setUnit('in')}
              >
                in
              </button>
              <button 
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${unit === 'cm' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                onClick={() => setUnit('cm')}
              >
                cm
              </button>
            </div>
          </div>

          {chartData ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-center border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    {chartData.headers.map((h: string) => (
                      <th key={h} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 py-4 px-4">
                        {h.replace('(in)', `(${unit})`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {chartData.rows.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      {chartData.headers.map((h: string) => (
                        <td key={h} className="py-4 px-4 text-sm font-medium text-gray-900">
                          {h.toLowerCase().includes('size') ? row[h] : convertValue(row[h])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-medium">Detailed size chart data is not available yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center fade-in">
          <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
            {category.size_guide_image_url ? (
              <img src={category.size_guide_image_url} alt="Measurement Guide" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Measurement guide visualization coming soon.</p>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h5 className="text-lg font-bold">Measurement Instructions</h5>
            <div className="space-y-4">
              {category.size_guide_notes ? (
                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  {category.size_guide_notes}
                </p>
              ) : (
                <p className="text-gray-500 text-sm leading-relaxed italic">
                  Standard measuring guidelines apply. Please use a flexible measuring tape for the best results.
                </p>
              )}
              <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                <h6 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pro Tips</h6>
                <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                  <li>Measure over light clothing for accuracy</li>
                  <li>Keep the tape level and snug, but not tight</li>
                  <li>If between sizes, we recommend sizing up for comfort</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeGuide;
