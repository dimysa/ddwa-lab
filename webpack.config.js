const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: {
        index: ['babel-polyfill', './js/index.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: '[name]'
    },
    watch: true,
    devtool: 'source-map',    
    plugins: [
        //new webpack.HotModuleReplacementPlugin(),
        new webpack.LoaderOptionsPlugin({
            options: {
                worker: {
                    output: {
                        output: "hash.worker.js",
                        chunkFilename: "[id].hash.worker.js"
                    }
                }
            }
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            moment: 'moment'
        }),
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            hash: true,
            minify: {
                html5: true
            },
            template: './html/index.html',

        }),
        new HtmlWebpackPlugin({
            hash: true,
            minify: {
                html5: true
            },
            filename: 'create.html',
            template: './html/create.html',             
        }),
        new HtmlWebpackPlugin({
            hash: true,
            minify: {
                html5: true
            },
            template: './html/edit.html',
            filename: 'edit.html'
        }),
        new HtmlWebpackPlugin({
            hash: true,
            minify: {
                html5: true
            },
            template: './html/info.html',
            filename: 'info.html'
        })
    ],
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    plugins: [
                        'syntax-async-functions',
                        'transform-async-to-generator',
                        'transform-regenerator',
                        'transform-runtime'
                    ],
                    presets: ['es2015']
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader?importLoaders=1&sourceMap',
                    'postcss-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader?name=[path][name].[ext]'
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        compress: false,
        port: 9000,
        historyApiFallback: true,
        hot: false,
        host: '127.0.0.1'
    }
};