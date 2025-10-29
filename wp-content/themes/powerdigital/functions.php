<?php
/**
 * PowerDigital theme functions and definitions.
 */

if ( ! defined( 'POWERDIGITAL_VERSION' ) ) {
    define( 'POWERDIGITAL_VERSION', '1.0.0' );
}

add_action( 'after_setup_theme', function () {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );

    register_nav_menus(
        array(
            'primary' => __( 'Primary Menu', 'powerdigital' ),
            'footer'  => __( 'Footer Menu', 'powerdigital' ),
        )
    );
} );

add_action( 'wp_enqueue_scripts', function () {
    $theme_uri = get_template_directory_uri();

    wp_enqueue_style(
        'powerdigital-style',
        get_stylesheet_uri(),
        array(),
        POWERDIGITAL_VERSION
    );

    wp_enqueue_style(
        'powerdigital-main',
        $theme_uri . '/assets/css/main.css',
        array('powerdigital-style'),
        POWERDIGITAL_VERSION
    );

    wp_enqueue_script(
        'powerdigital-main',
        $theme_uri . '/assets/js/main.js',
        array(),
        POWERDIGITAL_VERSION,
        true
    );
} );
