import React, { useState, useEffect } from 'react';

const ProductsList = ({ products: initialProducts }) => {
    const [products, setProducts] = useState(initialProducts || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch products from API if not provided
        if (!products || products.length === 0) {
            fetchProducts();
        }
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleAddToCart = (product) => {
        if (window.cartManager) {
            window.cartManager.addToCart(product);
        } else {
            alert('Keranjang belum siap. Silakan refresh halaman.');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                <p className="text-muted">Tidak ada produk tersedia saat ini.</p>
            </div>
        );
    }

    const handleProductClick = (productId) => {
        window.location.href = `/produk/${productId}`;
    };

    return (
        <div className="row g-4">
            {products.map((product) => (
                <div key={product.id} className="col-md-4 col-lg-3">
                    <div className="card product-card">
                        <div 
                            className="position-relative" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleProductClick(product.id)}
                        >
                            {product.image ? (
                                <img 
                                    src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`}
                                    alt={product.name}
                                    className="product-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300x250?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="product-image d-flex align-items-center justify-content-center bg-light">
                                    <i className="fas fa-pills fa-4x text-muted"></i>
                                </div>
                            )}
                            {product.stock === 0 && (
                                <div className="position-absolute top-0 end-0 m-2">
                                    <span className="badge bg-danger">Habis</span>
                                </div>
                            )}
                        </div>
                        <div className="card-body">
                            <h5 
                                className="product-name" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleProductClick(product.id)}
                            >
                                {product.name}
                            </h5>
                            <div className="product-price">{formatPrice(product.price)}</div>
                            <div className="product-stock mb-3">
                                <i className="fas fa-box me-1"></i>
                                Stok: {product.stock}
                            </div>
                            <button
                                className="btn btn-add-cart"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product);
                                }}
                                disabled={product.stock === 0}
                            >
                                <i className="fas fa-cart-plus me-2"></i>
                                {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductsList;

