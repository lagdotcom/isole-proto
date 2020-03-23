/**
 * Remove all children of element
 * @param {HTMLElement} el
 */
export default function clearChildren(el: HTMLElement): void {
	for (var i = el.children.length - 1; i >= 0; i--) el.children[i].remove();
}
