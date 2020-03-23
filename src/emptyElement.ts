export default function emptyElement(el: HTMLElement) {
	while (el.childElementCount) el.removeChild(el.children[0]);
}
