import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import api from '../api/axios';

// BUG FIXED: "s.map is not a function"
// Root cause: When the backend is unreachable or returns an unexpected response,
// res.data might be null, undefined, or not an array where .map() is expected.
// Specifically: setCategories(res.data) — if res.data is null/object, .map() fails.
// Fix: Added defensive checks || [] everywhere arrays are expected from API responses.

const TAG_STYLES = {
  'Best Seller': { bg: '#1a1400', color: '#c9a84c', border: '#3a2e00' },
  'New':         { bg: '#0d1225', color: '#6b9fff', border: '#1a2a4a' },
  'Sale':        { bg: '#1a0808', color: '#ff7b7b', border: '#3a1515' },
  'Trending':    { bg: '#0d1a0d', color: '#6bcf6b', border: '#1a3a1a' },
};

const Shop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [addedId, setAddedId]           = useState(null);

  const [search, setSearch]             = useState(searchParams.get('q') || '');
  const [searchInput, setSearchInput]   = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId]     = useState(searchParams.get('cat') || '');
  const [sortBy, setSortBy]             = useState(searchParams.get('sort') || 'createdAt');
  const [sortDir, setSortDir]           = useState(searchParams.get('dir') || 'desc');
  const [page, setPage]                 = useState(Number(searchParams.get('page')) || 0);

  const PAGE_SIZE = 12;

  useEffect(() => {
    api.get('/categories')
        .then((res) => {
          // FIX: was setCategories(res.data) — if res.data is null/undefined, .map() crashes
          const data = res.data;
          setCategories(Array.isArray(data) ? data : []);
        })
        .catch(() => setCategories([])); // always set to [] on error, never undefined
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (search) {
        res = await api.get('/products/search', {
          params: { keyword: search, page, size: PAGE_SIZE },
        });
      } else if (categoryId) {
        res = await api.get(`/products/category/${categoryId}`, {
          params: { page, size: PAGE_SIZE },
        });
      } else {
        res = await api.get('/products', {
          params: { page, size: PAGE_SIZE, sortBy, sortDir },
        });
      }

      // FIX: Defensive parsing — backend returns Page<Product> with .content array
      // If backend is down or returns unexpected shape, these fallback to safe defaults
      const data = res.data || {};
      setProducts(Array.isArray(data.content) ? data.content : []);
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 0);
      setTotalElements(typeof data.totalElements === 'number' ? data.totalElements : 0);

    } catch {
      setError('Failed to load products. Please check your connection.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, sortBy, sortDir, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const params = {};
    if (search)          params.q    = search;
    if (categoryId)      params.cat  = categoryId;
    if (sortBy !== 'createdAt') params.sort = sortBy;
    if (sortDir !== 'desc')     params.dir  = sortDir;
    if (page > 0)        params.page = page;
    setSearchParams(params, { replace: true });
  }, [search, categoryId, sortBy, sortDir, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCategoryId('');
    setPage(0);
  };

  const handleCategory = (id) => {
    setCategoryId(id);
    setSearch('');
    setSearchInput('');
    setPage(0);
  };

  const handleSort = (e) => {
    const val = e.target.value;
    if (val === 'price_asc')  { setSortBy('price');     setSortDir('asc'); }
    if (val === 'price_desc') { setSortBy('price');     setSortDir('desc'); }
    if (val === 'rating')     { setSortBy('rating');    setSortDir('desc'); }
    if (val === 'newest')     { setSortBy('createdAt'); setSortDir('desc'); }
    setPage(0);
  };

  const getSortValue = () => {
    if (sortBy === 'price' && sortDir === 'asc')  return 'price_asc';
    if (sortBy === 'price' && sortDir === 'desc') return 'price_desc';
    if (sortBy === 'rating') return 'rating';
    return 'newest';
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (!isLoggedIn) { navigate('/login'); return; }
    dispatch(addToCart({
      id:          product.id,
      name:        product.name,
      price:       product.price,
      originalPrice: product.originalPrice,
      imageUrl:    product.imageUrl,
      brand:       product.brand,
      quantity:    1,
    }));
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
      <div style={s.page}>
        <p style={s.eyebrow}>BROWSE</p>
        <div style={s.headerRow}>
          <h1 style={s.heading}>All Products</h1>
          <span style={s.count}>{totalElements} products found</span>
        </div>

        <div style={s.layout}>
          {/* Sidebar */}
          <aside style={s.sidebar}>
            <div style={s.sideSection}>
              <p style={s.sideLabel}>SEARCH</p>
              <form onSubmit={handleSearch} style={s.searchForm}>
                <input
                    style={s.searchInput}
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <button style={s.searchBtn} type="submit">→</button>
              </form>
            </div>

            <div style={s.sideSection}>
              <p style={s.sideLabel}>CATEGORIES</p>
              <button
                  style={{ ...s.catBtn, ...(categoryId === '' ? s.catBtnActive : {}) }}
                  onClick={() => handleCategory('')}
              >All Products</button>
              {/* FIX: categories is now always an array, so .map() never throws */}
              {categories.map((cat) => (
                  <button
                      key={cat.id}
                      style={{ ...s.catBtn, ...(categoryId === String(cat.id) ? s.catBtnActive : {}) }}
                      onClick={() => handleCategory(String(cat.id))}
                  >{cat.name}</button>
              ))}
            </div>

            <div style={s.sideSection}>
              <p style={s.sideLabel}>SORT BY</p>
              <select style={s.select} value={getSortValue()} onChange={handleSort}>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </aside>

          {/* Product Grid */}
          <main style={s.main}>
            {error && (
                <div style={s.errorBox}>
                  <p>{error}</p>
                  <button style={s.retryBtn} onClick={fetchProducts}>Retry</button>
                </div>
            )}

            {loading && !error && (
                <div style={s.grid}>
                  {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} style={s.skeleton} />
                  ))}
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div style={s.emptyBox}>
                  <p style={s.emptyTitle}>No products found</p>
                  <p style={s.emptyText}>Try a different search or category</p>
                  <button style={s.goldBtn} onClick={() => { handleCategory(''); setSearchInput(''); }}>
                    Browse All
                  </button>
                </div>
            )}

            {!loading && !error && products.length > 0 && (
                <>
                  <div style={s.grid}>
                    {/* FIX: products is always an array now so .map() is safe */}
                    {products.map((product) => {
                      const tag = TAG_STYLES[product.tag];
                      const discount = product.originalPrice && product.originalPrice > product.price
                          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                          : 0;

                      return (
                          <div
                              key={product.id}
                              style={s.card}
                              onClick={() => navigate(`/product/${product.id}`)}
                          >
                            <div style={s.cardImgWrap}>
                              {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} style={s.cardImg} />
                              ) : (
                                  <div style={s.cardImgPlaceholder}>
                                    <span style={s.cardImgChar}>{product.name?.[0]}</span>
                                  </div>
                              )}
                              {tag && (
                                  <span style={{ ...s.cardTag, background: tag.bg, color: tag.color, border: `1px solid ${tag.border}` }}>
                            {product.tag}
                          </span>
                              )}
                            </div>

                            <div style={s.cardBody}>
                              {product.brand && <p style={s.cardBrand}>{product.brand}</p>}
                              <p style={s.cardName}>{product.name}</p>
                              <div style={s.cardBottom}>
                                <div>
                                  <span style={s.cardPrice}>₹{product.price?.toLocaleString()}</span>
                                  {discount > 0 && (
                                      <span style={s.cardOriginal}>₹{product.originalPrice?.toLocaleString()}</span>
                                  )}
                                </div>
                                <div style={s.cardRating}>
                                  <span style={{ color: '#c9a84c' }}>★</span>
                                  <span style={{ fontSize: 12, color: '#888' }}>{product.rating?.toFixed(1)}</span>
                                </div>
                              </div>
                              <button
                                  style={{ ...s.addBtn, ...(addedId === product.id ? s.addBtnSuccess : {}) }}
                                  onClick={(e) => handleAddToCart(e, product)}
                              >
                                {addedId === product.id ? '✓ Added' : '+ Add to Cart'}
                              </button>
                            </div>
                          </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                      <div style={s.pagination}>
                        <button
                            style={{ ...s.pageBtn, ...(page === 0 ? s.pageBtnDisabled : {}) }}
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >← Prev</button>

                        {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
                            <button
                                key={i}
                                style={{ ...s.pageBtn, ...(page === i ? s.pageBtnActive : {}) }}
                                onClick={() => setPage(i)}
                            >{i + 1}</button>
                        ))}

                        <button
                            style={{ ...s.pageBtn, ...(page >= totalPages - 1 ? s.pageBtnDisabled : {}) }}
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >Next →</button>
                      </div>
                  )}
                </>
            )}
          </main>
        </div>
      </div>
  );
};

