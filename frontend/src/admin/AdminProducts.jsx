import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import adminApi from "../api/adminApi";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = () => {
    setLoading(true);
    adminApi.getProducts({ search: search || null })
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products", err);
        setLoading(false);
      });
  };

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      adminApi.deleteProduct(id)
        .then(() => fetchProducts())
        .catch((err) => console.error("Failed to delete product", err));
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
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="admin-primary-btn" onClick={() => setShowModal(true)}>
            + Add Product
          </button>
        </div>
      }
    >
      <div className="table-card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            No products found.
          </div>
        ) : (
          <table className="admin-table products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>School</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          style={{ width: "38px", height: "38px", objectFit: "cover", borderRadius: "4px" }} 
                        />
                      ) : (
                        <div className="admin-thumb"></div>
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
                    {product.stockQuantity < 10 ? (
                      <span className="stock-low">{product.stockQuantity} left</span>
                    ) : (
                      product.stockQuantity
                    )}
                  </td>
                  <td className="row-actions">
                    <button className="danger" onClick={() => deleteProduct(product.id)}>⌫</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <ProductModal 
          onClose={() => setShowModal(false)} 
          onSave={() => {
            setShowModal(false);
            fetchProducts();
          }} 
        />
      )}
    </AdminLayout>
  );
};

const ProductModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    schoolId: "1",
    categoryId: "1",
    price: "",
    compareAtPrice: "",
    imageUrl: "",
    description: "",
    featured: false,
    stockQuantity: 100,
    sizes: "S, M, L, XL",
    colors: "Navy, White"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
      stockQuantity: parseInt(formData.stockQuantity),
      sizes: formData.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: formData.colors.split(",").map(c => c.trim()).filter(Boolean)
    };

    adminApi.createProduct(payload)
      .then(() => {
        alert("Product created successfully!");
        onSave();
      })
      .catch((err) => console.error("Failed to create product", err));
  };

  return (
    <div className="modal-backdrop">
      <form className="product-modal" onSubmit={handleSubmit}>
        <button type="button" className="modal-close" onClick={onClose}>×</button>

        <h2>Add New Product</h2>

        <label>Product Name</label>
        <input 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          autoFocus 
        />

        <div className="form-grid">
          <div>
            <label>School ID</label>
            <input 
              name="schoolId" 
              type="number" 
              value={formData.schoolId} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label>Category ID</label>
            <input 
              name="categoryId" 
              type="number" 
              value={formData.categoryId} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label>Price ₹</label>
            <input 
              name="price" 
              type="number" 
              value={formData.price} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label>Compare at Price ₹ - Optional</label>
            <input 
              name="compareAtPrice" 
              type="number" 
              value={formData.compareAtPrice} 
              onChange={handleChange} 
            />
          </div>

          <div>
            <label>Stock Quantity</label>
            <input 
              name="stockQuantity" 
              type="number" 
              value={formData.stockQuantity} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label>Image URL</label>
            <input 
              name="imageUrl" 
              value={formData.imageUrl} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label>Sizes (comma separated)</label>
            <input 
              name="sizes" 
              value={formData.sizes} 
              onChange={handleChange} 
              placeholder="S, M, L, XL" 
            />
          </div>

          <div>
            <label>Colors (comma separated)</label>
            <input 
              name="colors" 
              value={formData.colors} 
              onChange={handleChange} 
              placeholder="Navy, White" 
            />
          </div>
        </div>

        <label>Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          required 
        />

        <div className="feature-box">
          <input 
            name="featured" 
            type="checkbox" 
            checked={formData.featured} 
            onChange={handleChange} 
          />
          <div>
            <strong>Featured Product</strong>
            <p>Show this product on the home page</p>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-primary-btn">Save Product</button>
        </div>
      </form>
    </div>
  );
};

export default AdminProducts;
