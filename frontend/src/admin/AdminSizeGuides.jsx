import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { categoryApi } from "../api/categoryApi";

const AdminSizeGuides = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    notes: ""
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
      notes: cat.sizeGuideNotes || ""
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await categoryApi.updateSizeGuide(editingCategory.id, formData);
      alert("Size guide updated successfully!");
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error("Failed to update size guide", err);
      alert("Error updating size guide.");
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

            <label>Measurement Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Enter instructions for measurement..."
              rows={5}
            />

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