const s = {
  page: { padding: '2rem 3rem', minHeight: '100vh', background: '#0a0a0a', color: '#f0ede8' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.15em', color: '#888', margin: '0 0 0.25rem' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, margin: 0 },
  count: { color: '#555', fontSize: 14 },
  layout: { display: 'flex', gap: '2rem', alignItems: 'flex-start' },
  sidebar: { width: 220, flexShrink: 0, position: 'sticky', top: '5rem' },
  sideSection: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 12, padding: '1rem', marginBottom: '1rem' },
  sideLabel: { fontSize: '10px', letterSpacing: '0.12em', color: '#555', margin: '0 0 0.75rem' },
  searchForm: { display: 'flex', gap: 6 },
  searchInput: { flex: 1, background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0ede8', padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', minWidth: 0 },
  searchBtn: { background: '#c9a84c', border: 'none', borderRadius: 6, color: '#0a0a0a', width: 32, cursor: 'pointer', fontWeight: 700, fontSize: 16 },
  catBtn: { display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', borderRadius: 6, color: '#888', padding: '7px 10px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', marginBottom: 2 },
  catBtnActive: { background: '#1a1400', color: '#c9a84c', border: '1px solid #3a2e00' },
  select: { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0ede8', padding: '8px 10px', fontSize: 13, fontFamily: 'inherit' },
  main: { flex: 1, minWidth: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' },
  card: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' },
  cardImgWrap: { position: 'relative', paddingTop: '75%', background: '#111' },
  cardImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  cardImgPlaceholder: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardImgChar: { fontSize: 48, fontWeight: 700, color: '#c9a84c', fontFamily: "'Playfair Display', serif" },
  cardTag: { position: 'absolute', top: 10, left: 10, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  cardBody: { padding: '0.875rem' },
  cardBrand: { fontSize: 11, letterSpacing: '0.1em', color: '#666', margin: '0 0 4px', textTransform: 'uppercase' },
  cardName: { fontSize: 14, fontWeight: 600, margin: '0 0 0.75rem', lineHeight: 1.4, color: '#f0ede8' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' },
  cardPrice: { color: '#c9a84c', fontWeight: 700, fontSize: 16 },
  cardOriginal: { color: '#555', fontSize: 12, textDecoration: 'line-through', marginLeft: 6 },
  cardRating: { display: 'flex', alignItems: 'center', gap: 3 },
  addBtn: { width: '100%', padding: '8px', background: '#1a1a0a', border: '1px solid #c9a84c33', borderRadius: 7, color: '#c9a84c', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 },
  addBtnSuccess: { background: '#0d1a0d', border: '1px solid #6bcf6b33', color: '#6bcf6b' },
  skeleton: { height: 300, background: '#111', borderRadius: 14, border: '1px solid #1a1a1a' },
  errorBox: { background: '#1a0808', border: '1px solid #3a1515', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#ff8080' },
  retryBtn: { background: '#c9a84c', border: 'none', borderRadius: 8, color: '#0a0a0a', padding: '8px 20px', fontWeight: 700, cursor: 'pointer', marginTop: 12, fontFamily: 'inherit' },
  emptyBox: { textAlign: 'center', padding: '4rem 2rem' },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#555', margin: '0 0 8px' },
  emptyText: { color: '#444', marginBottom: '1.5rem' },
  goldBtn: { background: '#c9a84c', border: 'none', borderRadius: 8, color: '#0a0a0a', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' },
  pageBtn: { background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, color: '#888', padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' },
  pageBtnActive: { background: '#c9a84c', border: '1px solid #c9a84c', color: '#0a0a0a', fontWeight: 700 },
  pageBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
};

export default Shop;