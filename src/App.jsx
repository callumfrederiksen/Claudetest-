import './App.css'

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-inner">
          <span className="logo">MyApp</span>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact" className="btn-nav">Get Started</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <span className="badge">Now live on DigitalOcean</span>
          <h1>Build faster.<br />Ship with confidence.</h1>
          <p>
            A production-ready React app, containerised with Docker and
            automatically deployed to DigitalOcean App Platform.
          </p>
          <div className="hero-actions">
            <a href="#features" className="btn-primary">Explore Features</a>
            <a href="https://github.com/callumfrederiksen/claudetest-" className="btn-secondary">View on GitHub</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="code-card">
            <div className="code-dots">
              <span /><span /><span />
            </div>
            <pre><code>{`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist \
  /usr/share/nginx/html
EXPOSE 80`}</code></pre>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-inner">
          <h2>Everything you need to ship</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">&#9729;</div>
              <h3>Docker Ready</h3>
              <p>Multi-stage Dockerfile that builds and serves your app via nginx with a tiny final image.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#9889;</div>
              <h3>Auto Deploy</h3>
              <p>Push to main and DigitalOcean App Platform automatically rebuilds and redeploys your app.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#128274;</div>
              <h3>Production Grade</h3>
              <p>HTTPS, health checks, and scaling handled by DigitalOcean — zero extra config needed.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#128640;</div>
              <h3>Vite Powered</h3>
              <p>Lightning-fast builds and hot module replacement during local development with Vite.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta" id="contact">
        <div className="section-inner">
          <h2>Ready to deploy?</h2>
          <p>Connect this repo to DigitalOcean App Platform and your site goes live in minutes.</p>
          <a href="https://cloud.digitalocean.com/apps/new" className="btn-primary">Deploy on DigitalOcean</a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <span className="logo">MyApp</span>
          <p>Built with React &amp; deployed on DigitalOcean.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
