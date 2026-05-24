import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import adminApi from "../api/adminApi";

/* ─── Stock badge with hover breakdown tooltip ───────────────────── */
const variantCache = {}; // module-level cache: productId → variants[]

const StockBadgeWithTooltip = ({ qty, productId }) => {
  const [hovered, setHovered]   = useState(false);
  const [variants, setVariants] = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleMouseEnter = async () => {
    setHovered(true);
    if (variantCache[productId]) {
      setVariants(variantCache[productId]);
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.getProductVariants(productId);
      variantCache[productId] = res.data || [];
      setVariants(variantCache[productId]);
    } catch (e) {
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  /* Badge colours */
  let badgeStyle, dotColor, label;
  if (qty === 0) {
    badgeStyle = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' };
    dotColor   = '#dc2626';
    label      = 'Out of Stock';
  } else if (qty < 10) {
    badgeStyle = { background: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7' };
    dotColor   = '#d97706';
    label      = `Low Stock (${qty} left)`;
  } else {
    badgeStyle = { background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' };
    dotColor   = '#16a34a';
    label      = `In Stock (${qty})`;
  }

  /* Group variants by size for the popover */
  const bySize = {};
  (variants || []).forEach(v => {
    if (!bySize[v.size]) bySize[v.size] = [];
    bySize[v.size].push(v);
  });
  const sizes = Object.keys(bySize).sort();

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Badge ── */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        borderRadius: '9999px', padding: '4px 10px',
        fontSize: '0.75rem', fontWeight: 700,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        cursor: 'default', userSelect: 'none',
        ...badgeStyle,
      }}>
        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        {label}
      </span>

      {/* ── Tooltip popover ── */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.13)',
          padding: '12px 14px', zIndex: 9999,
          minWidth: '200px', maxWidth: '280px',
          fontFamily: 'Inter, system-ui, sans-serif',
          pointerEvents: 'none',
          animation: 'fadeInUp 0.12s ease',
        }}>
          {/* Arrow */}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
            borderTop: '7px solid #e5e7eb',
          }} />
          <div style={{
            position: 'absolute', top: 'calc(100% - 1px)', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '6px solid #fff',
          }} />

          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Stock by Size
          </div>

          {loading ? (
            <div style={{ color: '#9ca3af', fontSize: '0.78rem', textAlign: 'center', padding: '6px 0' }}>Loading…</div>
          ) : sizes.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>No variants found</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sizes.map(size => (
                <div key={size}>
                  {/* Size header */}
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '3px' }}>
                    Size {size}
                  </div>
                  {/* Color rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px' }}>
                    {bySize[size].map(v => {
                      const isOut  = v.stockQuantity === 0;
                      const isLow  = v.stockQuantity > 0 && v.stockQuantity < 10;
                      const stockColor = isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a';
                      return (
                        <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>{v.color}</span>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, color: stockColor,
                            minWidth: '36px', textAlign: 'right',
                          }}>
                            {isOut ? 'Out' : v.stockQuantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════════════
   EDIT PRODUCT & VARIANT STOCK MODAL
   ═══════════════════════════════════════════════════════════════════ */
const EditProductModal = ({ product, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: "",
    schoolId: "",
    categoryId: "",
    price: "",
    compareAtPrice: "",
    imageUrl: "",
    description: "",
    featured: false,
    sizes: []
  });
  const [newSize, setNewSize] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const [variants, setVariants] = useState([]);
  const [edits, setEdits] = useState({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [schoolsList, setSchoolsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  
  // Seeding state variables (if product has no variants configuration)
  const [initSizes, setInitSizes] = useState(["S", "M", "L", "XL"]);
  const [newInitSize, setNewInitSize] = useState("");
  const [initColors, setInitColors] = useState("Navy, White");
  const [initQty, setInitQty] = useState(10);
  const [initializing, setInitializing] = useState(false);

  // Fetch product details & variants
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch detailed product info to get description, categoryId, featured status
        const productRes = await adminApi.getProduct(product.id);
        const p = productRes.data;
        
        // Fetch variants
        const variantsRes = await adminApi.getProductVariants(product.id);
        const vList = variantsRes.data || [];

        // Fetch schools and categories list for selector dropdowns
        const schoolsRes = await adminApi.getSchools();
        const categoriesRes = await adminApi.getCategories();
        
        if (!active) return;
        
        setSchoolsList(schoolsRes.data || []);
        setCategoriesList(categoriesRes.data || []);
        setVariants(vList);
        const initialEdits = {};
        vList.forEach(v => {
          initialEdits[v.variantId] = v.stockQuantity;
        });
        setEdits(initialEdits);
        
        const uniqueSizes = [...new Set(vList.map(v => v.size))];
        
        setFormData({
          name: p.name || "",
          schoolId: p.school?.id || "",
          categoryId: p.categoryId || "",
          price: p.price || "",
          compareAtPrice: p.compareAtPrice || "",
          imageUrl: p.imageUrl || "",
          description: p.description || "",
          featured: p.featured || false,
          sizes: uniqueSizes.length > 0 ? uniqueSizes : ["S", "M", "L", "XL"]
        });
        
        setImagePreview(p.imageUrl || "");
      } catch (err) {
        console.error("Error loading product edit details", err);
        setError(err.response?.data?.message || err.message || "Failed to load product details");
      } finally {
        if (active) setIsLoading(false);
      }
    };
    
    loadData();
    return () => { active = false; };
  }, [product.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : formData.imageUrl);
  };

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

  // Seeding handlers
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
  
  const handleInitialize = async () => {
    setInitializing(true);
    setError(null);
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
      
      const uniqueSizes = [...new Set(data.map(v => v.size))];
      setFormData(prev => ({
        ...prev,
        sizes: uniqueSizes
      }));
      
      onSaved();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to initialize variants.');
    } finally {
      setInitializing(false);
    }
  };

  const handleQtyChange = (variantId, value) => {
    const n = parseInt(value, 10);
    setEdits(prev => ({
      ...prev,
      [variantId]: isNaN(n) ? 0 : Math.max(0, n)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadResponse = await adminApi.uploadProductImage(imageFile);
        finalImageUrl = uploadResponse.data.imageUrl;
      }
      
      // 1. Update general product info
      const updatePayload = {
        name: formData.name,
        schoolId: formData.schoolId ? parseInt(formData.schoolId, 10) : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
        imageUrl: finalImageUrl,
        description: formData.description,
        featured: formData.featured,
        sizes: formData.sizes
      };
      
      await adminApi.updateProduct(product.id, updatePayload);
      
      // 2. Update individual variants stock if changed
      for (const variant of variants) {
        const newQty = edits[variant.variantId];
        if (newQty !== variant.stockQuantity) {
          await adminApi.updateVariantStock(product.id, variant.variantId, newQty);
        }
      }
      
      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to save product edits", err);
      setError(err.response?.data?.message || err.message || "Failed to update product details.");
    } finally {
      setSaving(false);
    }
  };

  const hasVariantChanges = variants.some(v => edits[v.variantId] !== v.stockQuantity);
  const totalStock = Object.values(edits).reduce((s, n) => s + (n || 0), 0);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(8, 8, 8, 0.4)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s'
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'relative',
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.25)',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            background: '#fafafa'
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#2563eb',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: '#eff6ff',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'inline-block',
                marginBottom: '6px'
              }}
            >
              Product Configurator
            </span>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>
              Edit: {product.name}
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '4px', display: 'block' }}>
              Product ID: #{product.id} · Total stock count: <strong style={{ color: totalStock === 0 ? '#dc2626' : '#16a34a' }}>{totalStock}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
            onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
          >
            ×
          </button>
        </div>

        {/* Scrollable Workspace */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '32px' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '12px',
                padding: '16px 20px',
                color: '#b91c1c',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>⚠️</span>
              <div style={{ flex: 1 }}>{error}</div>
            </div>
          )}

          {isLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '32px',
                  height: '32px',
                  border: '3px solid #f3f4f6',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '16px'
                }}
              />
              <div style={{ color: '#4b5563', fontSize: '0.9rem', fontWeight: 500 }}>Loading product catalog & stock configurations...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div
                className="edit-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: '32px',
                }}
              >
                {/* LEFT COLUMN: GENERAL DETAILS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#111827', borderBottom: '2px solid #f3f4f6', paddingBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    General Specifications
                  </h4>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Product Display Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1.5px solid #d1d5db',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#2563eb'}
                      onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Select School
                      </label>
                      <select
                        name="schoolId"
                        value={formData.schoolId}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1.5px solid #d1d5db',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: '#ffffff',
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <option value="">-- Choose School --</option>
                        {schoolsList.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Select Category
                      </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1.5px solid #d1d5db',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: '#ffffff',
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <option value="">-- Choose Category --</option>
                        {categoriesList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Price (₹)
                      </label>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1.5px solid #d1d5db',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Compare-at Price (₹) <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                      </label>
                      <input
                        name="compareAtPrice"
                        type="number"
                        step="0.01"
                        value={formData.compareAtPrice}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1.5px solid #d1d5db',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Detailed Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1.5px solid #d1d5db',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        resize: 'vertical',
                      }}
                      onFocus={e => e.target.style.borderColor = '#2563eb'}
                      onBlur={e => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Image Uploader
                      </label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageChange}
                        style={{
                          width: '100%',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Direct Image URL
                      </label>
                      <input
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="Direct web link"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1.5px solid #d1d5db',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#2563eb'}
                        onBlur={e => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>

                  {imagePreview && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f9fafb', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d1d5db' }}
                      />
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b5563', display: 'block' }}>Media Preview Active</span>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', wordBreak: 'break-all', display: 'block', maxWidth: '280px' }}>
                          {imageFile ? `Local: ${imageFile.name}` : formData.imageUrl || 'Default active image'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      background: '#fdfdfd',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <input
                      name="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={handleChange}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#111827', display: 'block' }}>Featured Showcase</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
                        Highlight and show this product on the home page storefront
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: SIZES BUILDER & STOCK LEVEL INLINE EDIT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Sizes Builder Container */}
                  <div
                    style={{
                      background: '#fafafa',
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '20px'
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Sizes Builder
                    </h4>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px', minHeight: '36px', alignItems: 'center' }}>
                      {formData.sizes.length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>No size metrics defined yet.</span>
                      ) : (
                        formData.sizes.map(s => {
                          const isDbVariant = variants.some(v => v.size.toUpperCase() === s.toUpperCase());
                          return (
                            <span
                              key={s}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: isDbVariant ? '#111827' : '#eff6ff',
                                color: isDbVariant ? '#ffffff' : '#2563eb',
                                border: isDbVariant ? 'none' : '1px dashed #bfdbfe',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                transition: 'all 0.2s',
                              }}
                              title={isDbVariant ? "Exists in variants" : "Will be added on save"}
                            >
                              {s}
                              <button
                                type="button"
                                onClick={() => handleRemoveSize(s)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: isDbVariant ? '#fca5a5' : '#3b82f6',
                                  padding: 0,
                                  fontSize: '0.95rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  lineHeight: 1
                                }}
                              >
                                ×
                              </button>
                            </span>
                          );
                        })
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Type size e.g. XXL"
                        value={newSize}
                        onChange={e => setNewSize(e.target.value.toUpperCase())}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSize();
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          border: '1.5px solid #d1d5db',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: '#fff'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        style={{
                          background: '#111827',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 16px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#374151'}
                        onMouseLeave={e => e.currentTarget.style.background = '#111827'}
                      >
                        + Add size
                      </button>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '6px', display: 'block' }}>
                      💡 Capitalized by default. New sizes dynamically spin up variants in existing colors.
                    </span>
                  </div>

                  {/* Variant Stock Editing Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Size-Variant Stocks
                    </h4>

                    {variants.length === 0 ? (
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 50%, #eff6ff 100%)',
                          borderRadius: '16px',
                          padding: '24px',
                          border: '1px dashed #fcd34d',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                          <div>
                            <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#b45309' }}>
                              Variant Seeding Required
                            </h5>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#78350f', lineHeight: 1.4 }}>
                              This product currently has <strong>0 variants</strong>. Set up colors and initial stock quantities below to initialize details tracking.
                            </p>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                              Default Initial Sizes
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', minHeight: '32px', alignItems: 'center' }}>
                              {initSizes.map(s => (
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
                              ))}
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
                              Product Colors <span style={{ color: '#9ca3af', fontWeight: 500 }}>(comma separated)</span>
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
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                              Initial Stock per variant
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
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleInitialize}
                            disabled={initializing}
                            style={{
                              padding: '12px',
                              border: 'none',
                              borderRadius: '10px',
                              background: initializing ? '#d1d5db' : 'linear-gradient(135deg, #111 0%, #374151 100%)',
                              color: '#fff',
                              fontWeight: 700,
                              cursor: initializing ? 'not-allowed' : 'pointer',
                              fontSize: '0.9rem',
                              transition: 'all 0.2s',
                              marginTop: '10px'
                            }}
                          >
                            {initializing ? 'Initializing Variants...' : '⚡ Seed Variants & Initialize'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          border: '1.5px solid #e5e7eb',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          maxHeight: '340px',
                          overflowY: 'auto'
                        }}
                      >
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1.5px solid #e5e7eb' }}>
                              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</th>
                              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current</th>
                              <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Qty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((v, i) => {
                              const editsValue = edits[v.variantId];
                              const changed = editsValue !== undefined && editsValue !== v.stockQuantity;
                              const isOos = editsValue === 0;
                              return (
                                <tr
                                  key={v.variantId}
                                  style={{
                                    borderBottom: '1px solid #f3f4f6',
                                    background: isOos ? '#fff7f7' : (i % 2 === 0 ? '#ffffff' : '#fafafa'),
                                    transition: 'background 0.2s',
                                  }}
                                >
                                  <td style={{ padding: '10px 16px', fontWeight: 800, fontSize: '0.88rem', color: '#111827' }}>
                                    {isOos && <span title="Out of stock" style={{ marginRight: '6px' }}>🔴</span>}
                                    {v.size}
                                  </td>
                                  <td style={{ padding: '10px 12px', fontSize: '0.82rem', color: '#4b5563', fontWeight: 500 }}>{v.color}</td>
                                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                    <span
                                      style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: v.stockQuantity === 0 ? '#dc2626' : (v.stockQuantity < 10 ? '#d97706' : '#16a34a')
                                      }}
                                    >
                                      {v.stockQuantity}
                                    </span>
                                  </td>
                                  <td style={{ padding: '6px 16px 6px 8px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                      {changed && (
                                        <span
                                          style={{
                                            fontSize: '0.62rem',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            background: '#2563eb',
                                            borderRadius: '999px',
                                            padding: '1px 5px',
                                            flexShrink: 0
                                          }}
                                        >
                                          {editsValue > v.stockQuantity ? `+${editsValue - v.stockQuantity}` : `${editsValue - v.stockQuantity}`}
                                        </span>
                                      )}
                                      <input
                                        type="number"
                                        min="0"
                                        value={editsValue ?? v.stockQuantity}
                                        onChange={e => handleQtyChange(v.variantId, e.target.value)}
                                        style={{
                                          width: '64px',
                                          padding: '5px 8px',
                                          border: changed ? '2.5px solid #2563eb' : '1.5px solid #d1d5db',
                                          borderRadius: '8px',
                                          fontSize: '0.88rem',
                                          fontWeight: 700,
                                          textAlign: 'center',
                                          outline: 'none',
                                          transition: 'all 0.15s',
                                          background: changed ? '#eff6ff' : '#ffffff',
                                        }}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div
                style={{
                  padding: '24px 0 0',
                  marginTop: '28px',
                  borderTop: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                  {hasVariantChanges ? (
                    <strong style={{ color: '#2563eb' }}>
                      ✓ Variant modifications detected
                    </strong>
                  ) : (
                    'No local variant alterations'
                  )}
                </span>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '11px 24px',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '10px',
                      background: '#ffffff',
                      color: '#4b5563',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = '#f9fafb';
                      e.target.style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = '#ffffff';
                      e.target.style.borderColor = '#d1d5db';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '11px 32px',
                      border: 'none',
                      borderRadius: '10px',
                      background: saving ? '#9ca3af' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontSize: '0.88rem',
                      boxShadow: saving ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.25)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      if (!saving) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.35)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!saving) {
                        e.target.style.transform = 'none';
                        e.target.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.25)';
                      }
                    }}
                  >
                    {saving ? 'Synchronizing configs...' : '✓ Save Product Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Global Modal Animation Keyframes */}
        <style>{`
          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(40px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0)   scale(1);    }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
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
  const [editingProduct, setEditingProduct] = useState(null);

  const [schoolsList, setSchoolsList]       = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStock, setSelectedStock]       = useState("");
  const [selectedFeatured, setSelectedFeatured] = useState("");

  useEffect(() => {
    adminApi.getSchools().then(res => setSchoolsList(res.data || [])).catch(console.error);
    adminApi.getCategories().then(res => setCategoriesList(res.data || [])).catch(console.error);
  }, []);

  const fetchProducts = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    adminApi.getProducts({ search: search || null })
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products", err))
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      adminApi.deleteProduct(id).then(() => fetchProducts(true)).catch(console.error);
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await adminApi.updateProduct(product.id, {
        featured: !product.featured
      });
      fetchProducts(true);
    } catch (err) {
      alert("Failed to update featured status: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredProducts = products.filter(product => {
    if (selectedSchool && product.school !== selectedSchool) return false;
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedStock) {
      const stock = product.stockQuantity || 0;
      if (selectedStock === "in_stock" && stock === 0) return false;
      if (selectedStock === "out_of_stock" && stock !== 0) return false;
      if (selectedStock === "low_stock" && stock >= 10) return false;
    }
    if (selectedFeatured) {
      if (selectedFeatured === "featured" && !product.featured) return false;
      if (selectedFeatured === "regular" && product.featured) return false;
    }
    return true;
  });

  const hasActiveProductFilters =
    search.trim() !== "" ||
    selectedSchool !== "" ||
    selectedCategory !== "" ||
    selectedStock !== "" ||
    selectedFeatured !== "";

  const resetProductFilters = () => {
    setSearch("");
    setSelectedSchool("");
    setSelectedCategory("");
    setSelectedStock("");
    setSelectedFeatured("");
  };

  return (
    <AdminLayout
      title="Products"
      actions={
        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Product
        </button>
      }
      toolbar={
        <>
          <input
            className="admin-search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="admin-select"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="">All Schools</option>
            {schoolsList.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            className="admin-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="admin-select"
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
          >
            <option value="">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock (&lt;10)</option>
          </select>
          <select
            className="admin-select"
            value={selectedFeatured}
            onChange={(e) => setSelectedFeatured(e.target.value)}
          >
            <option value="">All Products</option>
            <option value="featured">Featured Only</option>
            <option value="regular">Regular Only</option>
          </select>
          <button
            type="button"
            className="admin-reset-btn"
            onClick={resetProductFilters}
            disabled={!hasActiveProductFilters}
            title="Reset all filters"
          >
            Reset filters
          </button>
        </>
      }
    >
      <div className="table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
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
              {filteredProducts.map(product => (
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
                    <StockBadgeWithTooltip qty={product.stockQuantity} productId={product.id} />
                  </td>
                  <td className="row-actions">
                    <button
                      title="Edit product details & stock"
                      onClick={() => setEditingProduct(product)}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginRight: '6px',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#dbeafe';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#eff6ff';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      ✏ Edit
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

      {/* Edit Product modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => { fetchProducts(true); }}
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
    name: "", schoolId: "", categoryId: "", price: "",
    compareAtPrice: "", imageUrl: "", description: "",
    featured: false, stockQuantity: 100,
    sizes: ["S", "M", "L", "XL"], colors: "Navy, White",
  });
  const [schoolsList, setSchoolsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [newSize, setNewSize]         = useState("");
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    adminApi.getSchools().then(res => {
      const data = res.data || [];
      setSchoolsList(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, schoolId: data[0].id.toString() }));
      }
    }).catch(console.error);
    
    adminApi.getCategories().then(res => {
      const data = res.data || [];
      setCategoriesList(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id.toString() }));
      }
    }).catch(console.error);
  }, []);

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
        schoolId: formData.schoolId ? parseInt(formData.schoolId, 10) : null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
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
            <label>Select School</label>
            <select name="schoolId" value={formData.schoolId} onChange={handleChange} required>
              <option value="">-- Choose School --</option>
              {schoolsList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Select Category</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
              <option value="">-- Choose Category --</option>
              {categoriesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
