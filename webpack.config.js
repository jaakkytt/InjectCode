const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ROBOTO_PKG_DIR = path.dirname(require.resolve('@fontsource/roboto/package.json'));


module.exports = {
    entry: {
        popup: "./src/popup/index.tsx",
        options: "./src/options/index.tsx",
        background: "./src/background.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        clean: true,
    },
    devtool: 'source-map',
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    snapshot: {
        immutablePaths: [ROBOTO_PKG_DIR],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff2?|eot|ttf|otf)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name].[contenthash][ext][query]'
                }
            }
        ]
    },
    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename],
            defaultWebpack: [path.resolve(__dirname, 'package.json')],
        },
    },
    optimization: {
        runtimeChunk: 'single',
        minimize: false,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                react: {
                    test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                    name: 'vendor-react',
                    enforce: true,
                    priority: 30
                },
                mui: {
                    test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
                    name: 'vendor-mui',
                    enforce: true,
                    priority: 20
                },
                vendor:{
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    enforce: true,
                    priority: 10,
                    reuseExistingChunk: true
                },
            },
        },
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                from: "public",
                to: ".",
                globOptions: { ignore: ["**/popup.html", "**/options.html"] }
            }],
        }),
        new HtmlWebpackPlugin({
            template: "public/popup.html",
            filename: "popup.html",
            chunks: ["vendor", "popup"]
        }),
        new HtmlWebpackPlugin({
            template: "public/options.html",
            filename: "options.html",
            chunks: ["vendor", "options"]
        })
    ]
};
