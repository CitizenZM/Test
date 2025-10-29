</main>
<footer class="site-footer" id="about">
    <div class="container footer-layout">
        <div>
            <a class="logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">PowerDigital</a>
            <p class="footer-description">
                <?php esc_html_e( 'A digital growth agency creating compounding impact for category-defining brands across the globe.', 'powerdigital' ); ?>
            </p>
        </div>
        <div class="footer-links">
            <div>
                <h3><?php esc_html_e( 'Services', 'powerdigital' ); ?></h3>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/#services' ) ); ?>"><?php esc_html_e( 'Paid Media', 'powerdigital' ); ?></a></li>
                    <li><a href="<?php echo esc_url( home_url( '/#services' ) ); ?>"><?php esc_html_e( 'Lifecycle Marketing', 'powerdigital' ); ?></a></li>
                    <li><a href="<?php echo esc_url( home_url( '/#services' ) ); ?>"><?php esc_html_e( 'Creative Studio', 'powerdigital' ); ?></a></li>
                    <li><a href="<?php echo esc_url( home_url( '/#services' ) ); ?>"><?php esc_html_e( 'Data & Intelligence', 'powerdigital' ); ?></a></li>
                </ul>
            </div>
            <div>
                <h3><?php esc_html_e( 'Company', 'powerdigital' ); ?></h3>
                <ul>
                    <li><a href="<?php echo esc_url( home_url( '/#about' ) ); ?>"><?php esc_html_e( 'About', 'powerdigital' ); ?></a></li>
                    <li><a href="<?php echo esc_url( home_url( '/#insights' ) ); ?>"><?php esc_html_e( 'Insights', 'powerdigital' ); ?></a></li>
                    <li><a href="<?php echo esc_url( home_url( '/#case-studies' ) ); ?>"><?php esc_html_e( 'Case studies', 'powerdigital' ); ?></a></li>
                    <li><a href="<?php echo esc_url( home_url( '/#contact' ) ); ?>"><?php esc_html_e( 'Contact', 'powerdigital' ); ?></a></li>
                </ul>
            </div>
            <div>
                <h3><?php esc_html_e( 'Connect', 'powerdigital' ); ?></h3>
                <ul>
                    <li><a href="mailto:hello@powerdigital.com">Email</a></li>
                    <li><a href="#">LinkedIn</a></li>
                    <li><a href="#">Instagram</a></li>
                    <li><a href="#">YouTube</a></li>
                </ul>
            </div>
        </div>
        <p class="footer-meta">&copy; <span data-footer-year></span> <?php esc_html_e( 'PowerDigital. All rights reserved.', 'powerdigital' ); ?></p>
    </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
