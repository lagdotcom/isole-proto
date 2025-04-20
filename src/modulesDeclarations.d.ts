declare module '*.png' {
	const url: import('./flavours').UrlString;
	export default url;
}

declare module '*.wav' {
	const url: import('./flavours').UrlString;
	export default url;
}
