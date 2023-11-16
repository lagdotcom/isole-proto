/**
 * Fire an event
 * @param {HTMLElement} element event context
 * @param {string} type event name
 * @param {unknown} detail event details
 */
export default function dispatchEvent(
	element: HTMLElement,
	type: string,
	detail: unknown = {}
): void {
	element.dispatchEvent(new CustomEvent(type, { detail }));
}
