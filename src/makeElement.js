export default function makeElement(
	parent = document.body,
	tag = 'div',
	attributes = {},
	events = {}
) {
	var element = document.createElement(tag);

	element = Object.assign(element, attributes);
	for (var key in events) element.addEventListener(key, events[key]);

	parent.appendChild(element);

	return element;
}
