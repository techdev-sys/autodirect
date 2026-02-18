import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["How It Works", "For Suppliers", "For Transporters", "About Us"];

const STATS = [
    { value: "2,400+", label: "Active Routes" },
    { value: "98%", label: "On-Time Delivery" },
    { value: "850+", label: "Verified Fleets" },
    { value: "14 Countries", label: "Regional Coverage" },
];

const HOW_IT_WORKS = [
    { step: "01", title: "Create Your Account", desc: "Sign up as a Supplier or Transporter. Verification takes under 24 hours." },
    { step: "02", title: "Post or Discover", desc: "Suppliers post cargo. Transporters browse high-value assignments matched to their fleet." },
    { step: "03", title: "Connect & Move", desc: "Real-time tracking, digital contracts, and instant payments. No middlemen." },
];

const SUPPLIER_FEATURES = [
    "Post cargo in under 2 minutes",
    "Receive competitive bids instantly",
    "Track shipments in real-time",
    "Verified, insured transporters only",
    "Digital invoicing & payments",
];

const HAULER_FEATURES = [
    "Browse high-pay cargo near you",
    "No dead-miles — optimised routing",
    "Instant payment on delivery",
    "Fleet management dashboard",
    "Priority access to premium loads",
];

// onGetStarted(role?) — navigates to signup/onboarding, optionally with a pre-selected role
// onLogin — navigates to the login screen
export default function WelcomePage({ onGetStarted, onLogin }) {
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", background: "#0a0a0a", color: "#f5f0e8", overflowX: "hidden" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Barlow:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --orange: #F97316;
          --blue: #2563EB;
          --dark: #0a0a0a;
          --off-white: #f5f0e8;
          --muted: #888;
          --card-bg: #141414;
          --border: rgba(255,255,255,0.08);
        }

        html { scroll-behavior: smooth; }

        .nav-fixed {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 20px 40px;
          display: flex; align-items: center; justify-content: space-between;
          transition: background 0.3s, backdrop-filter 0.3s, padding 0.3s;
        }
        .nav-fixed.scrolled {
          background: rgba(10,10,10,0.92);
          backdrop-filter: blur(12px);
          padding: 14px 40px;
          border-bottom: 1px solid var(--border);
        }

        .logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; cursor: pointer;
        }
        .logo-icon {
          width: 36px; height: 36px; background: #000;
          border-radius: 10px; border: 2px solid var(--orange);
          display: flex; align-items: center; justify-content: center;
        }
        .logo-dot {
          width: 14px; height: 14px; background: var(--orange); border-radius: 4px;
        }
        .logo-text {
          font-size: 20px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--off-white);
        }
        .logo-text span { color: var(--orange); }

        .nav-links { display: flex; gap: 32px; list-style: none; }
        .nav-links a {
          font-size: 13px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--muted); text-decoration: none; transition: color 0.2s; cursor: pointer;
        }
        .nav-links a:hover { color: var(--off-white); }

        .nav-cta { display: flex; gap: 12px; align-items: center; }

        .btn-ghost {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          background: transparent; border: 1px solid rgba(255,255,255,0.2);
          color: var(--off-white); padding: 10px 22px; border-radius: 8px;
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .btn-ghost:hover { border-color: var(--off-white); }

        .btn-primary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
          background: var(--orange); border: none;
          color: #fff; padding: 10px 22px; border-radius: 8px;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
        }
        .btn-primary:hover { background: #ea6700; transform: translateY(-1px); }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: center;
          padding: 120px 40px 80px;
          position: relative; overflow: hidden;
        }

        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        .hero-glow-orange {
          position: absolute; top: -200px; left: -200px;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-glow-blue {
          position: absolute; bottom: -200px; right: -100px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-eyebrow {
          font-size: 12px; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--orange); margin-bottom: 24px;
          display: flex; align-items: center; gap: 12px;
        }
        .hero-eyebrow::before {
          content: ''; display: block;
          width: 32px; height: 2px; background: var(--orange);
        }

        .hero-title {
          font-size: clamp(64px, 9vw, 130px);
          font-weight: 900; line-height: 0.92;
          text-transform: uppercase; letter-spacing: -0.02em;
          max-width: 900px;
        }
        .hero-title .line-orange { color: var(--orange); font-style: italic; }
        .hero-title .line-blue { color: var(--blue); }

        .hero-sub {
          font-family: 'Barlow', sans-serif;
          font-size: 18px; font-weight: 400; line-height: 1.7;
          color: #aaa; max-width: 480px; margin-top: 32px; margin-bottom: 48px;
        }

        .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }

        .btn-lg {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
          padding: 16px 36px; border-radius: 12px;
          cursor: pointer; transition: all 0.2s; border: none;
          display: inline-flex; align-items: center; gap: 10px;
        }
        .btn-lg-orange { background: var(--orange); color: #fff; }
        .btn-lg-orange:hover { background: #ea6700; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(249,115,22,0.35); }
        .btn-lg-blue { background: var(--blue); color: #fff; }
        .btn-lg-blue:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(37,99,235,0.35); }

        .hero-badge {
          margin-top: 80px;
          display: flex; gap: 0; flex-wrap: wrap;
          border: 1px solid var(--border); border-radius: 16px;
          overflow: hidden; max-width: 720px;
          background: var(--card-bg);
        }
        .hero-badge-item {
          flex: 1; min-width: 140px;
          padding: 24px 28px;
          border-right: 1px solid var(--border);
        }
        .hero-badge-item:last-child { border-right: none; }
        .badge-val {
          font-size: 32px; font-weight: 900; color: var(--off-white);
          letter-spacing: -0.02em;
        }
        .badge-val.orange { color: var(--orange); }
        .badge-val.blue { color: var(--blue); }
        .badge-label {
          font-family: 'Barlow', sans-serif;
          font-size: 12px; color: var(--muted); margin-top: 4px; font-weight: 500;
        }

        /* SECTION SHARED */
        section { padding: 100px 40px; }

        .section-label {
          font-size: 11px; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase;
          color: var(--orange); margin-bottom: 16px;
        }
        .section-title {
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 900; text-transform: uppercase; line-height: 1;
          letter-spacing: -0.01em;
        }
        .section-body {
          font-family: 'Barlow', sans-serif;
          font-size: 17px; color: #999; line-height: 1.7; max-width: 520px; margin-top: 16px;
        }

        /* HOW IT WORKS */
        .hiw-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 2px; margin-top: 64px;
          border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
        }
        .hiw-card {
          background: var(--card-bg); padding: 48px 40px;
          border-right: 1px solid var(--border);
          transition: background 0.3s;
        }
        .hiw-card:last-child { border-right: none; }
        .hiw-card:hover { background: #1a1a1a; }
        .hiw-step {
          font-size: 72px; font-weight: 900; color: rgba(255,255,255,0.06);
          line-height: 1; margin-bottom: 24px; letter-spacing: -0.04em;
        }
        .hiw-title {
          font-size: 22px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.02em; margin-bottom: 12px;
        }
        .hiw-desc {
          font-family: 'Barlow', sans-serif;
          font-size: 15px; color: #888; line-height: 1.7;
        }

        /* DUAL CTA */
        .dual-cta {
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
          margin-top: 0;
        }
        @media (max-width: 720px) { .dual-cta { grid-template-columns: 1fr; } }

        .role-card {
          border-radius: 28px; padding: 56px 48px;
          position: relative; overflow: hidden; cursor: pointer;
          transition: transform 0.25s, box-shadow 0.25s;
          border: none; text-align: left; background: none;
          color: var(--off-white);
        }
        .role-card:hover { transform: translateY(-6px); }

        .role-card-orange {
          background: linear-gradient(135deg, #1a0e00 0%, #2a1500 100%);
          border: 2px solid rgba(249,115,22,0.4);
        }
        .role-card-orange:hover { box-shadow: 0 24px 60px rgba(249,115,22,0.2); }

        .role-card-blue {
          background: linear-gradient(135deg, #00081a 0%, #001530 100%);
          border: 2px solid rgba(37,99,235,0.4);
        }
        .role-card-blue:hover { box-shadow: 0 24px 60px rgba(37,99,235,0.2); }

        .role-icon {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; margin-bottom: 28px;
        }
        .role-icon-orange { background: rgba(249,115,22,0.15); }
        .role-icon-blue { background: rgba(37,99,235,0.15); }

        .role-title {
          font-size: 40px; font-weight: 900; text-transform: uppercase;
          letter-spacing: -0.01em; margin-bottom: 12px;
        }
        .role-sub {
          font-family: 'Barlow', sans-serif;
          font-size: 15px; color: #888; line-height: 1.7; margin-bottom: 36px;
        }

        .features-list { list-style: none; margin-bottom: 40px; }
        .features-list li {
          font-family: 'Barlow', sans-serif;
          font-size: 14px; font-weight: 500; padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 10px; color: #ccc;
        }
        .features-list li::before {
          content: '✓'; font-size: 12px; font-weight: 700;
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .list-orange li::before { color: var(--orange); background: rgba(249,115,22,0.1); }
        .list-blue li::before { color: var(--blue); background: rgba(37,99,235,0.1); }

        .role-cta {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;
          padding: 14px 32px; border-radius: 10px;
          cursor: pointer; border: none; transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .cta-orange { background: var(--orange); color: #fff; }
        .cta-orange:hover { background: #ea6700; box-shadow: 0 8px 24px rgba(249,115,22,0.4); }
        .cta-blue { background: var(--blue); color: #fff; }
        .cta-blue:hover { background: #1d4ed8; box-shadow: 0 8px 24px rgba(37,99,235,0.4); }

        /* ABOUT */
        .about-inner {
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        @media (max-width: 860px) { .about-inner { grid-template-columns: 1fr; gap: 48px; } }

        .about-visual { position: relative; height: 420px; }
        .about-block {
          position: absolute; border-radius: 20px; padding: 32px;
          font-weight: 900; text-transform: uppercase;
        }
        .ab1 {
          top: 0; left: 0; right: 60px; height: 220px;
          background: linear-gradient(135deg, #1a0e00, #2a1500);
          border: 1px solid rgba(249,115,22,0.2);
          display: flex; align-items: flex-end;
        }
        .ab2 {
          bottom: 0; right: 0; left: 60px; height: 200px;
          background: linear-gradient(135deg, #00081a, #001530);
          border: 1px solid rgba(37,99,235,0.2);
          display: flex; align-items: flex-end;
        }
        .ab-text { font-size: 48px; line-height: 1; letter-spacing: -0.02em; }
        .ab-sub { font-family: 'Barlow', sans-serif; font-size: 13px; font-weight: 500; color: #666; margin-top: 8px; }

        /* FOOTER */
        footer {
          padding: 60px 40px;
          border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 24px;
        }
        .footer-text { font-family: 'Barlow', sans-serif; font-size: 13px; color: var(--muted); }
        .footer-brand { font-size: 13px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }

        .divider { border: none; height: 1px; background: var(--border); margin: 0 40px; }

        @media (max-width: 640px) {
          .nav-links { display: none; }
          .hero { padding: 100px 24px 60px; }
          section { padding: 72px 24px; }
          footer { padding: 40px 24px; }
          hr.divider { margin: 0 24px; }
          .hero-badge { display: none; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.25s; opacity: 0; }
        .delay-3 { animation-delay: 0.4s; opacity: 0; }
        .delay-4 { animation-delay: 0.55s; opacity: 0; }
      `}</style>

            {/* NAV */}
            <nav className={`nav-fixed${scrolled ? " scrolled" : ""}`}>
                <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    <div className="logo-icon"><div className="logo-dot"></div></div>
                    <span className="logo-text">Auto<span>Direct</span></span>
                </div>
                <ul className="nav-links">
                    <li><a onClick={() => scrollTo("how-it-works")}>How It Works</a></li>
                    <li><a onClick={() => scrollTo("for-suppliers")}>For Suppliers</a></li>
                    <li><a onClick={() => scrollTo("for-transporters")}>For Transporters</a></li>
                    <li><a onClick={() => scrollTo("about-us")}>About Us</a></li>
                </ul>
                <div className="nav-cta">
                    <button className="btn-ghost" onClick={onLogin}>Log In</button>
                    <button className="btn-primary" onClick={() => onGetStarted()}>Get Started →</button>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero" ref={heroRef} id="hero">
                <div className="hero-grid"></div>
                <div className="hero-glow-orange"></div>
                <div className="hero-glow-blue"></div>

                <div style={{ position: "relative", zIndex: 2 }}>
                    <div className="hero-eyebrow fade-up delay-1">The Logistics Marketplace</div>

                    <h1 className="hero-title fade-up delay-2">
                        Move Cargo.<br />
                        <span className="line-orange">Move Fast.</span><br />
                        <span className="line-blue">Move Smart.</span>
                    </h1>

                    <p className="hero-sub fade-up delay-3">
                        AutoDirect connects suppliers with verified transporters across the region — cutting out the middlemen, eliminating dead miles, and getting cargo where it needs to go.
                    </p>

                    <div className="hero-actions fade-up delay-4">
                        <button className="btn-lg btn-lg-orange" onClick={() => onGetStarted('supplier')}>
                            I'm a Supplier →
                        </button>
                        <button className="btn-lg btn-lg-blue" onClick={() => onGetStarted('hauler')}>
                            I'm a Transporter →
                        </button>
                    </div>

                    <div className="hero-badge fade-up delay-4">
                        {STATS.map((s, i) => (
                            <div className="hero-badge-item" key={s.label}>
                                <div className={`badge-val ${i % 2 === 0 ? "orange" : "blue"}`}>{s.value}</div>
                                <div className="badge-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <hr className="divider" />

            {/* HOW IT WORKS */}
            <section id="how-it-works">
                <div className="section-label">Simple Process</div>
                <h2 className="section-title">How It Works</h2>
                <p className="section-body">Three steps to connect your business with the right logistics partner — in minutes, not days.</p>
                <div className="hiw-grid">
                    {HOW_IT_WORKS.map(item => (
                        <div className="hiw-card" key={item.step}>
                            <div className="hiw-step">{item.step}</div>
                            <div className="hiw-title">{item.title}</div>
                            <div className="hiw-desc">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            <hr className="divider" />

            {/* DUAL ROLE CTA */}
            <section id="for-suppliers">
                <div className="section-label">Pick Your Role</div>
                <h2 className="section-title">Built For Both Sides</h2>
                <p className="section-body" style={{ marginBottom: "56px" }}>Whether you're moving goods or moving trucks, AutoDirect has the tools you need.</p>

                <div className="dual-cta">
                    {/* Supplier */}
                    <button className="role-card role-card-orange" onClick={() => onGetStarted('supplier')}>
                        <div className="role-icon role-icon-orange">📦</div>
                        <div className="role-title" style={{ color: "var(--orange)" }}>Supplier</div>
                        <p className="role-sub">You have cargo. We have the network. Post shipments and receive competitive bids from verified transporters — fast.</p>
                        <ul className="features-list list-orange">
                            {SUPPLIER_FEATURES.map(f => <li key={f}>{f}</li>)}
                        </ul>
                        <span className="role-cta cta-orange">Start as Supplier →</span>
                    </button>

                    {/* Transporter */}
                    <button className="role-card role-card-blue" id="for-transporters" onClick={() => onGetStarted('hauler')}>
                        <div className="role-icon role-icon-blue">🚛</div>
                        <div className="role-title" style={{ color: "var(--blue)" }}>Transporter</div>
                        <p className="role-sub">Fill your trucks with high-value cargo. Discover assignments matched to your fleet size, route, and availability — no cold calling.</p>
                        <ul className="features-list list-blue">
                            {HAULER_FEATURES.map(f => <li key={f}>{f}</li>)}
                        </ul>
                        <span className="role-cta cta-blue">Start as Transporter →</span>
                    </button>
                </div>
            </section>

            <hr className="divider" />

            {/* ABOUT */}
            <section id="about-us">
                <div className="about-inner">
                    <div>
                        <div className="section-label">About AutoDirect</div>
                        <h2 className="section-title">Logistics,<br />Reimagined</h2>
                        <p className="section-body" style={{ marginTop: "24px" }}>
                            AutoDirect was built to solve a real problem: suppliers couldn't find reliable transporters fast, and haulers were running half-empty trucks on expensive routes.
                        </p>
                        <p className="section-body" style={{ marginTop: "16px" }}>
                            We built a marketplace that works for both sides — transparent pricing, real-time tracking, verified profiles, and instant payments. No brokers. No phone tag. Just freight moving efficiently.
                        </p>
                        <button className="btn-lg btn-lg-orange" style={{ marginTop: "40px" }} onClick={() => onGetStarted()}>
                            Join AutoDirect →
                        </button>
                    </div>
                    <div className="about-visual">
                        <div className="ab1">
                            <div>
                                <div className="ab-text" style={{ color: "var(--orange)" }}>Suppliers<br />First</div>
                                <div className="ab-sub">Fast posting. Verified bids. Zero hassle.</div>
                            </div>
                        </div>
                        <div className="ab2">
                            <div>
                                <div className="ab-text" style={{ color: "var(--blue)" }}>Haulers<br />Win More</div>
                                <div className="ab-sub">Better loads. Smarter routes. More pay.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="divider" />

            {/* FOOTER */}
            <footer>
                <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    <div className="logo-icon"><div className="logo-dot"></div></div>
                    <span className="logo-text">Auto<span>Direct</span></span>
                </div>
                <p className="footer-text">© 2025 AutoDirect. All rights reserved.</p>
                <p className="footer-brand">Powered by TechDevs</p>
            </footer>
        </div>
    );
}
