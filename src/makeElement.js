/**
 * Make an HTML element
 * @param {HTMLElement} parent parent element
 * @param {string} tag tag name
 * @param {any} attributes attributes
 * @param {ListenerMap} events event handlers
 */
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
