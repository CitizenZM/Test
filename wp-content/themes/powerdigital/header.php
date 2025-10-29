<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<header class="site-header">
    <div class="container header-content">
        <a class="logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">PowerDigital</a>
        <nav class="primary-nav" aria-label="<?php esc_attr_e( 'Main navigation', 'powerdigital' ); ?>">
            <button class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="nav-menu">
                <span class="sr-only"><?php esc_html_e( 'Toggle navigation', 'powerdigital' ); ?></span>
                <span class="nav-toggle-bar"></span>
                <span class="nav-toggle-bar"></span>
                <span class="nav-toggle-bar"></span>
            </button>
            <?php
            wp_nav_menu(
                array(
                    'theme_location' => 'primary',
                    'menu_id'        => 'nav-menu',
                    'menu_class'     => 'nav-menu',
                    'container'      => false,
                    'items_wrap'     => '<ul id="%1$s" class="%2$s" data-open="false">%3$s</ul>',
                    'fallback_cb'    => function () {
                        echo '<ul id="nav-menu" class="nav-menu" data-open="false">';
                        echo '<li><a href="' . esc_url( home_url( '/#solutions' ) ) . '">' . esc_html__( 'Solutions', 'powerdigital' ) . '</a></li>';
                        echo '<li><a href="' . esc_url( home_url( '/#services' ) ) . '">' . esc_html__( 'Services', 'powerdigital' ) . '</a></li>';
                        echo '<li><a href="' . esc_url( home_url( '/#case-studies' ) ) . '">' . esc_html__( 'Case Studies', 'powerdigital' ) . '</a></li>';
                        echo '<li><a href="' . esc_url( home_url( '/#insights' ) ) . '">' . esc_html__( 'Insights', 'powerdigital' ) . '</a></li>';
                        echo '<li><a href="' . esc_url( home_url( '/#about' ) ) . '">' . esc_html__( 'About', 'powerdigital' ) . '</a></li>';
                        echo '</ul>';
                    },
                )
            );
            ?>
        </nav>
        <a class="cta-button" href="<?php echo esc_url( home_url( '/#contact' ) ); ?>"><?php esc_html_e( "Let's Talk", 'powerdigital' ); ?></a>
    </div>
</header>
<main>
