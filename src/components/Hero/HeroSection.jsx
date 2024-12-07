import React from 'react';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="hero">
      <div className="container hero-content">
        <h1 className="hero-title">
          Discover the Latest in Tech
        </h1>
        <p className="hero-description">
          Shop the most innovative gadgets and electronics from trusted sellers worldwide.
        </p>
        <button className="hero-button">
          <span>Shop Now</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      <div className="hero-gradient"></div>
    </div>
  );
}