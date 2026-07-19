import { useEffect, useRef } from 'react';

const PAW_SVG =
  '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="20" rx="7" ry="9"/><ellipse cx="44" cy="20" rx="7" ry="9"/><ellipse cx="9" cy="37" rx="6" ry="8"/><ellipse cx="55" cy="37" rx="6" ry="8"/><path d="M32 33c-9 0-16 6-16 14 0 6 5 9 16 9s16-3 16-9c0-8-7-14-16-14z"/></svg>';

// PetNest brand palette (orange + blue accents)
const COLORS = ['#f97316', '#fb923c', '#fdba74', '#3b82f6', '#93c5fd', '#fff7ed', '#ffffff', '#fbbf24'];

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

/**
 * Global click delight: ripples + color splash + paw print at the pointer.
 * Inspired by commercial pet marketplace click FX; themed for PetNest.
 */
const ClickEffects = () => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return undefined;

    const spawn = (el) => {
      el.addEventListener('animationend', () => el.remove(), { once: true });
      overlay.appendChild(el);
    };

    const trim = () => {
      while (overlay.childElementCount > 180 && overlay.firstChild) {
        overlay.removeChild(overlay.firstChild);
      }
    };

    const ripples = (x, y) => {
      [
        { d: 0.9, delay: 0, col: '#ffffff' },
        { d: 1.15, delay: 0.1, col: '#fdba74' },
        { d: 1.4, delay: 0.2, col: 'rgba(249,115,22,0.55)' },
      ].forEach((s) => {
        const size = rand(70, 110);
        const r = document.createElement('div');
        r.className = 'pn-fx-ripple';
        r.style.left = `${x}px`;
        r.style.top = `${y}px`;
        r.style.width = `${size}px`;
        r.style.height = `${size}px`;
        r.style.borderColor = s.col;
        r.style.animationDuration = `${s.d}s`;
        r.style.animationDelay = `${s.delay}s`;
        spawn(r);
      });
    };

    const splash = (x, y) => {
      const n = Math.round(rand(14, 22));
      for (let i = 0; i < n; i += 1) {
        const drip = Math.random() < 0.3;
        const ang = rand(0, Math.PI * 2);
        const dist = rand(40, 150);
        const sz = rand(5, 18);
        const col = pick(COLORS);
        const p = document.createElement('div');
        p.className = `pn-fx-particle${drip ? ' pn-fx-drip' : ''}`;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.setProperty('--dx', `${(Math.cos(ang) * dist).toFixed(1)}px`);
        p.style.setProperty('--dy', `${(Math.sin(ang) * dist).toFixed(1)}px`);
        p.style.setProperty('--sz', `${sz.toFixed(1)}px`);
        p.style.background = col;
        p.style.boxShadow = `0 0 8px ${col}`;
        spawn(p);
      }
    };

    const paw = (x, y) => {
      const sz = rand(34, 52);
      const el = document.createElement('div');
      el.className = 'pn-fx-paw';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.width = `${sz}px`;
      el.style.height = `${sz}px`;
      el.style.color = pick(COLORS);
      el.style.setProperty('--rot', `${rand(-30, 30).toFixed(0)}deg`);
      el.innerHTML = PAW_SVG;
      spawn(el);
    };

    const onPointerDown = (e) => {
      // Skip form fields / interactive typing contexts
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      ripples(e.clientX, e.clientY);
      splash(e.clientX, e.clientY);
      paw(e.clientX, e.clientY);
      trim();
    };

    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  return <div id="pn-fx" ref={overlayRef} aria-hidden="true" />;
};

export default ClickEffects;
