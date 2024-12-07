import React from 'react';

export function FooterSection({ title, children }) {
  return (
    <div className="footer-section">
      <h3 className="footer-section-title">{title}</h3>
      {children}
    </div>
  );
}