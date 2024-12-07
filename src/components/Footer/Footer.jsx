import React from 'react';
import { FooterSection } from './FooterSection';
import { NAV_LINKS } from '../../utils/constants';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <FooterSection title="About TechStore">
            <p className="footer-text">
              Your one-stop destination for all things tech. Quality products from verified sellers.
            </p>
          </FooterSection>

          <FooterSection title="Quick Links">
            <ul className="footer-links">
              {NAV_LINKS.map((link) => (
                <li key={link.title}>
                  <a href={link.href} className="footer-link">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </FooterSection>

          <FooterSection title="Contact Us">
            <ul className="footer-links">
              <li className="footer-text">support@techstore.com</li>
              <li className="footer-text">1-800-TECH-STORE</li>
              <li className="footer-text">Mon-Fri: 9AM - 6PM EST</li>
            </ul>
          </FooterSection>
        </div>
        
        <div className="footer-divider">
          <p className="footer-copyright">&copy; {new Date().getFullYear()} TechStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}