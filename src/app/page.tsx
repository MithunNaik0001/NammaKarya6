import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NammaKarya - Find Trusted Local Skilled Workers',
  description: 'Connect with verified carpenters, plumbers, electricians, and more. Quality work, fair prices, guaranteed satisfaction.',
};

const NammaKaryaLandingPage: React.FC = () => {
  // NOTE: In a production React environment, this styling would be imported from
  // a separate CSS file (styles.css) or handled via CSS Modules/CSS-in-JS.
  // We are placing it inline in a <style> tag here to fulfill the request for
  // combining all code into a single file/component.
  const combinedStyles = `
/*
    NammaKarya - Stylesheet (Combined)
    Color Palette:
    - Primary Dark: #0e2237 (Dark Blue/Navy)
    - Primary Accent: #fcc62b (Golden Yellow)
*/

/* --- Base & Utilities --- */
:root {
    --color-primary-dark: #0e2237;
    --color-primary-accent: #fcc62b;
    --color-secondary: #007bff; /* Standard secondary blue for actions */
    --color-light: #ffffff;
    --color-text: #333;
    --color-text-light: #555;
    --color-shadow: rgba(0, 0, 0, 0.08);
    --border-radius: 8px;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    color: var(--color-text);
    background-color: var(--color-light);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

a {
    text-decoration: none;
    color: var(--color-primary-dark);
    transition: color 0.3s;
}

a:hover {
    color: var(--color-primary-accent);
}

section {
    padding: 80px 0;
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    color: var(--color-primary-dark);
    margin-bottom: 10px;
}

.section-subtitle {
    text-align: center;
    font-size: 1.1rem;
    color: var(--color-text-light);
    margin-bottom: 50px;
}

/* --- Buttons --- */
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background-color: var(--color-primary-accent);
    color: var(--color-primary-dark);
    box-shadow: 0 4px 10px rgba(252, 198, 43, 0.3);
}

.btn-primary:hover {
    background-color: #e5b226;
}

.btn-secondary {
    background-color: transparent;
    color: var(--color-primary-dark);
    border: 2px solid transparent;
}

.btn-secondary:hover {
    color: var(--color-primary-accent);
}

.btn-outline {
    background-color: transparent;
    color: var(--color-primary-dark);
    border: 2px solid var(--color-primary-dark);
}

.btn-outline:hover {
    background-color: var(--color-primary-dark);
    color: var(--color-light);
}

.btn-outline-light {
    background-color: transparent;
    color: var(--color-light);
    border: 2px solid var(--color-light);
}

.btn-outline-light:hover {
    background-color: var(--color-light);
    color: var(--color-primary-dark);
}

.btn-large {
    padding: 15px 30px;
    font-size: 1.1rem;
}

.btn-block {
    width: 100%;
}

/* --- Navigation (Navbar) --- */
.navbar {
    background-color: var(--color-light);
    box-shadow: 0 2px 4px var(--color-shadow);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
}

.logo {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-primary-dark);
}

.logo-img {
    height: 40px;
    margin-right: 10px;
}

.logo-text {
    /* Used for text scaling if logo is only text */
}

.nav-links a {
    margin-left: 25px;
    font-weight: 500;
}

.nav-links button {
    margin-left: 15px;
}

/* Mobile Menu */
.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-primary-dark);
}

.mobile-menu {
    display: none;
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    background-color: var(--color-primary-dark);
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 999;
    flex-direction: column;
    gap: 15px;
    transition: transform 0.3s ease-in-out;
    transform: translateY(-100%);
}

.mobile-menu.active {
    display: flex;
    transform: translateY(0);
}

.mobile-menu a {
    color: var(--color-light);
    font-size: 1.1rem;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-menu button {
    width: 100%;
    margin-top: 10px;
}


/* --- Hero Section --- */
.hero {
    background-image: linear-gradient(rgba(14, 34, 55, 0.4), rgba(14, 34, 55, 0.4)), url('/hero-image.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    padding: 100px 0;
    color: var(--color-light);
}

.hero-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
}

.hero-text {
    flex: 1;
}

.hero-title {
    font-size: 3.5rem;
    margin-bottom: 20px;
    line-height: 1.2;
    color: #FFFFFF;
}

.hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 40px;
    color: rgba(245, 238, 238, 0.8);
}

.hero-buttons {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
}

.hero-stats {
    display: flex;
    gap: 30px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
    text-align: left;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-primary-accent);
    display: block;
}

.stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
}

.hero-illustration {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    max-width: 450px;
}

.illustration-card {
    background: rgba(204, 227, 253, 0.3);
    border-radius: 20px;
    padding: 60px;
    position: relative;
    width: 100%;
    height: 350px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.illustration-icon {
    font-size: 6rem;
    color: var(--color-primary-accent);
    animation: pulse 2s infinite alternate;
}

.floating-icon {
    position: absolute;
    background: rgba(253, 204, 204, 0.3);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    color: #efeee9ff;
    box-shadow: 0 0 15px rgba(95, 181, 215, 0.5);
}

.icon-1 { top: 20px; left: 30px; animation: floatBottomRight 1s infinite ease-in-out; }
.icon-2 { bottom: 20px; right: 30px; animation: float 1s infinite ease-in-out reverse; }
.icon-3 { top: 40%; right: 10px; animation: float 1s infinite ease-in-out; }
.icon-4 { bottom: 10px; left: 40%; animation: float 1s infinite ease-in-out reverse; }

@keyframes pulse {
    from { transform: scale(1); opacity: 0.8; }
    to { transform: scale(1.05); opacity: 1; }
}

@keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
}

@keyframes floatBottomRight {
    0% { transform: translate(0, 0); }
    50% { transform: translate(15px, 15px); }
    100% { transform: translate(0, 0); }
}

/* --- How It Works Section --- */
.how-it-works {
    background-color: var(--color-light);
}

.steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.step-card {
    background-color: #f9f9f9;
    padding: 40px;
    border-radius: var(--border-radius);
    text-align: center;
    position: relative;
    box-shadow: 0 5px 15px var(--color-shadow);
    transition: transform 0.3s;
}

.step-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.step-number {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-primary-accent);
    color: var(--color-primary-dark);
    width: 40px;
    height: 40px;
    line-height: 40px;
    border-radius: 50%;
    font-weight: 700;
    font-size: 1.2rem;
    border: 3px solid var(--color-light);
}

.step-icon {
    font-size: 3rem;
    color: var(--color-primary-accent);
    margin-bottom: 20px;
    background: var(--color-primary-dark);
    width: 80px;
    height: 80px;
    line-height: 80px;
    border-radius: 50%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: var(--color-light);
}

.step-title {
    font-size: 1.5rem;
    color: var(--color-primary-dark);
    margin-bottom: 10px;
}

.step-description {
    color: var(--color-text-light);
}

/* --- Service Categories --- */
.services {
    background-color: #f1f6fa;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 20px;
}

.service-card {
    background-color: var(--color-light);
    padding: 25px 20px;
    border-radius: var(--border-radius);
    text-align: center;
    box-shadow: 0 4px 8px var(--color-shadow);
    transition: transform 0.3s, box-shadow 0.3s;
}

.service-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.service-icon {
    font-size: 2rem;
    margin-bottom: 15px;
    width: 60px;
    height: 60px;
    line-height: 60px;
    border-radius: 50%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    color: var(--color-light);
    background-color: var(--color-primary-dark);
}

.service-card .service-title {
    font-size: 1.2rem;
    color: var(--color-primary-dark);
    margin-bottom: 5px;
}

.service-description {
    font-size: 0.9rem;
    color: var(--color-text-light);
    margin-bottom: 15px;
    height: 36px;
}

.service-link {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-primary-accent);
}

.service-link i {
    margin-left: 5px;
}

/* Specific Service Icons (Color Overrides) */
.carpenter { background-color: #a0522d; }
.plumber { background-color: #1e90ff; }
.electrician { background-color: #ffaa00; }
.mechanic { background-color: #4a4a4a; }
.painter { background-color: #ff6347; }
.welder { background-color: #dc143c; }
.mason { background-color: #8b4513; }
.gardener { background-color: #3cb371; }
.cleaner { background-color: #00bcd4; }
.ac-technician { background-color: #3498db; }
.pest-control { background-color: #9c27b0; }
.appliance-repair { background-color: #e91e63; }
.tailor { background-color: #ffc107; }
.driver { background-color: #795548; }
.cook { background-color: #ff9800; }
.tutor { background-color: #009688; }
.beautician { background-color: #e57373; }
.security-guard { background-color: #607d8b; }
.photographer { background-color: #4caf50; }
.event-planner { background-color: #f44336; }


/* --- Worker Profiles Preview --- */
.workers {
    background-color: var(--color-light);
}

.workers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
}

.worker-card {
    background-color: #f9f9f9;
    padding: 30px;
    border-radius: var(--border-radius);
    text-align: center;
    box-shadow: 0 4px 10px var(--color-shadow);
    position: relative;
    transition: box-shadow 0.3s;
}

.worker-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.worker-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: var(--color-primary-accent);
    color: var(--color-primary-dark);
    padding: 5px 10px;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 700;
}

.worker-badge.verified {
    background-color: #28a745;
    color: var(--color-light);
}

.worker-photo img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 15px;
    border: 4px solid var(--color-primary-accent);
}

.worker-name {
    font-size: 1.4rem;
    color: var(--color-primary-dark);
    margin-bottom: 5px;
}

.worker-profession {
    color: var(--color-secondary);
    font-weight: 600;
    margin-bottom: 10px;
}

.worker-rating {
    color: var(--color-primary-accent);
    margin-bottom: 15px;
    font-size: 0.9rem;
}

.worker-rating i {
    margin-right: 2px;
}

.rating-text {
    color: var(--color-text-light);
    font-weight: 500;
    margin-left: 5px;
}

.worker-tags {
    margin-bottom: 20px;
    min-height: 25px;
}

.worker-tags .tag {
    display: inline-block;
    background-color: #eee;
    color: var(--color-text-light);
    font-size: 0.8rem;
    padding: 5px 10px;
    border-radius: 5px;
    margin: 3px;
}

.worker-info {
    display: flex;
    justify-content: space-around;
    color: var(--color-text-light);
    font-size: 0.9rem;
    margin-bottom: 20px;
}

.worker-info span i {
    margin-right: 5px;
    color: var(--color-primary-accent);
}

/* --- Features Section (Why Choose Us) --- */
.features {
    background-color: var(--color-light);
    padding: 50px 0;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.feature-card {
    text-align: center;
    padding: 30px;
    border: 1px solid #ddd;
    border-radius: var(--border-radius);
    transition: border-color 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
    border-color: var(--color-primary-accent);
    box-shadow: 0 0 15px rgba(252, 198, 43, 0.2);
}

.feature-icon {
    font-size: 2.5rem;
    color: var(--color-primary-accent);
    margin-bottom: 15px;
    background: var(--color-primary-dark);
    width: 60px;
    height: 60px;
    line-height: 60px;
    border-radius: 50%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}

.feature-title {
    font-size: 1.3rem;
    color: var(--color-primary-dark);
    margin-bottom: 10px;
}

.feature-description {
    color: var(--color-text-light);
    font-size: 0.95rem;
}

/* --- Testimonials Section --- */
.testimonials {
    background-color: #f1f6fa;
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.testimonial-card {
    background-color: var(--color-light);
    padding: 30px;
    border-radius: var(--border-radius);
    box-shadow: 0 4px 10px var(--color-shadow);
}

.testimonial-rating {
    color: var(--color-primary-accent);
    margin-bottom: 15px;
}

.testimonial-text {
    font-style: italic;
    color: var(--color-text-light);
    margin-bottom: 20px;
}

.testimonial-author {
    display: flex;
    align-items: center;
    gap: 15px;
}

.testimonial-author img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--color-primary-accent);
}

.author-name {
    font-size: 1.1rem;
    color: var(--color-primary-dark);
    font-weight: 600;
}

.author-location {
    font-size: 0.9rem;
    color: var(--color-text-light);
}

/* --- CTA Section --- */
.cta-section {
    background-color: var(--color-primary-dark);
    padding: 80px 0;
    text-align: center;
}

.cta-title {
    font-size: 2.5rem;
    color: var(--color-light);
    margin-bottom: 15px;
}

.cta-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 40px;
}

.cta-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
}


/* --- Footer --- */
.footer {
    background-color: #0a1828;
    color: rgba(255, 255, 255, 0.7);
    padding: 60px 0 20px;
    font-size: 0.95rem;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-bottom: 40px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    gap: 30px;
}

.footer-section {
    width: 200px;
    margin-bottom: 20px;
}

.footer-brand {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.footer-logo-img {
    height: 30px;
    margin-right: 10px;
}

.footer-logo {
    color: var(--color-light);
    font-size: 1.3rem;
    font-weight: 700;
}

.footer-description {
    margin-bottom: 20px;
}

.social-links {
    display: flex;
    gap: 15px;
}

.social-link {
    color: var(--color-light);
    font-size: 1.2rem;
    transition: color 0.3s;
}

.social-link:hover {
    color: var(--color-primary-accent);
}

.footer-heading {
    color: var(--color-light);
    font-size: 1.1rem;
    margin-bottom: 20px;
    position: relative;
}

.footer-heading::after {
    content: '';
    display: block;
    width: 30px;
    height: 2px;
    background: var(--color-primary-accent);
    margin-top: 5px;
}

.footer-links, .footer-contact {
    list-style: none;
    padding: 0;
}

.footer-links li, .footer-contact li {
    margin-bottom: 10px;
}

.footer-links a {
    color: rgba(255, 255, 255, 0.7);
}

.footer-links a:hover {
    color: var(--color-primary-accent);
}

.footer-contact li i {
    margin-right: 10px;
    color: var(--color-primary-accent);
}

.app-downloads {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
}

.app-button {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: var(--color-light);
    color: var(--color-primary-dark);
    padding: 8px 15px;
    border-radius: 5px;
    font-weight: 600;
    transition: background-color 0.3s;
}

.app-button:hover {
    background-color: var(--color-primary-accent);
}

.app-button i {
    font-size: 1.5rem;
}

.footer-bottom {
    text-align: center;
    padding-top: 20px;
    font-size: 0.85rem;
}

.footer-bottom i {
    color: #ff6b6b;
    margin: 0 5px;
}


/* --- Media Queries (Responsiveness) --- */
@media (max-width: 992px) {
    .hero-content {
        flex-direction: column;
        text-align: center;
    }

    .hero-text {
        order: 2;
    }

    .hero-illustration {
        order: 1;
        margin-bottom: 40px;
    }

    .hero-title {
        font-size: 2.8rem;
    }

    .hero-buttons {
        justify-content: center;
    }
}

@media (max-width: 768px) {
    section {
        padding: 60px 0;
    }

    .nav-links {
        display: none;
    }

    .mobile-menu-btn {
        display: block;
    }

    .hero-title {
        font-size: 2.2rem;
    }

    .hero-subtitle {
        font-size: 1.1rem;
    }

    .hero-stats {
        justify-content: center;
    }

    .services-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .workers-grid {
        grid-template-columns: 1fr;
    }

    .footer-content {
        justify-content: flex-start;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .footer-section {
        width: 100%;
        max-width: 300px;
    }
    
    .footer-brand {
        justify-content: center;
    }

    .social-links {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .hero-buttons {
        flex-direction: column;
    }

    .btn-large {
        width: 100%;
    }

    .footer-heading::after {
        margin: 5px auto 0;
    }
}
    `;

  return (
    <React.Fragment>
      <style dangerouslySetInnerHTML={{ __html: combinedStyles }} />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <img src="logo.png" alt="NammaKarya Logo" className="logo-img" />
              <span className="logo-text">NammaKarya</span>
            </div>
            <div className="nav-links">
              <a href="#how-it-works">How It Works</a>
              <a href="#services">Services</a>

              <a href="#contact">Contact</a>
              <a href="/login" className="btn btn-secondary">Sign In</a>
              <a href="/signup" className="btn btn-primary">Get Started</a>
            </div>
            <button className="mobile-menu-btn" id="mobileMenuBtn">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mobile-menu" id="mobileMenu">
        <a href="#how-it-works">How It Works</a>
        <a href="#services">Services</a>

        <a href="#contact">Contact</a>
        <button className="btn btn-secondary" id="mobileSignInBtn">Sign In</button>
        <button className="btn btn-primary" id="mobileGetStartedBtn">Get Started</button>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">Find Trusted Local Skilled Workers in Minutes</h1>
              <p className="hero-subtitle">Connect with verified carpenters, plumbers, electricians, and more. Quality work, fair prices, guaranteed satisfaction.</p>
              <div className="hero-buttons">
                <a href="/login" className="btn btn-primary btn-large" id="findWorkerBtn">
                  <i className="fas fa-search"></i> Find a Worker
                </a>
                <a href="/login" className="btn btn-outline btn-large" id="joinWorkerBtn">
                  <i className="fas fa-user-plus"></i> Join as Worker
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">10,000+</span>
                  <span className="stat-label">Verified Workers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50,000+</span>
                  <span className="stat-label">Jobs Completed</span>
                </div>
              </div>
            </div>
            <div className="hero-illustration">
              <div className="illustration-card">
                <i className="fas fa-tools illustration-icon"></i>
                <div className="floating-icon icon-1"><i className="fas fa-hammer"></i></div>
                <div className="floating-icon icon-2"><i className="fas fa-wrench"></i></div>
                <div className="floating-icon icon-3"><i className="fas fa-paint-roller"></i></div>
                <div className="floating-icon icon-4"><i className="fas fa-bolt"></i></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h1 className="section-title">How It Works</h1>
          <p className="section-subtitle">Get the help you need in three simple steps</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="step-title">Search & Browse</h3>
              <p className="step-description">Find skilled workers near you by service category, ratings, and availability</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="step-title">Connect & Discuss</h3>
              <p className="step-description">Call directly with workers, discuss your needs, and get quotes instantly</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 className="step-title">Book & Pay Securely</h3>
              <p className="step-description">Schedule the job and pay securely through our platform with full protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Service Categories */}
      <section className="services" id="services">
        <div className="container">
          <h2 className="section-title">Top Service Categories</h2>
          <p className="section-subtitle">Explore our most popular skilled services</p>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon carpenter">
                <i className="fas fa-hammer"></i>
              </div>
              <h3 className="service-title">Carpenter</h3>
              <p className="service-description">Furniture, doors, repairs, custom woodwork</p>
              <a href="#" className="service-link">Find Carpenters <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon plumber">
                <i className="fas fa-wrench"></i>
              </div>
              <h3 className="service-title">Plumber</h3>
              <p className="service-description">Leaks, installations, pipe repairs, drainage</p>
              <a href="#" className="service-link">Find Plumbers <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon electrician">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="service-title">Electrician</h3>
              <p className="service-description">Wiring, fixtures, repairs, safety inspections</p>
              <a href="#" className="service-link">Find Electricians <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon mechanic">
                <i className="fas fa-car"></i>
              </div>
              <h3 className="service-title">Mechanic</h3>
              <p className="service-description">Auto repairs, maintenance, diagnostics</p>
              <a href="#" className="service-link">Find Mechanics <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon painter">
                <i className="fas fa-paint-roller"></i>
              </div>
              <h3 className="service-title">Painter</h3>
              <p className="service-description">Interior, exterior, texture, finishing</p>
              <a href="#" className="service-link">Find Painters <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon welder">
                <i className="fas fa-fire"></i>
              </div>
              <h3 className="service-title">Welder</h3>
              <p className="service-description">Metal fabrication, welding, repairs</p>
              <a href="#" className="service-link">Find Welders <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon mason">
                <i className="fas fa-home"></i>
              </div>
              <h3 className="service-title">Mason</h3>
              <p className="service-description">Brickwork, plastering, construction</p>
              <a href="#" className="service-link">Find Masons <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon gardener">
                <i className="fas fa-leaf"></i>
              </div>
              <h3 className="service-title">Gardener</h3>
              <p className="service-description">Landscaping, lawn care, plant maintenance</p>
              <a href="#" className="service-link">Find Gardeners <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon cleaner">
                <i className="fas fa-broom"></i>
              </div>
              <h3 className="service-title">Cleaner</h3>
              <p className="service-description">Deep cleaning, sanitation, housekeeping</p>
              <a href="#" className="service-link">Find Cleaners <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon ac-technician">
                <i className="fas fa-snowflake"></i>
              </div>
              <h3 className="service-title">AC Technician</h3>
              <p className="service-description">AC repair, installation, maintenance</p>
              <a href="#" className="service-link">Find AC Technicians <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon pest-control">
                <i className="fas fa-bug"></i>
              </div>
              <h3 className="service-title">Pest Control</h3>
              <p className="service-description">Termite, rodent, insect control services</p>
              <a href="#" className="service-link">Find Pest Control <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon appliance-repair">
                <i className="fas fa-tv"></i>
              </div>
              <h3 className="service-title">Appliance Repair</h3>
              <p className="service-description">Fridge, washing machine, microwave repairs</p>
              <a href="#" className="service-link">Find Technicians <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon tailor">
                <i className="fas fa-cut"></i>
              </div>
              <h3 className="service-title">Tailor</h3>
              <p className="service-description">Stitching, alterations, custom clothing</p>
              <a href="#" className="service-link">Find Tailors <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon driver">
                <i className="fas fa-user-tie"></i>
              </div>
              <h3 className="service-title">Driver</h3>
              <p className="service-description">Personal, delivery, chauffeur services</p>
              <a href="#" className="service-link">Find Drivers <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon cook">
                <i className="fas fa-utensils"></i>
              </div>
              <h3 className="service-title">Cook</h3>
              <p className="service-description">Home cooking, catering, meal prep</p>
              <a href="#" className="service-link">Find Cooks <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon tutor">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3 className="service-title">Tutor</h3>
              <p className="service-description">Home tuition, coaching, language classes</p>
              <a href="#" className="service-link">Find Tutors <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon beautician">
                <i className="fas fa-spa"></i>
              </div>
              <h3 className="service-title">Beautician</h3>
              <p className="service-description">Salon services, makeup, grooming</p>
              <a href="#" className="service-link">Find Beauticians <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon security-guard">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="service-title">Security Guard</h3>
              <p className="service-description">Home security, event security, patrol</p>
              <a href="#" className="service-link">Find Guards <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon photographer">
                <i className="fas fa-camera"></i>
              </div>
              <h3 className="service-title">Photographer</h3>
              <p className="service-description">Events, portraits, commercial photography</p>
              <a href="#" className="service-link">Find Photographers <i className="fas fa-arrow-right"></i></a>
            </div>
            <div className="service-card">
              <div className="service-icon event-planner">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3 className="service-title">Event Planner</h3>
              <p className="service-description">Wedding, party, corporate event planning</p>
              <a href="#" className="service-link">Find Planners <i className="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </section>

      {/* Worker Profiles Preview */}


      {/* App Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose NammaKarya</h2>
          <p className="section-subtitle">Trust, quality, and convenience in one platform</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="feature-title">Secure Payments</h3>
              <p className="feature-description">Pay safely through our encrypted platform. Money released only after job completion.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="feature-title">Direct Chat</h3>
              <p className="feature-description">Communicate directly with workers, share photos, and discuss requirements instantly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-user-check"></i>
              </div>
              <h3 className="feature-title">Verified Workers</h3>
              <p className="feature-description">All workers are background-checked and verified with skills, documents, and reviews.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-map-marked-alt"></i>
              </div>
              <h3 className="feature-title">Location-Based</h3>
              <p className="feature-description">Find workers near you with real-time availability and location tracking.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3 className="feature-title">Ratings & Reviews</h3>
              <p className="feature-description">Read authentic reviews from real customers to make informed decisions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3 className="feature-title">24/7 Support</h3>
              <p className="feature-description">Our customer support team is always available to help resolve any issues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}


      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-subtitle">Join thousands of satisfied customers and workers on NammaKarya</p>
            <div className="cta-buttons">
              <a href="/login" className="btn btn-primary btn-large" id="ctaFindWorkerBtn">Find a Worker</a>
              <a href="/login" className="btn btn-outline-light btn-large" id="ctaJoinWorkerBtn">Join as Worker</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-brand">
                <img src="logo.png" alt="NammaKarya Logo" className="footer-logo-img" />
                <h3 className="footer-logo">NammaKarya</h3>
              </div>
              <p className="footer-description">Connecting skilled workers with customers who need quality services. Trust, transparency, and convenience.</p>
              <div className="social-links">
                <a href="https://facebook.com/NammaKarya" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-facebook-f"></i></a>
                <a href="https://twitter.com/NammaKarya" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-twitter"></i></a>
                <a href="https://instagram.com/nammakarya" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-instagram"></i></a>
                <a href="https://linkedin.com/company/NammaKarya" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-linkedin-in"></i></a>
                <a href="https://youtube.com/@NammaKarya" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-youtube"></i></a>
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#workers">Find Workers</a></li>
                <li><a href="#">Become a Worker</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Support</h4>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Safety Guidelines</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Contact</h4>
              <ul className="footer-contact">
                <li><i className="fas fa-envelope"></i> support@nammakarya.com</li>
                <li><i className="fas fa-phone"></i> +91 8050781044</li>
                <li><i className="fas fa-map-marker-alt"></i>Sullia ,DhakshinaKannada , Karnataka, India</li>
              </ul>
              <div className="app-downloads">
                <a href="#" className="app-button">
                  <i className="fab fa-google-play"></i>
                  <span>Google Play</span>
                </a>
                <a href="#" className="app-button">
                  <i className="fab fa-apple"></i>
                  <span>App Store</span>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 NammaKarya. All rights reserved. Made with <i className="fas fa-heart"></i> for India</p>
          </div>
        </div>
      </footer>

      {/* Note: Actual JavaScript/Firebase SDKs are commented out, as their logic belongs in separate files/hooks in a React/TSX environment. */}
      {/* Note: Actual JavaScript/Firebase SDKs are commented out, as their logic belongs in separate files/hooks in a React/TSX environment. */}
      {/* <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script> */}
      {/* <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script> */}
      {/* <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script> */}
      {/* <script src="script.js"></script> */}
      {/* <script src="api-service.js"></script> */}
      {/* <script src="auth-integration.js"></script> */}
    </React.Fragment>
  );
}

export default NammaKaryaLandingPage;