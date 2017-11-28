const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const {
  appContainerId,
  outputDir,
  outputHTMLFileName,
} = require('./build/buildConstants');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: [
      'react',
      ['@babel/preset-env', {
        targets: {
          browsers: ['last 1 Chrome version'],
        },
        modules: false,
        debug: true,
      }],
    ],
    plugins: [
      '@babel/plugin-proposal-object-rest-spread',
    ],
  },
};

const typescriptPipeline = [
  babelLoader,
  {loader: 'ts-loader'},
];

export default function() {
  return {
    entry: './src/index',

    devtool: 'source-map',

    output: {
      path: path.resolve(outputDir),
      filename: '[name].js',
      chunkFilename: '[name].js',
      pathinfo: true,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: typescriptPipeline,
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[local]---[path][name]',
              },
            },
          ],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/dev.ejs',
        appContainerId,
        filename: outputHTMLFileName,
      }),

      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
    ],

    devServer: {
      hot: true,
      inline: true,
    },
  };
}
