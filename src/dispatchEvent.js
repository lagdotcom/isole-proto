export default function dispatchEvent(element, type, detail = {}) {
	element.dispatchEvent(new CustomEvent(type, { detail }));
}
