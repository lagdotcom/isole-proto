/**
 * Make an HTML element
 * @param {HTMLElement} parent parent element
 * @param {string} tag tag name
 * @param {unknown} attributes attributes
 * @param {ListenerMap} events event handlers
 */
export default function makeElement(
	parent: HTMLElement = document.body,
	tag = 'div',
	attributes: unknown = {},
	events: Record<string, EventListener> = {}
) {
	let element = document.createElement(tag);

	element = Object.assign(element, attributes);
	for (const key in events) element.addEventListener(key, events[key]);

	parent.appendChild(element);

	return element;
}
