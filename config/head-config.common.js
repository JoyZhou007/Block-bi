/**
 * Configuration for head elements added during the creation of index.html.
 *
 * All href attributes are added the publicPath (if exists) by default.
 * You can explicitly hint to prefix a publicPath by setting a boolean value to a key that has
 * the same name as the attribute you want to operate on, but prefix with =
 *
 * Example:
 * { name: 'msapplication-TileImage', content: '/assets/icon/ms-icon-144x144.png', '=content': true },
 * Will prefix the publicPath to content.
 *
 * { rel: 'apple-touch-icon', sizes: '57x57', href: '/assets/icon/apple-icon-57x57.png', '=href': false },
 * Will not prefix the publicPath on href (href attributes are added by default
 *
 */
module.exports = {
  link: [
    { rel: 'stylesheet', href: '/assets/css/main.css' },
    { rel: 'stylesheet', href: '/assets/css/out/animate.css' },
    { rel: 'stylesheet', href: '/assets/introjs.min.css' },
    { rel: 'stylesheet', href: '/assets/css/chat/quill-bubble.css' },

    /** <link> tags for favicons **/
    { rel: 'icon', type: 'image/x-icon', sizes: '16x16', href: '/assets/icon/favicon16.ico' },
    { rel: 'icon', type: 'image/x-icon', sizes: '32x32', href: '/assets/icon/favicon32.ico' },
    { rel: 'icon', type: 'image/x-icon', sizes: '96x96', href: '/assets/icon/favicon96.ico' }

    /** <link> tags for a Web App Manifest **/
    // { rel: 'manifest', href: '/assets/manifest.json' }
  ],
  meta: [
    { name: 'msapplication-TileColor', content: '#00bcd4' },
    { name: 'msapplication-TileImage', content: '/assets/icon/ms-icon-144x144.png', '=content': true },
    { name: 'theme-color', content: '#00bcd4' }
  ]
};
