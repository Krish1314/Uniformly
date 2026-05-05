import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { cartApi } from '../api/cartApi';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const [cart, setCart] = useState({
        items: [],
        subtotal: 0,
        itemCount: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const response = await cartApi.getCart();
            setCart(response.data);
        } catch (err) {
            console.error("Failed to load cart", err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        if (quantity < 1) return;
        try {
            const response = await cartApi.updateItem(cartItemId, quantity);
            setCart(response.data);
            refreshCart();
        } catch (err) {
            console.error("Failed to update cart", err);
        }
    };

    const removeItem = async (cartItemId) => {
        try {
            const response = await cartApi.removeItem(cartItemId);
            setCart(response.data);
            refreshCart();
        } catch (err) {
            console.error("Failed to remove item", err);
        }
    };

    if (loading) {
        return <div className="container py-5 mt-5 text-center">Loading cart...</div>;
    }

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="fade-in d-flex flex-column" style={{ minHeight: '80vh' }}>
                <div className="container py-5 mt-5 flex-grow-1 text-center">
                    <div className="mb-4 mx-auto d-flex align-items-center justify-content-center bg-light rounded-circle" style={{ width: '120px', height: '120px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="bi bi-cart3" viewBox="0 0 16 16">
                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                        </svg>
                    </div>
                    <h2 className="font-serif fw-bold mb-3">Your Cart is Empty</h2>
                    <p className="text-muted fs-5 mb-4">Looks like you haven't added any uniforms to your cart yet.</p>
                    <Link to="/catalog" className="btn btn-solid rounded-pill px-4">Continue Shopping</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
            <div className="container py-5 mt-4 flex-grow-1">
                <h1 className="font-serif fw-bold mb-5">Your Cart</h1>

                <div className="row g-5">
                    {/* Left Column - Cart Items */}
                    <div className="col-lg-7">
                        {cart.items.map(item => (
                            <div className="info-block mb-4" key={item.id}>
                                <div className="d-flex">
                                    <div className="me-4 bg-white p-2 rounded" style={{ width: '100px', height: '100px' }}>
                                        <img src={item.imageUrl || item.image || "/images/sweater.jpg"} alt={item.name} className="w-100 h-100 object-fit-cover" />
                                    </div>

                                    <div className="flex-grow-1">
                                        <div className="school-name text-muted mb-1" style={{ fontSize: '0.65rem' }}>{item.school}</div>
                                        <div className="fw-bold fs-5 mb-2">{item.name}</div>
                                        <div className="text-dark fs-6 mb-4">Size : <span className="fw-bold">{item.size}</span> &nbsp; Color : <span className="fw-bold">{item.color}</span></div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="qty-selector bg-light">
                                                <button className="qty-btn px-2" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                <div className="qty-display mx-3">{item.quantity}</div>
                                                <button className="qty-btn px-2" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>

                                            <button className="btn border-0 text-dark fw-bold d-flex align-items-center" onClick={() => removeItem(item.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-trash3 me-2" viewBox="0 0 16 16">
                                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.813 1H3.187l-.836 10.45A1 1 0 0 0 3.344 15h9.312a1 1 0 0 0 .993-1.05L12.813 3.5Zm-9.313 11v-.5h10v.5A.5.5 0 0 1 13 15H3a.5.5 0 0 1-.5-.5ZM6 6.5A.5.5 0 0 1 6.5 6h3a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-6ZM7 7v5h2V7H7Z" />
                                                </svg>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="col-lg-5">
                        <div className="summary-block">
                            <h3 className="font-serif fw-bold mb-4 pb-2">Order Summary</h3>

                            <div className="summary-row">
                                <span className="text-muted">Subtotal ( {cart.itemCount} items )</span>
                                <span className="fw-medium">INR {cart.subtotal}</span>
                            </div>
                            <div className="summary-row">
                                <span className="text-muted">Shipping</span>
                                <span className="fw-medium">Calculated at Checkout</span>
                            </div>

                            <div className="summary-total border-top border-dark mt-4 pt-4">
                                <span className="fs-4">Total</span>
                                <div className="text-end">
                                    <div className="fs-4 fw-bold">INR {cart.subtotal.toLocaleString()}</div>
                                    <div className="fs-6 text-muted fw-normal" style={{ fontSize: '0.8rem' }}>Including GST</div>
                                </div>
                            </div>

                            <button
                                className="btn btn-solid w-100 mt-4 d-flex justify-content-between align-items-center px-4"
                                onClick={() => navigate('/checkout')}
                            >
                                Proceed to Checkout
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Cart;
