/**
 * Fire an event
 * @param {HTMLElement} element event context
 * @param {string} type event name
 * @param {any} detail event details
 */
export default function dispatchEvent(element, type, detail = {}) {
	element.dispatchEvent(new CustomEvent(type, { detail }));
}
