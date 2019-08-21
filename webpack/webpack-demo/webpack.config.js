const path = require('./node_modules/path');
const HtmlWebpackPlugin = require('./node_modules/html-webpack-plugin');
const CleanWebpackPlugin = require('./node_modules/clean-webpack-plugin');
const webpack = require('./node_modules/webpack');

module.exports = {
    entry: {
        app: './src/main.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: '/'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        hot: true
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            title: 'webpack-demo',
            filename: 'index.html',
            template: './index.html'
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 102400,
                            name: 'img/[name].[ext]',
                            publicPath: './'
                        }
                    }
                ]
            }
        ]
    }
};