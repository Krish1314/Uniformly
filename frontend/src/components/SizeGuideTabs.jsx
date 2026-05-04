import React, { useState } from 'react';

const SizeGuideTabs = ({ category }) => {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'measure'
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'

  let chartData = null;
  try {
    chartData = category.sizeChartData ? JSON.parse(category.sizeChartData) : null;
  } catch (e) {
    console.error("Invalid chart data", e);
  }

  const convertValue = (val) => {
    if (unit === 'in') return val;
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return (num * 2.54).toFixed(1);
  };

  return (
    <div className="size-guide-tabs">
      <div className="d-flex border-bottom mb-4">
        <button 
          className={`btn flex-grow-1 py-3 border-0 rounded-0 ${activeTab === 'chart' ? 'border-bottom border-dark border-3 fw-bold' : 'text-muted'}`}
          onClick={() => setActiveTab('chart')}
        >
          Size Chart
        </button>
        <button 
          className={`btn flex-grow-1 py-3 border-0 rounded-0 ${activeTab === 'measure' ? 'border-bottom border-dark border-3 fw-bold' : 'text-muted'}`}
          onClick={() => setActiveTab('measure')}
        >
          How to measure
        </button>
      </div>

      {activeTab === 'chart' ? (
        <div>
          <div className="d-flex justify-content-end mb-3">
            <div className="btn-group btn-group-sm">
              <button 
                className={`btn ${unit === 'in' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setUnit('in')}
              >
                in
              </button>
              <button 
                className={`btn ${unit === 'cm' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setUnit('cm')}
              >
                cm
              </button>
            </div>
          </div>

          {chartData ? (
            <div className="table-responsive">
              <table className="table table-bordered text-center align-middle">
                <thead className="bg-light">
                  <tr>
                    {chartData.headers.map(h => (
                      <th key={h} className="fw-bold py-3">{h.replace('(in)', `(${unit})`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.rows.map((row, i) => (
                    <tr key={i}>
                      {chartData.headers.map(h => (
                        <td key={h} className="py-3">
                          {h.toLowerCase().includes('size') ? row[h] : convertValue(row[h])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5 text-center text-muted bg-light rounded">
              Size chart data not available.
            </div>
          )}
        </div>
      ) : (
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            {category.sizeGuideImageUrl ? (
              <img src={category.sizeGuideImageUrl} alt="Measurement Guide" className="img-fluid rounded shadow-sm" />
            ) : (
              <div className="bg-light p-5 text-center rounded">
                <p className="text-muted mb-0">Measurement guide image coming soon.</p>
              </div>
            )}
          </div>
          <div className="col-md-6 ps-md-4">
            <h5 className="fw-bold mb-3">Instructions</h5>
            <p className="text-muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {category.sizeGuideNotes || "Follow the visual guide to measure accurately. We recommend using a soft measuring tape for best results."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeGuideTabs;
