import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import adminApi from "../api/adminApi";

const AdminSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [viewingUniforms, setViewingUniforms] = useState(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSchools({ search: search || null });
      setSchools(res.data || []);
    } catch (err) {
      console.error("Failed to fetch schools", err);
      setError(err.response?.data?.message || err.message || "Failed to load schools");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this school? This will also affect products associated with it.")) {
      try {
        await adminApi.deleteSchool(id);
        fetchSchools();
      } catch (err) {
        alert(err.response?.data?.message || err.message || "Failed to delete school");
      }
    }
  };

  return (
    <AdminLayout
      title="School Management"
      actions={
        <div className="admin-actions">
          <input
            className="admin-search"
            placeholder="Search schools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-primary-btn" onClick={() => setShowAddModal(true)}>
            + Add School
          </button>
        </div>
      }
    >
      <div className="table-card">
        {error && (
          <div style={{ padding: "20px", color: "#dc2626", background: "#fef2f2", margin: "16px", borderRadius: "8px", fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
            <div style={{ display: "inline-block", width: "28px", height: "28px", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginBottom: "12px" }} />
            <div>Fetching registered schools...</div>
          </div>
        ) : schools.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>No schools registered yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>School Name</th>
                <th>City & State</th>
                <th>Full Address</th>
                <th>Active Uniforms</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {school.logoUrl ? (
                        <img
                          src={school.logoUrl}
                          alt={school.name}
                          style={{ width: "38px", height: "38px", objectFit: "cover", borderRadius: "50%", border: "1px solid #e5e7eb" }}
                        />
                      ) : (
                        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, color: "#9ca3af" }}>
                          🏫
                        </div>
                      )}
                      <strong>{school.name}</strong>
                    </div>
                  </td>
                  <td>{school.city || "-"}, {school.state || "-"}</td>
                  <td style={{ fontSize: "0.85rem", color: "#4b5563" }}>{school.address || "No address defined"}</td>
                  <td>
                    {(school.itemsCount || 0) > 0 ? (
                      <button
                        onClick={() => setViewingUniforms(school)}
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          border: "1px solid #bfdbfe",
                          borderRadius: "8px",
                          padding: "4px 12px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.2s"
                        }}
                      >
                        👕 {school.itemsCount} Uniform(s)
                      </button>
                    ) : (
                      <span
                        style={{
                          background: "#f9fafb",
                          color: "#9ca3af",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "4px 12px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        📭 No uniform listed
                      </span>
                    )}
                  </td>
                  <td className="row-actions">
                    <button
                      onClick={() => setEditingSchool(school)}
                      style={{
                        background: "#f3f4f6",
                        color: "#4b5563",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        marginRight: "6px",
                        cursor: "pointer"
                      }}
                    >
                      ✏ Edit
                    </button>
                    <button className="danger" onClick={() => handleDelete(school.id)}>
                      ⌫
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <SchoolFormModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            fetchSchools();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingSchool && (
        <SchoolFormModal
          school={editingSchool}
          onClose={() => setEditingSchool(null)}
          onSave={() => {
            setEditingSchool(null);
            fetchSchools();
          }}
        />
      )}

      {/* Viewing Uniforms list Modal */}
      {viewingUniforms && (
        <UniformsListModal
          school={viewingUniforms}
          onClose={() => setViewingUniforms(null)}
        />
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SCHOOL CREATION/EDIT MODAL
   ═══════════════════════════════════════════════════════════════════ */
const SchoolFormModal = ({ school, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: school?.name || "",
    city: school?.city || "",
    state: school?.state || "",
    address: school?.address || "",
    logoUrl: school?.logoUrl || ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (school) {
        await adminApi.updateSchool(school.id, formData);
      } else {
        await adminApi.createSchool(formData);
      }
      onSave();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to save school");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px"
      }}
    >
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,8,8,0.4)", backdropFilter: "blur(6px)" }} />
      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "20px",
          maxWidth: "480px",
          width: "100%",
          padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          fontFamily: "Inter, system-ui, sans-serif"
        }}
      >
        <button type="button" onClick={onClose} style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b7280" }}>×</button>
        <h3 style={{ margin: "0 0 20px", fontWeight: 800 }}>{school ? "Edit School Details" : "Register New School"}</h3>

        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 600, marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>School Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Greenwood High School"
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "10px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>City</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Bangalore"
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "10px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>State</label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Karnataka"
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "10px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>School Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full physical location details"
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "10px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>Logo Image URL</label>
            <input
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="e.g. https://domain.com/logo.png"
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "10px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: "11px", border: "1.5px solid #d1d5db", borderRadius: "10px", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: "11px", border: "none", borderRadius: "10px", background: saving ? "#d1d5db" : "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)", color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving school..." : "✓ Save School Info"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   UNIFORMS ASSOCIATED LIST MODAL
   ═══════════════════════════════════════════════════════════════════ */
const UniformsListModal = ({ school, onClose }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.getProducts({ schoolId: school.id })
      .then((res) => {
        // filter down to only active items belonging to this school
        setProducts(res.data || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [school.id]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px"
      }}
    >
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(8,8,8,0.4)", backdropFilter: "blur(6px)" }} />
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: "20px",
          maxWidth: "520px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          fontFamily: "Inter, system-ui, sans-serif"
        }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>Associated School Uniforms</h3>
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Uniforms registered for <strong>{school.name}</strong></span>
          </div>
          <button type="button" onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#6b7280" }}>
              <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginBottom: "8px" }} />
              <div>Scanning catalogs...</div>
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "2rem" }}>📭</span>
              <div style={{ fontWeight: 600, color: "#4b5563" }}>No uniform listed</div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>No uniforms registered for this school yet.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {products.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyItems: "center", padding: "10px", border: "1px solid #f3f4f6", borderRadius: "10px", background: "#f9fafb" }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                  ) : (
                    <div style={{ width: "40px", height: "40px", background: "#e5e7eb", borderRadius: "6px" }} />
                  )}
                  <div style={{ marginLeft: "12px", flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>{p.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>Category: {p.category}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: "#111827", fontSize: "0.9rem", marginRight: "6px" }}>₹{p.price?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb", textAlign: "right", flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 18px", border: "1.5px solid #d1d5db", borderRadius: "8px", background: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>Close Window</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSchools;
