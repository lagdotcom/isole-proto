/**
 * Remove all children of element
 * @param {HTMLElement} el
 */
export default function clearChildren(el: HTMLElement): void {
	for (let i = el.children.length - 1; i >= 0; i--) el.children[i].remove();
}
