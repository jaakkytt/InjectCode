const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
                    filename: 'fonts/[name][ext][query]'
                }
            }
        ]
    },
    optimization: {
        minimize: false,
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all",
                    enforce: true,
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
