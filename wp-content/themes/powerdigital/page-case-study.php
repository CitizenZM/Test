<?php
/**
 * Template Name: Case Study Overview
 */

get_header();
?>
<section class="case-hero">
        <div class="container case-hero__layout">
          <div class="case-hero__copy">
            <span class="eyebrow">Beauty &amp; Wellness</span>
            <h1>Lumen Skincare multiplies retention with full-funnel lifecycle marketing.</h1>
            <p>
              Within six months we rebuilt the lifecycle engine, unified performance media, and
              launched owned-channel experiments that doubled returning customer revenue.
            </p>
            <dl class="case-hero__metrics" aria-label="Engagement outcomes">
              <div>
                <dt>+142%</dt>
                <dd>Email-driven revenue</dd>
              </div>
              <div>
                <dt>38%</dt>
                <dd>Increase in repeat purchase rate</dd>
              </div>
              <div>
                <dt>4.8</dt>
                <dd>Average post-purchase CX score</dd>
              </div>
            </dl>
            <div class="case-hero__cta">
              <a class="ghost-button" href="#summary">Jump to summary</a>
              <a class="cta-button" href="<?php echo esc_url( home_url( '/#contact' ) ); ?>">Request growth audit</a>
            </div>
          </div>
          <aside class="case-hero__sidebar" aria-label="Engagement overview">
            <div class="case-hero__card">
              <h2>Engagement snapshot</h2>
              <dl>
                <div>
                  <dt>Industry</dt>
                  <dd>Premium skincare</dd>
                </div>
                <div>
                  <dt>Services</dt>
                  <dd>Lifecycle strategy, paid social, analytics, CRO</dd>
                </div>
                <div>
                  <dt>Timeline</dt>
                  <dd>Q2 - Q4 2023</dd>
                </div>
                <div>
                  <dt>Primary KPIs</dt>
                  <dd>Retention revenue, LTV, CAC efficiency</dd>
                </div>
              </dl>
              <div class="case-hero__tags" aria-label="Technology stack">
                <span>Klaviyo</span>
                <span>Shopify Plus</span>
                <span>Triple Whale</span>
                <span>Northbeam</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="summary" class="case-summary" aria-labelledby="case-summary-heading">
        <div class="container case-summary__layout">
          <div>
            <h2 id="case-summary-heading">The mandate</h2>
            <p>
              Lumen Skincare partnered with PowerDigital to reverse a flattening growth curve and
              re-engage high-value customers. The brand needed a modern retention framework and
              stronger acquisition efficiency to support international expansion.
            </p>
          </div>
          <div class="case-summary__grid">
            <article>
              <h3>Challenge</h3>
              <p>
                Growth stalled as paid channels saturated. Legacy automations failed to nurture loyal
                customers and first-party data sat disconnected across platforms.
              </p>
            </article>
            <article>
              <h3>Approach</h3>
              <p>
                We re-platformed lifecycle journeys, introduced predictive segments, and aligned paid
                media with real-time retention signals. CRO sprints aligned landing pages with updated
                value props.
              </p>
            </article>
            <article>
              <h3>Impact</h3>
              <p>
                A resilient growth loop: owned channels now drive the majority of incremental revenue
                while paid acquisition scales efficiently through audience recycling.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="case-insights" aria-labelledby="case-insights-heading">
        <div class="container">
          <div class="section-heading">
            <h2 id="case-insights-heading">Strategic pillars</h2>
            <p>Four parallel workstreams anchored the growth plan.</p>
          </div>
          <div class="insight-grid">
            <article>
              <span class="eyebrow">01 Lifecycle</span>
              <h3>Predictive nurture engine</h3>
              <p>
                Rebuilt all automations across onboarding, replenishment, and winback. Leveraged
                behavior-based branching to meet subscribers with bespoke product education moments.
              </p>
              <ul>
                <li>Dynamic replenishment cadences tied to skin goals</li>
                <li>Creative testing matrix with 35+ variations</li>
                <li>Integrated CX survey data into messaging logic</li>
              </ul>
            </article>
            <article>
              <span class="eyebrow">02 Media</span>
              <h3>Full-funnel paid alignment</h3>
              <p>
                Built integrated campaigns across Meta, TikTok, and YouTube leveraging lifecycle
                segments for prospecting and retargeting efficiency.
              </p>
              <ul>
                <li>Introduced creator-driven prospecting assets</li>
                <li>Dynamic product feeds linked to LTV cohorts</li>
                <li>Scaled evergreen UGC for mid-funnel nurture</li>
              </ul>
            </article>
            <article>
              <span class="eyebrow">03 Analytics</span>
              <h3>Northbeam decision layer</h3>
              <p>
                Consolidated disparate data sources into a weekly growth operating system measuring
                contribution margin and creative velocity.
              </p>
              <ul>
                <li>Multi-touch attribution dashboards</li>
                <li>Forecasting models for retention cohorts</li>
                <li>Bi-weekly experiment readouts</li>
              </ul>
            </article>
            <article>
              <span class="eyebrow">04 Experience</span>
              <h3>Testing &amp; optimization</h3>
              <p>
                Ran rapid experiments on landing experiences, packaging bundles aligned to skin types,
                and loyalty messaging to improve conversion velocity.
              </p>
              <ul>
                <li>11% lift in hero landing conversion</li>
                <li>Personalized quiz funnel for routine building</li>
                <li>Post-purchase onboarding redesign</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section class="case-visual" aria-label="Lifecycle journey visualization">
        <div class="container case-visual__layout">
          <div class="case-visual__copy">
            <h2>Lifecycle operating system</h2>
            <p>
              A modular journey architecture orchestrates campaigns based on lifecycle stages and
              purchase intent, ensuring each interaction advances the customer towards loyalty.
            </p>
            <ol>
              <li>Capture &amp; profile new subscribers through dynamic quizzes.</li>
              <li>Educate prospects with tailored regimens based on key skin goals.</li>
              <li>Enable loyalists to amplify advocacy via referral and review loops.</li>
            </ol>
          </div>
          <div class="case-visual__canvas" role="presentation">
            <div class="journey-map">
              <div class="journey-track">
                <span>Discover</span>
                <span>Consider</span>
                <span>Convert</span>
                <span>Delight</span>
              </div>
              <div class="journey-node">
                <span class="node-dot"></span>
                <p>Meta prospecting &amp; TikTok Spark ads</p>
              </div>
              <div class="journey-node">
                <span class="node-dot"></span>
                <p>Quiz capture with predictive routines</p>
              </div>
              <div class="journey-node">
                <span class="node-dot"></span>
                <p>Lifecycle automations with dynamic bundles</p>
              </div>
              <div class="journey-node">
                <span class="node-dot"></span>
                <p>Loyalty accelerators &amp; referral prompts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="case-results" aria-labelledby="case-results-heading">
        <div class="container">
          <div class="section-heading">
            <h2 id="case-results-heading">Measured outcomes</h2>
            <p>A sample of the growth impact across the engagement.</p>
          </div>
          <div class="results-grid">
            <article>
              <h3>Retention revenue</h3>
              <p class="result-value">+142%</p>
              <p class="result-caption">Lifecycle revenue in six months</p>
            </article>
            <article>
              <h3>Acquisition efficiency</h3>
              <p class="result-value">-24%</p>
              <p class="result-caption">Reduction in blended CAC</p>
            </article>
            <article>
              <h3>Customer lifetime value</h3>
              <p class="result-value">+31%</p>
              <p class="result-caption">Incremental LTV growth YoY</p>
            </article>
            <article>
              <h3>Conversion rate</h3>
              <p class="result-value">+11%</p>
              <p class="result-caption">Lift from CRO sprints</p>
            </article>
          </div>
        </div>
      </section>

      <section class="case-timeline" aria-labelledby="case-timeline-heading">
        <div class="container">
          <div class="section-heading">
            <h2 id="case-timeline-heading">Engagement timeline</h2>
            <p>Milestones that unlocked sustainable growth momentum.</p>
          </div>
          <div class="timeline-grid">
            <article>
              <span class="eyebrow">Month 1</span>
              <h3>Insights sprint</h3>
              <p>Audited lifecycle programs, creative performance, and data infrastructure.</p>
            </article>
            <article>
              <span class="eyebrow">Month 2-3</span>
              <h3>Lifecycle relaunch</h3>
              <p>Shipped new onboarding, replenishment, and loyalty journeys with creative testing.</p>
            </article>
            <article>
              <span class="eyebrow">Month 4-5</span>
              <h3>Paid media integration</h3>
              <p>Sync'd prospecting and retention audiences with first-party data refresh triggers.</p>
            </article>
            <article>
              <span class="eyebrow">Month 6+</span>
              <h3>Optimization loop</h3>
              <p>Established experimentation cadence across creative, offers, and onsite experience.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="case-testimonial" aria-labelledby="case-testimonial-heading">
        <div class="container case-testimonial__layout">
          <div>
            <p class="eyebrow">Client testimonial</p>
            <h2 id="case-testimonial-heading">"We finally have a growth partner who connects every signal."</h2>
          </div>
          <blockquote>
            <p>
              "PowerDigital orchestrated every lever from creative to retention analytics. Within weeks
              we saw our returning customer rate climb and by quarter end our board recognized the most
              profitable growth in company history."
            </p>
            <footer>
              <cite>Amelia Chen</cite>
              <span>VP of Growth, Lumen Skincare</span>
            </footer>
          </blockquote>
        </div>
      </section>

      <section class="case-cta" aria-labelledby="case-cta-heading">
        <div class="container case-cta__layout">
          <div>
            <h2 id="case-cta-heading">Ready to build your growth operating system?</h2>
            <p>
              Partner with the PowerDigital team to orchestrate lifecycle, media, and analytics into a
              single growth engine tuned to your brand's goals.
            </p>
          </div>
          <a class="cta-button" href="<?php echo esc_url( home_url( '/#contact' ) ); ?>">Book a strategy session</a>
        </div>
      </section>
<?php
get_footer();
?>
