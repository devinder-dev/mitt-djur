import { useEffect, useMemo, useState, useRef } from 'react';
import BottomNav from './BottomNav.jsx';
import * as shopApi from '../api/shop.js';
import './App.css';
import { petBaseImage } from '../lib/petImage.js';

const CATEGORY_LABELS = {
  hattar:    'Hattar',
  glasogon:  'Glasögon',
  klader:    'Kläder',
  halsduk:   'Halsdukar',
  tillbehor: 'Tillbehör',
};

const CATEGORY_ORDER = ['hattar', 'glasogon', 'klader', 'halsduk', 'tillbehor'];

// Sanitize image src — only allow relative paths (/…) and http(s) URLs.
// Blocks javascript: and data: URIs that could enable DOM XSS.
function safeSrc(url, fallback = '') {
  if (!url) return fallback;
  if (/^(\/|https?:\/\/)/.test(url)) return url;
  return fallback;
}

/**
 * Shop / Butik screen.
 *
 * Props:
 *   coins, pet, onNavigate, onCoinsUpdate
 */
export default function Shop({ coins = 0, pet, onNavigate, onCoinsUpdate }) {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsRef = useRef(null);

  const updateTabsScroll = () => {
    if (!tabsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    const isAtStart = scrollLeft === 0;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd && isAtStart);
  };

  const scroll = (direction) => {
    if (!tabsRef.current) return;
    const { clientWidth } = tabsRef.current;
    tabsRef.current.scrollBy({
      left: direction === 'left' ? -clientWidth : clientWidth,
      behavior: 'smooth',
    });
    setTimeout(updateTabsScroll, 100);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    shopApi.getShop()
      .then(list => {
        if (cancelled) return;
        setItems(list);
        const firstCat = CATEGORY_ORDER.find(c => list.some(i => i.category === c))
          ?? list[0]?.category
          ?? null;
        setTab(firstCat);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const ref = tabsRef.current;
    if (!ref) return;
    updateTabsScroll();
    ref.addEventListener('scroll', updateTabsScroll);
    window.addEventListener('resize', updateTabsScroll);
    return () => {
      ref.removeEventListener('scroll', updateTabsScroll);
      window.removeEventListener('resize', updateTabsScroll);
    };
  }, []);

  const categories = useMemo(() => {
    const present = new Set(items.map(i => i.category));
    const ordered = CATEGORY_ORDER.filter(c => present.has(c));
    for (const c of present) if (!ordered.includes(c)) ordered.push(c);
    return ordered;
  }, [items]);

  const equipped = useMemo(() => items.find(i => i.equipped) ?? null, [items]);
  const visibleItems = useMemo(() => items.filter(i => i.category === tab), [items, tab]);

  const heroSrc = equipped?.preview ?? petBaseImage(pet?.petAnimal);

  async function handleBuy(item) {
    if (busyId || item.owned || coins < item.price) return;
    setBusyId(item.id);
    setError(null);
    try {
      const result = await shopApi.buyItem(item.id);
      setItems(prev => prev.map(i => ({
        ...i,
        owned: i.id === item.id ? true : i.owned,
        equipped: i.id === result.equippedId,
      })));
      onCoinsUpdate?.(c => (c ?? 0) - item.price);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleEquip(item) {
    if (busyId) return;
    setBusyId(item.id);
    setError(null);
    try {
      if (item.equipped) {
        await shopApi.unequipItem();
        setItems(prev => prev.map(i => ({ ...i, equipped: false })));
      } else {
        const result = await shopApi.equipItem(item.id);
        setItems(prev => prev.map(i => ({ ...i, equipped: i.id === result.equippedId })));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="app-screen">
      <header className="app-topbar">
        <div>
          <h1 className="app-topbar-title">Butik</h1>
          <div className="app-topbar-sub">Samla mynt och kläd upp din vän!</div>
        </div>
        <span className="app-coin-chip">
          <span className="app-coin-chip-coin" />
          {coins}
        </span>
      </header>

      <main className="app-content">
        <section className="shop-hero">
          <img src={safeSrc(heroSrc, petBaseImage(pet?.petAnimal))} alt={pet?.name ?? 'Mitt djur'} />
        </section>

        {error && (
          <div style={{ background: '#FDE3E3', color: '#A43030', padding: 10, borderRadius: 12, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div className="shop-tabs-wrapper">
          {canScrollLeft && (
            <button className="shop-scroll-btn shop-scroll-btn--left" onClick={() => scroll('left')} aria-label="Föregående">
              ‹
            </button>
          )}
          <div className="shop-tabs" ref={tabsRef}>
            {categories.map(c => (
              <button
                key={c}
                className={`shop-tab ${tab === c ? 'shop-tab-active' : ''}`}
                onClick={() => setTab(c)}
                type="button"
              >
                {CATEGORY_LABELS[c] ?? c}
              </button>
            ))}
          </div>
          {canScrollRight && (
            <button className="shop-scroll-btn shop-scroll-btn--right" onClick={() => scroll('right')} aria-label="Nästa">
              ›
            </button>
          )}
        </div>

        <div className="shop-grid">
          {loading && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24, color: '#8A5A3D' }}>Laddar…</div>}
          {!loading && visibleItems.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24, color: '#8A5A3D' }}>
              Inga föremål här.
            </div>
          )}
          {visibleItems.map(item => {
            const canAfford = coins >= item.price;
            const isBusy = busyId === item.id;

            let label;
            let onClick;
            let disabled = isBusy;
            if (!item.owned) {
              label = isBusy ? '…' : 'Köp';
              onClick = () => handleBuy(item);
              disabled = disabled || !canAfford;
            } else if (item.equipped) {
              label = isBusy ? '…' : 'Ta av';
              onClick = () => handleEquip(item);
            } else {
              label = isBusy ? '…' : 'Använd';
              onClick = () => handleEquip(item);
            }

            return (
              <div key={item.id} className="shop-item">
                <div className="shop-item-img">
                  <img
                    src={safeSrc(item.image)}
                    alt={item.name}
                    style={{ width: 64, height: 64, objectFit: 'contain' }}
                  />
                </div>
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-price">
                  <span className="shop-item-coin" />{item.price}
                </div>
                <button
                  className="shop-buy-btn"
                  data-owned={item.owned}
                  data-equipped={item.equipped}
                  disabled={disabled}
                  onClick={onClick}
                  type="button"
                >
                  {label}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ height: 16 }} />
      </main>

      <BottomNav active="shop" onNavigate={onNavigate} pet={pet} />
    </div>
  );
}
