import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { categoryApi } from "../api/categoryApi";

const AdminSizeGuides = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    notes: "",
    chartData: ""
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      imageUrl: cat.sizeGuideImageUrl || "",
      notes: cat.sizeGuideNotes || "",
      chartData: cat.sizeChartData || ""
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Validate JSON
      if (formData.chartData) {
        JSON.parse(formData.chartData);
      }
      await categoryApi.updateSizeGuide(editingCategory.id, formData);
      alert("Size guide updated successfully!");
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("Failed to update size guide", err);
      alert(err instanceof SyntaxError ? "Invalid JSON in Chart Data" : "Error updating size guide.");
    }
  };

  return (
    <AdminLayout title="Size Guides">
      <div className="table-card">
        {loading ? (
          <div className="p-5 text-center text-muted">Loading categories...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Image Status</th>
                <th>Notes Snippet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td><strong>{cat.name}</strong></td>
                  <td>
                    {cat.sizeGuideImageUrl ? (
                      <span className="text-success">● Set</span>
                    ) : (
                      <span className="text-muted">○ Not Set</span>
                    )}
                  </td>
                  <td>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.sizeGuideNotes || "No notes"}
                    </div>
                  </td>
                  <td className="row-actions">
                    <button onClick={() => startEdit(cat)}>Edit Guide</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingCategory && (
        <div className="modal-backdrop">
          <form className="product-modal" onSubmit={handleUpdate}>
            <button type="button" className="modal-close" onClick={() => setEditingCategory(null)}>×</button>
            <h2>Edit Size Guide: {editingCategory.name}</h2>
            
            <label>Image URL</label>
            <input 
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://example.com/size-guide.jpg"
              required
            />

            <label>Measurement Notes (Static How to Measure Image)</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Enter instructions for measurement..."
              rows={3}
            />

            <label>Size Chart Data</label>
            <SizeChartEditor 
              initialData={formData.chartData} 
              onChange={(data) => setFormData({...formData, chartData: data})} 
            />

            <div className="modal-actions mt-4">
              <button type="button" onClick={() => setEditingCategory(null)}>Cancel</button>
              <button type="submit" className="admin-primary-btn">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};

const SizeChartEditor = ({ initialData, onChange }) => {
  const [headers, setHeaders] = useState(["Size", "Measurement (in)"]);
  const [rows, setRows] = useState([["S", ""]]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    try {
      if (initialData) {
        const parsed = JSON.parse(initialData);
        if (parsed && parsed.headers && parsed.rows) {
          setHeaders(parsed.headers);
          const formattedRows = parsed.rows.map(rowObj => 
            parsed.headers.map(h => rowObj[h] || "")
          );
          setRows(formattedRows);
          setIsInitialized(true);
          return;
        }
      }
    } catch(e) {
      console.error("Failed to parse initial data", e);
    }
    // Default fallback
    setHeaders(["Size", "Measurement (in)"]);
    setRows([["S", ""]]);
    setIsInitialized(true);
  }, [initialData, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    const dataToSave = {
      headers: headers,
      rows: rows.map(r => {
        const rowObj = {};
        headers.forEach((h, i) => {
          rowObj[h] = r[i];
        });
        return rowObj;
      })
    };
    onChange(JSON.stringify(dataToSave));
  }, [headers, rows, isInitialized]);

  const addColumn = () => {
    setHeaders([...headers, `New Column`]);
    setRows(rows.map(r => [...r, ""]));
  };

  const removeColumn = (idx) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, i) => i !== idx));
    setRows(rows.map(r => r.filter((_, i) => i !== idx)));
  };

  const addRow = () => {
    setRows([...rows, new Array(headers.length).fill("")]);
  };

  const removeRow = (idx) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  const updateHeader = (idx, val) => {
    const newHeaders = [...headers];
    newHeaders[idx] = val;
    setHeaders(newHeaders);
  };

  const updateCell = (rowIdx, colIdx, val) => {
    const newRows = [...rows];
    newRows[rowIdx][colIdx] = val;
    setRows(newRows);
  };

  return (
    <div className="size-chart-editor border rounded p-3 bg-light">
      <datalist id="measurement-suggestions">
        <option value="Size" />
        <option value="Brand Size" />
        <option value="Chest (in)" />
        <option value="Front Length (in)" />
        <option value="Across Shoulder (in)" />
        <option value="Waist (in)" />
        <option value="Inseam Length (in)" />
        <option value="Sleeve Length (in)" />
        <option value="Hip (in)" />
      </datalist>

      <div className="table-responsive mb-3">
        <table className="table table-bordered table-sm bg-white m-0">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="position-relative p-2" style={{ minWidth: '130px' }}>
                  <div className="d-flex align-items-center">
                    <input 
                      type="text" 
                      list="measurement-suggestions"
                      className="form-control form-control-sm flex-grow-1 border-0 fw-bold shadow-none p-0" 
                      value={h}
                      onChange={(e) => updateHeader(i, e.target.value)}
                      placeholder="Column Name"
                    />
                    {headers.length > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-link text-danger p-0 ms-2 text-decoration-none"
                        onClick={() => removeColumn(i)}
                        title="Remove Column"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="p-2">
                    <input 
                      type="text" 
                      className="form-control form-control-sm border-0 shadow-none p-0" 
                      value={cell}
                      onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                      placeholder="Value"
                    />
                  </td>
                ))}
                <td style={{ width: '40px', verticalAlign: 'middle', textAlign: 'center' }}>
                   {rows.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-link text-danger p-0 text-decoration-none"
                      onClick={() => removeRow(rowIdx)}
                      title="Remove Row"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addRow}>+ Add Row</button>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addColumn}>+ Add Column</button>
      </div>
    </div>
  );
};

export default AdminSizeGuides;
