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

            <label>Size Chart Data (JSON)</label>
            <textarea 
              value={formData.chartData}
              onChange={(e) => setFormData({...formData, chartData: e.target.value})}
              placeholder='{"headers": ["Size", "Waist (in)", "Inseam (in)"], "rows": [{"Size": "30", "Waist (in)": "30.0", "Inseam (in)": "9.5"}]}'
              rows={8}
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <small className="text-muted mb-3 d-block">
              Paste a JSON with "headers" (array) and "rows" (array of objects mapping headers to values).
            </small>

            <div className="modal-actions">
              <button type="button" onClick={() => setEditingCategory(null)}>Cancel</button>
              <button type="submit" className="admin-primary-btn">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSizeGuides;
