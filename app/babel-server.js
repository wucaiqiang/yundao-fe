require('babel-register')({
    presets: ['es2015','stage-2', 'react'],
    plugins:['transform-function-bind']
});

// Css required hook
require('css-modules-require-hook')({
    extensions: ['.scss'],
    preprocessCss: (data, filename) =>
        require('node-sass').renderSync({
            data,
            file: filename
        }).css,
    camelCase: true,
    generateScopedName: '[name]__[local]___[hash:base64:5]'
})

require('./server');
