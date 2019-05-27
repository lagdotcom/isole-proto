export default function clearChildren(el) {
	for (var i = el.children.length - 1; i >= 0; i--) el.children[i].remove();
}
