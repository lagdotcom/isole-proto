/* eslint-env node */

const path = require('path');

module.exports = env => ({
	entry: './src/main',
	plugins: [],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'main.js',
	},
	mode: env.production ? 'production' : 'development',
	devtool: env.production ? 'source-map' : 'eval',
	devServer: {
		static: { directory: path.join(__dirname, 'dist') },
		compress: true,
		open: true,
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.(png|wav)$/,
				loader: 'file-loader',
				options: { name: '[name].[ext]' },
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{ test: /\.tsx?$/, loader: 'ts-loader' },
		],
	},
});
