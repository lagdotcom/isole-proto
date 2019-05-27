const path = require('path');

module.exports = {
	entry: './src/main.js',
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		open: true,
	},
	module: {
		rules: [
			{ test: /\.png$/, use: 'file-loader' },
			{
				test: /.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
};
