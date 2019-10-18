const path = require('path');

module.exports = {
	entry: './src/main',
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		open: true,
	},
	devtool: 'source-map',
	resolve: {
		extensions: ['.ts', '.js'],
		modules: ['src', 'node_modules'],
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
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
			},
			{
				enforce: 'pre',
				test: /\.js$/,
				loader: 'source-map-loader',
			},
		],
	},
};
