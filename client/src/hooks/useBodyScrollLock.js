import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;

const applyLock = () => {
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  const { body, documentElement } = document;
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  documentElement.style.overflow = 'hidden';
  documentElement.classList.add('scroll-locked');
};

const releaseLock = () => {
  const { body, documentElement } = document;
  body.style.overflow = '';
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  documentElement.style.overflow = '';
  documentElement.classList.remove('scroll-locked');
  window.scrollTo(0, savedScrollY);
};

/**
 * Locks page scroll while `locked` is true (iOS-safe).
 * Supports nested modals via a shared ref-count.
 */
const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;

    if (lockCount === 0) applyLock();
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) releaseLock();
    };
  }, [locked]);
};

export default useBodyScrollLock;
