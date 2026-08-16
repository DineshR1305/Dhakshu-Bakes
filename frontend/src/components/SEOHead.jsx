import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'Dhakshu Bakes — Freshly Baked. Made With Love.';
const DEFAULT_DESCRIPTION = 'Discover freshly baked handcrafted cakes, cookies, pastries, brownies, and artisan breads at Dhakshu Bakes.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200';
const DOMAIN = 'http://localhost:5173';

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd = null,
}) {
  const location = useLocation();
  const fullTitle = title ? `${title} | Dhakshu Bakes` : DEFAULT_TITLE;
  const canonicalUrl = `${DOMAIN}${location.pathname}`;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper function to update or create meta tag
    const updateMetaTag = (selector, nameAttr, nameValue, contentValue) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, nameValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper function for canonical link
    const updateCanonicalLink = (url) => {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    // 2. Standard Meta
    updateMetaTag('meta[name="description"]', 'name', 'description', description);
    updateMetaTag('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    updateCanonicalLink(canonicalUrl);

    // 3. Open Graph Meta
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', type);

    // 4. Twitter Cards
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    // 5. JSON-LD Structured Data
    const scriptId = 'dhakshu-json-ld';
    let scriptElement = document.getElementById(scriptId);

    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    return () => {
      // Clean up script on unmount
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [fullTitle, description, image, type, noindex, canonicalUrl, jsonLd]);

  return null;
}
