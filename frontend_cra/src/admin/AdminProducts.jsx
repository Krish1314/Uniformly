import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import adminApi from "../api/adminApi";

/* ─── Stock badge helper ─────────────────────────────────────────── */
const StockBadge = ({ qty }) => {
  if (qty === 0)  return <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem' }}>⚠ Out of stock</span>;
  if (qty < 10)   return <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.82rem' }}>⚡ {qty} left</span>;
  return <span style={{ color: '#16a34a', fontWeight: 500, fontSize: '0.85rem' }}>{qty}</span>;
};

/* ═══════════════════════════════════════════════════════════════════
   RESTOCK MODAL
   ═══════════════════════════════════════════════════════════════════ */
const RestockModal = ({ product, onClose, onSaved }) => {
  const [variants,   setVariants]   = useState([]);
  const [edits,      setEdits]      = useState({});
  const [saving,     setSaving]     = useState(false);
  const [isLoading,  setIsLoading]  = useState(true);  // ← explicit loading state
  const [loadErr,    setLoadErr]    = useState(null);
  const [savedIds,   setSavedIds]   = useState(new Set());

  const [initSizes, setInitSizes] = useState(["S", "M", "L", "XL"]);
  const [newInitSize, setNewInitSize] = useState("");

  const handleAddInitSize = () => {
    const size = newInitSize.trim().toUpperCase();
    if (size && !initSizes.includes(size)) {
      setInitSizes(prev => [...prev, size]);
    }
    setNewInitSize("");
  };

  const handleRemoveInitSize = (sizeToRemove) => {
    setInitSizes(prev => prev.filter(s => s !== sizeToRemove));
  };

  const [initColors, setInitColors] = useState(() => {
    if (!product || !product.name) return "Maroon";
    const colors = ["Maroon", "Navy", "White", "Black", "Grey", "Blue", "Khaki", "Green", "Yellow", "Red"];
    for (const c of colors) {
      if (product.name.toLowerCase().includes(c.toLowerCase())) {
        return c;
      }
    }
    return "Maroon";
  });
  const [initQty, setInitQty] = useState(10);
  const [initErr, setInitErr] = useState(null);
  const [initializing, setInitializing] = useState(false);

  const handleInitialize = async () => {
    setInitializing(true);
    setInitErr(null);
    try {
      const sizes = initSizes;
      const colors = initColors.split(',').map(c => c.trim()).filter(Boolean);
      if (sizes.length === 0 || colors.length === 0) {
        throw new Error("Sizes and Colors are required to generate variants.");
      }
      const res = await adminApi.initializeVariants(product.id, {
        sizes,
        colors,
        stockQuantity: initQty
      });
      const data = res.data || [];
      setVariants(data);
      const initial = {};
      data.forEach(v => { initial[v.variantId] = v.stockQuantity; });
      setEdits(initial);
      onSaved();
    } catch (err) {
      console.error(err);
      setInitErr(err.response?.data?.message || err.message || 'Failed to initialize.');
    } finally {
      setInitializing(false);
    }
  };

  /* Load variants on mount */
  useEffect(() => {
    setIsLoading(true);
    setLoadErr(null);
    adminApi.getProductVariants(product.id)
      .then(res => {
        const data = res.data || [];
        setVariants(data);
        const initial = {};
        data.forEach(v => { initial[v.variantId] = v.stockQuantity; });
        setEdits(initial);
      })
      .catch(err => {
        console.error('Failed to load variants', err);
        setLoadErr(err.response?.data?.message || 'Failed to load variants — please try again.');
      })
      .finally(() => setIsLoading(false));
  }, [product.id]);

  const handleQtyChange = (variantId, value) => {
    const n = parseInt(value, 10);
    setEdits(prev => ({ ...prev, [variantId]: isNaN(n) ? 0 : Math.max(0, n) }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const newlySaved = new Set(savedIds);
    try {
      for (const variant of variants) {
        const newQty = edits[variant.variantId];
        if (newQty !== variant.stockQuantity) {
          await adminApi.updateVariantStock(product.id, variant.variantId, newQty);
          newlySaved.add(variant.variantId);
        }
      }
      setSavedIds(newlySaved);
      onSaved();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  const totalAfter = Object.values(edits).reduce((s, n) => s + (n || 0), 0);
  const hasChanges = variants.some(v => edits[v.variantId] !== v.stockQuantity);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.6)', backdropFilter: 'blur(3px)' }}
      />

      {/* Card */}
      <div style={{
        position: 'relative',
        background: '#fff',
        borderRadius: '18px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        animation: 'restockSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>

        {/* Header */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                Restock Product
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#111' }}>
                {product.name}
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '3px' }}>
                {product.school} · Total stock after: <strong style={{ color: totalAfter === 0 ? '#dc2626' : '#111' }}>{totalAfter}</strong>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', color: '#6b7280' }}
            >×</button>
          </div>
        </div>

        {/* Body — variant table */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #e5e7eb', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: '12px' }} />
              <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Loading variants…</div>
            </div>
          ) : loadErr ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
              <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: '8px' }}>{loadErr}</div>
              <button
                onClick={() => { setLoadErr(null); setIsLoading(true); adminApi.getProductVariants(product.id).then(res => { const d = res.data||[]; setVariants(d); const init={}; d.forEach(v=>{init[v.variantId]=v.stockQuantity;}); setEdits(init); }).catch(e=>setLoadErr(e.response?.data?.message||'Failed to load variants')).finally(()=>setIsLoading(false)); }}
                style={{ padding: '8px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                Retry
              </button>
            </div>
          ) : variants.length === 0 ? (
            <div style={{ padding: '24px 28px 32px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 50%, #eff6ff 100%)',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px dashed #fcd34d',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ fontSize: '1.8rem', marginTop: '2px' }}>⚡</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#b45309' }}>
                      Variant Seeding Required
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#78350f', lineHeight: 1.4 }}>
                      This product currently has <strong>0 variants</strong> configured. Generate sizes and colors below to dynamically initialize inventory tracking.
                    </p>
                  </div>
                </div>
              </div>

              {initErr && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#991b1b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚠</span> {initErr}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Sizes
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', minHeight: '32px', alignItems: 'center' }}>
                    {initSizes.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>No sizes added yet</span>
                    ) : (
                      initSizes.map(s => (
                        <span key={s} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: '#111', color: '#fff', padding: '4px 10px',
                          borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          {s}
                          <button type="button" onClick={() => handleRemoveInitSize(s)} style={{
                            background: 'none', border: 'none', color: '#fca5a5',
                            padding: 0, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center'
                          }}>×</button>
                        </span>
                      ))
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="e.g. XXL"
                      value={newInitSize}
                      onChange={e => setNewInitSize(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddInitSize(); } }}
                      style={{
                        flex: 1, padding: '10px 14px', border: '1.5px solid #d1d5db',
                        borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                    <button type="button" onClick={handleAddInitSize} style={{
                      background: '#111', color: '#fff', border: 'none', borderRadius: '10px',
                      padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                    }}>
                      + Add Size
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Colors <span style={{ color: '#9ca3af', fontWeight: 500 }}>(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={initColors}
                    onChange={e => setInitColors(e.target.value)}
                    placeholder="Maroon, Navy"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#111'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Initial Stock <span style={{ color: '#9ca3af', fontWeight: 500 }}>(per size/color variant combo)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={initQty}
                    onChange={e => setInitQty(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#111'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '10px',
                    background: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.target.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { e.target.style.background = '#fff'; }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInitialize}
                  disabled={initializing}
                  style={{
                    flex: 2,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '10px',
                    background: initializing ? '#d1d5db' : 'linear-gradient(135deg, #111 0%, #374151 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: initializing ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: initializing ? 'none' : '0 4px 12px rgba(17,17,17,0.15)',
                  }}
                  onMouseEnter={e => { if(!initializing) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 16px rgba(17,17,17,0.25)'; } }}
                  onMouseLeave={e => { if(!initializing) { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 12px rgba(17,17,17,0.15)'; } }}
                >
                  {initializing ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Initializing...
                    </div>
                  ) : '⚡ Initialize & Generate Variants'}
                </button>
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '10px 20px', textAlign: 'left',  fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Size</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left',  fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Color</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Current</th>
                  <th style={{ padding: '10px 20px 10px 12px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>New Qty</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => {
                  const changed = edits[v.variantId] !== v.stockQuantity;
                  const isOos   = v.stockQuantity === 0;
                  return (
                    <tr
                      key={v.variantId}
                      style={{
                        borderTop: '1px solid #f3f4f6',
                        background: isOos ? '#fff7f7' : (i % 2 === 0 ? '#fff' : '#fafafa'),
                      }}
                    >
                      <td style={{ padding: '12px 20px', fontWeight: 700, fontSize: '0.92rem' }}>
                        {isOos && <span title="Out of stock" style={{ marginRight: '6px' }}>🔴</span>}
                        {v.size}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.88rem', color: '#374151' }}>{v.color}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <StockBadge qty={v.stockQuantity} />
                      </td>
                      <td style={{ padding: '10px 20px 10px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {changed && (
                            <span style={{
                              fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                              background: '#2563eb', borderRadius: '999px',
                              padding: '1px 6px', flexShrink: 0,
                            }}>
                              {edits[v.variantId] > v.stockQuantity ? `+${edits[v.variantId] - v.stockQuantity}` : `${edits[v.variantId] - v.stockQuantity}`}
                            </span>
                          )}
                          <input
                            type="number"
                            min="0"
                            value={edits[v.variantId] ?? v.stockQuantity}
                            onChange={e => handleQtyChange(v.variantId, e.target.value)}
                            style={{
                              width: '72px',
                              padding: '6px 10px',
                              border: changed ? '2px solid #2563eb' : '1.5px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              textAlign: 'center',
                              outline: 'none',
                              transition: 'border-color 0.15s',
                              background: changed ? '#eff6ff' : '#fff',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {variants.length > 0 && (
          <div style={{ padding: '16px 28px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
              {hasChanges ? `${variants.filter(v => edits[v.variantId] !== v.stockQuantity).length} variant(s) changed` : 'No changes yet'}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onClose}
                style={{ padding: '9px 20px', border: '1.5px solid #d1d5db', borderRadius: '8px', background: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving || !hasChanges}
                style={{
                  padding: '9px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: hasChanges ? '#111' : '#d1d5db',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: hasChanges ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  transition: 'background 0.15s',
                }}
              >
                {saving ? 'Saving…' : '✓ Save Stock'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes restockSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
const AdminProducts = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showAddModal, setShowAddModal]     = useState(false);
  const [restockProduct, setRestockProduct] = useState(null); // product being restocked

  const fetchProducts = useCallback(() => {
    setLoading(true);
    adminApi.getProducts({ search: search || null })
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products", err))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      adminApi.deleteProduct(id).then(fetchProducts).catch(console.error);
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await adminApi.updateProduct(product.id, {
        featured: !product.featured
      });
      fetchProducts();
    } catch (err) {
      alert("Failed to update featured status: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout
      title="Products"
      actions={
        <div className="admin-actions">
          <input
            className="admin-search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="admin-primary-btn" onClick={() => setShowAddModal(true)}>
            + Add Product
          </button>
        </div>
      }
    >
      <div className="table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>No products found.</div>
        ) : (
          <table className="admin-table products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>School</th>
                <th>Category</th>
                <th>Price</th>
                <th>Featured</th>
                <th>Total Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ background: product.stockQuantity === 0 ? '#fff8f8' : undefined }}>
                  <td>
                    <div className="product-cell">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{ width: "38px", height: "38px", objectFit: "cover", borderRadius: "6px" }}
                        />
                      ) : (
                        <div className="admin-thumb" />
                      )}
                      <div style={{ marginLeft: "12px" }}>
                        <strong>{product.name}</strong>
                        {product.featured && <p className="featured-pill">Featured</p>}
                      </div>
                    </div>
                  </td>
                  <td>{product.school}</td>
                  <td><span className="category-pill">{product.category}</span></td>
                  <td><strong>₹{product.price?.toLocaleString()}</strong></td>
                  <td>
                    <button
                      onClick={() => handleToggleFeatured(product)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.4rem',
                        cursor: 'pointer',
                        color: product.featured ? '#eab308' : '#d1d5db',
                        transition: 'transform 0.15s, color 0.15s',
                        outline: 'none',
                        padding: '4px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={product.featured ? "Unfeature product" : "Feature product"}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                    >
                      {product.featured ? '★' : '☆'}
                    </button>
                  </td>
                  <td>
                    <StockBadge qty={product.stockQuantity} />
                  </td>
                  <td className="row-actions">
                    {/* Restock button */}
                    <button
                      title="Restock variants"
                      onClick={() => setRestockProduct(product)}
                      style={{
                        background: product.stockQuantity === 0 ? '#fef2f2' : '#f0fdf4',
                        color:      product.stockQuantity === 0 ? '#dc2626' : '#16a34a',
                        border:     product.stockQuantity === 0 ? '1px solid #fca5a5' : '1px solid #bbf7d0',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginRight: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.stockQuantity === 0 ? '⚠ Restock' : '📦 Stock'}
                    </button>
                    <button className="danger" onClick={() => deleteProduct(product.id)}>⌫</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Product modal */}
      {showAddModal && (
        <ProductModal
          onClose={() => setShowAddModal(false)}
          onSave={() => { setShowAddModal(false); fetchProducts(); }}
        />
      )}

      {/* Restock modal */}
      {restockProduct && (
        <RestockModal
          product={restockProduct}
          onClose={() => setRestockProduct(null)}
          onSaved={() => { fetchProducts(); }}
        />
      )}
    </AdminLayout>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   ADD PRODUCT MODAL (unchanged logic, minor cleanup)
   ═══════════════════════════════════════════════════════════════════ */
const ProductModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "", schoolId: "1", categoryId: "1", price: "",
    compareAtPrice: "", imageUrl: "", description: "",
    featured: false, stockQuantity: 100,
    sizes: ["S", "M", "L", "XL"], colors: "Navy, White",
  });
  const [newSize, setNewSize]         = useState("");
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving]           = useState(false);

  const handleAddSize = () => {
    const size = newSize.trim().toUpperCase();
    if (size && !formData.sizes.includes(size)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, size]
      }));
    }
    setNewSize("");
  };

  const handleRemoveSize = (sizeToRemove) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== sizeToRemove)
    }));
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = e => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadResponse = await adminApi.uploadProductImage(imageFile);
        imageUrl = uploadResponse.data.imageUrl;
      }
      await adminApi.createProduct({
        ...formData, imageUrl,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity),
        sizes: formData.sizes,
        colors: formData.colors.split(",").map(c => c.trim()).filter(Boolean),
      });
      alert("Product created successfully!");
      onSave();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="product-modal" onSubmit={handleSubmit}>
        <button type="button" className="modal-close" onClick={onClose}>×</button>
        <h2>Add New Product</h2>

        <label>Product Name</label>
        <input name="name" value={formData.name} onChange={handleChange} required autoFocus />

        <div className="form-grid">
          <div>
            <label>School ID</label>
            <input name="schoolId" type="number" value={formData.schoolId} onChange={handleChange} required />
          </div>
          <div>
            <label>Category ID</label>
            <input name="categoryId" type="number" value={formData.categoryId} onChange={handleChange} required />
          </div>
          <div>
            <label>Price ₹</label>
            <input name="price" type="number" value={formData.price} onChange={handleChange} required />
          </div>
          <div>
            <label>Compare at Price ₹ (Optional)</label>
            <input name="compareAtPrice" type="number" value={formData.compareAtPrice} onChange={handleChange} />
          </div>
          <div>
            <label>Default Stock Quantity (per variant)</label>
            <input name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} required />
          </div>
          <div>
            <label>Product Image</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
          </div>
          <div>
            <label>Image URL</label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Auto-filled after upload, or paste URL" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Sizes</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', minHeight: '32px', alignItems: 'center' }}>
              {formData.sizes.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>No sizes added yet</span>
              ) : (
                formData.sizes.map(s => (
                  <span key={s} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    background: '#111', color: '#fff', padding: '4px 10px',
                    borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600
                  }}>
                    {s}
                    <button type="button" onClick={() => handleRemoveSize(s)} style={{
                      background: 'none', border: 'none', color: '#fca5a5',
                      padding: 0, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}>×</button>
                  </span>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. XXL"
                value={newSize}
                onChange={e => setNewSize(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); } }}
                style={{
                  flex: 1, padding: '8px 12px', border: '1.5px solid #d1d5db',
                  borderRadius: '8px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button type="button" onClick={handleAddSize} style={{
                background: '#111', color: '#fff', border: 'none', borderRadius: '8px',
                padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}>
                + Add Size
              </button>
            </div>
          </div>
          <div>
            <label>Colors (comma separated)</label>
            <input name="colors" value={formData.colors} onChange={handleChange} placeholder="Navy, White" />
          </div>
        </div>

        {imagePreview && (
          <div style={{ marginTop: "14px" }}>
            <label>Preview</label>
            <img src={imagePreview} alt="Product preview"
              style={{ width: "96px", height: "96px", objectFit: "cover", borderRadius: "6px", border: "1px solid #d8dee8" }} />
          </div>
        )}

        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <div className="feature-box">
          <input name="featured" type="checkbox" checked={formData.featured} onChange={handleChange} />
          <div>
            <strong>Featured Product</strong>
            <p>Show this product on the home page</p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProducts;
