const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './bundle/index.js',
    target: 'node',
    optimization: {
        minimizer: [new TerserPlugin({
            terserOptions: {
                output: { comments: false },
            },
        })],
    },
    output: {
        filename: 'index.js',
        library: 'handler',
        libraryTarget: 'commonjs',
        libraryExport: 'handler',
    },
};
