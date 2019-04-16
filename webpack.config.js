module.exports = {
    entry: './bundle/index.js',
    target: 'node',
    output: {
        filename: 'index.js',
        library: 'handler',
        libraryTarget: 'commonjs',
        libraryExport: 'handler',
    },
};
