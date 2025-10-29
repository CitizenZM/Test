# PowerDigital WordPress Theme

A custom WordPress theme inspired by the PowerDigital marketing and Lyra Health case study concepts provided in Figma. The theme delivers a fully linked landing experience, a Lumen Skincare case study overview, and a Lyra Health detail page.

## Theme structure

```
wp-content/
└── themes/
    └── powerdigital/
        ├── assets/
        │   ├── css/main.css
        │   └── js/main.js
        ├── front-page.php
        ├── functions.php
        ├── header.php
        ├── footer.php
        ├── index.php
        ├── page-case-study.php
        └── page-lyra-health-case-study.php
```

The landing page automatically renders via `front-page.php`. Visiting `/case-study/` and `/lyra-health-case-study/` loads the Lumen and Lyra templates, respectively.

## Local setup

1. [Download WordPress](https://wordpress.org/download/) and extract it into this repository root so the standard WordPress files live alongside the existing `wp-content` directory.
2. Create a database and configure WordPress using `wp-config.php` as usual.
3. From the WordPress admin, activate the **PowerDigital Experience** theme.
4. Create two pages:
   - **Case Study** with the slug `case-study`.
   - **Lyra Health Case Study** with the slug `lyra-health-case-study`.
5. Assign the front page under **Settings → Reading** to the landing page content you prefer, or leave it to automatically use the custom front page template.

The mobile navigation, consultation form toast, sticky sections, and animated elements are powered by the bundled `main.js` script and shared stylesheet.

## Development notes

- The theme registers primary and footer menus. Populate them from the WordPress admin for dynamic navigation, or rely on the built-in fallbacks.
- The footer year updates automatically on load.
- Styles include reduced-motion support, responsive layouts, and accessible focus states consistent with the Figma concept.
