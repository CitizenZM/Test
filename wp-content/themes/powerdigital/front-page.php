<?php
/**
 * Template Name: Front Page
 */

get_header();
?>
<section class="hero" id="solutions">
        <div class="container hero-layout">
          <div class="hero-copy">
            <span class="eyebrow">Growth Marketing Agency</span>
            <h1>Scaling digital brands from first click to lasting loyalty.</h1>
            <p>
              We partner with ambitious teams to turn untapped potential into measurable performance across the entire customer journey.
            </p>
            <div class="hero-actions">
              <a class="cta-button" href="#contact">Book a Consultation</a>
              <a class="ghost-button" href="#case-studies">View Work</a>
            </div>
            <dl class="hero-stats" aria-label="Agency performance metrics">
              <div>
                <dt>$3.2B</dt>
                <dd>Revenue driven for clients in 2023</dd>
              </div>
              <div>
                <dt>88%</dt>
                <dd>Average client retention rate</dd>
              </div>
              <div>
                <dt>140+</dt>
                <dd>Growth strategists across 12 disciplines</dd>
              </div>
            </dl>
          </div>
          <div class="hero-card">
            <div class="card-header">
              <p class="card-title">Campaign Pulse</p>
              <p class="card-subtitle">Paid media performance snapshot</p>
            </div>
            <div class="card-body">
              <div class="metric-row">
                <div>
                  <p class="metric-label">ROAS</p>
                  <p class="metric-value">5.6x</p>
                </div>
                <span class="badge badge-positive">+18%</span>
              </div>
              <div class="metric-row">
                <div>
                  <p class="metric-label">AOV</p>
                  <p class="metric-value">$132</p>
                </div>
                <span class="badge badge-neutral">Stable</span>
              </div>
              <div class="progress-group">
                <div class="progress-label">
                  <span>Email revenue contribution</span>
                  <span>62%</span>
                </div>
                <div class="progress-track">
                  <span class="progress-bar" style="--progress: 62%"></span>
                </div>
              </div>
              <div class="progress-group">
                <div class="progress-label">
                  <span>LTV growth</span>
                  <span>+34%</span>
                </div>
                <div class="progress-track">
                  <span class="progress-bar" style="--progress: 34%"></span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <p class="card-meta">Updated 2 hours ago</p>
              <button class="ghost-button ghost-button--dark">Open dashboard</button>
            </div>
          </div>
        </div>
      </section>

      <section class="social-proof" aria-label="Client logos">
        <div class="container">
          <p class="eyebrow">Trusted by category leaders</p>
          <div class="logo-grid">
            <span>Lyra Health</span>
            <span>Vuori</span>
            <span>Goop</span>
            <span>Italic</span>
            <span>JustFoodForDogs</span>
            <span>La Colombe</span>
          </div>
        </div>
      </section>

      <section class="services" id="services">
        <div class="container">
          <header class="section-header">
            <span class="eyebrow">Full-funnel Services</span>
            <h2>Unify brand, performance, and retention for compounding growth.</h2>
            <p>
              Our integrated squads activate across paid media, lifecycle, creative, and data science to accelerate acquisition and deepen retention.
            </p>
          </header>
          <div class="service-grid">
            <article class="service-card">
              <h3>Paid Media</h3>
              <p>Audience-led search, social, and programmatic strategies engineered for efficiency and scale.</p>
              <ul>
                <li>Cross-channel media planning</li>
                <li>Creative performance labs</li>
                <li>Incrementality testing</li>
              </ul>
            </article>
            <article class="service-card">
              <h3>Lifecycle Marketing</h3>
              <p>Lifecycle orchestration that nurtures relationships and drives higher LTV.</p>
              <ul>
                <li>Email & SMS personalization</li>
                <li>On-site conversion rate optimization</li>
                <li>Loyalty and referral programs</li>
              </ul>
            </article>
            <article class="service-card">
              <h3>Creative Studio</h3>
              <p>Rapid concepting and production that fuses storytelling with performance insights.</p>
              <ul>
                <li>Concept development sprints</li>
                <li>UGC & influencer toolkits</li>
                <li>Full-funnel content systems</li>
              </ul>
            </article>
            <article class="service-card">
              <h3>Data & Intelligence</h3>
              <p>From measurement frameworks to predictive analytics, we translate signals into strategy.</p>
              <ul>
                <li>Attribution model design</li>
                <li>Media mix & scenario modeling</li>
                <li>BI dashboards and training</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section class="case-studies" id="case-studies">
        <div class="container">
          <header class="section-header">
            <span class="eyebrow">Proof in action</span>
            <h2>Recent growth stories.</h2>
          </header>
          <div class="case-grid">
            <article class="case-card">
              <p class="case-category">Ecommerce</p>
              <h3>Vuori</h3>
              <p class="case-summary">Scaled omnichannel media mix to grow revenue 4.2x in 12 months.</p>
              <a href="<?php echo esc_url( home_url( '/case-study/' ) ); ?>" class="case-link">Read case study</a>
            </article>
            <article class="case-card">
              <p class="case-category">Consumer services</p>
              <h3>Lyra Health</h3>
              <p class="case-summary">Activated lifecycle program to increase demo-to-close by 36%.</p>
              <a href="<?php echo esc_url( home_url( '/lyra-health-case-study/' ) ); ?>" class="case-link">Read case study</a>
            </article>
            <article class="case-card">
              <p class="case-category">Food & beverage</p>
              <h3>La Colombe</h3>
              <p class="case-summary">Full funnel creative refresh doubled subscription conversion.</p>
              <a href="#" class="case-link">Read case study</a>
            </article>
          </div>
        </div>
      </section>

      <section class="insights" id="insights">
        <div class="container insights-layout">
          <div class="insights-content">
            <span class="eyebrow">Insights & Strategy</span>
            <h2>Fuel your roadmap with actionable intelligence.</h2>
            <p>
              Proprietary research, forecasting, and testing protocols keep your growth engines tuned for what's next in the market.
            </p>
            <ul class="insight-list">
              <li>Consumer pulse reports across 14 verticals</li>
              <li>Quarterly growth planning workshops</li>
              <li>Retention benchmarking by lifecycle stage</li>
            </ul>
          </div>
          <div class="insights-panel" role="presentation">
            <div class="panel-header">
              <h3>Audience Signal</h3>
              <span class="badge badge-positive">Live</span>
            </div>
            <p class="panel-description">Top emerging opportunities by audience cohort.</p>
            <ul class="panel-list">
              <li>
                <span>Gen Z wellness explorers</span>
                <span class="trend-up">+27%</span>
              </li>
              <li>
                <span>Premium home chefs</span>
                <span class="trend-up">+19%</span>
              </li>
              <li>
                <span>Hybrid athletes</span>
                <span class="trend-flat">+5%</span>
              </li>
              <li>
                <span>Conscious travelers</span>
                <span class="trend-down">-3%</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="testimonial">
        <div class="container testimonial-layout">
          <div>
            <span class="eyebrow">Client voice</span>
            <h2>“PowerDigital built the roadmap that took us from a scrappy DTC brand to a category leader.”</h2>
            <p class="testimonial-author">— Melissa Chen, VP Growth, Vuori</p>
          </div>
          <div class="testimonial-card">
            <p class="testimonial-metric">+142%</p>
            <p class="testimonial-caption">Year-over-year revenue growth</p>
          </div>
        </div>
      </section>

      <section class="cta" id="contact">
        <div class="container cta-layout">
          <div>
            <span class="eyebrow">Let's build what's next</span>
            <h2>Tell us about your growth goals.</h2>
            <p>Share your challenges and we'll assemble the right team to unlock your next performance chapter.</p>
          </div>
          <form class="cta-form" aria-label="Consultation request form">
            <label>
              <span>Full name</span>
              <input type="text" name="name" placeholder="Alex Johnson" required />
            </label>
            <label>
              <span>Work email</span>
              <input type="email" name="email" placeholder="alex@brand.com" required />
            </label>
            <label>
              <span>Monthly media budget</span>
              <select name="budget" required>
                <option value="" disabled selected>Select an option</option>
                <option value="under50">Under $50K</option>
                <option value="50-150">$50K - $150K</option>
                <option value="150-300">$150K - $300K</option>
                <option value="300+">$300K+</option>
              </select>
            </label>
            <label>
              <span>Primary goal</span>
              <textarea name="goal" rows="3" placeholder="Share what success looks like"></textarea>
            </label>
            <button type="submit" class="cta-button">Submit request</button>
            <p class="form-disclaimer">By submitting this form you agree to our privacy policy.</p>
          </form>
        </div>
      </section>
<?php
get_footer();
?>
