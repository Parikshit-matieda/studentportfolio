import React from 'react';
import { Link } from 'react-router-dom';
import About from './About';
import Skills from './Skills';
import './Home.css';

function Home({ name, title, skills }) {
  return (
    <div className="home-page">
      <section className="hero-section" id="hero">
        <div className="hero-badge">👋 Welcome to my portfolio</div>
        <h1 className="hero-name">{name}</h1>
        <p className="hero-title">{title}</p>
        <div className="hero-cta">
          <Link to="/projects" className="btn btn-primary">View My Work</Link>
          <Link to="/contact" className="btn btn-outline">Get in Touch</Link>
        </div>
        <div className="hero-glow"></div>
      </section>

      <About />
      <Skills skills={skills} />
    </div>
  );
}

export default Home;
