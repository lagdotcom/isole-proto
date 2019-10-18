/**
 * Fire an event
 * @param {HTMLElement} element event context
 * @param {string} type event name
 * @param {any} detail event details
 */
export default function dispatchEvent(
	element: HTMLElement,
	type: string,
	detail: any = {}
): void {
	element.dispatchEvent(new CustomEvent(type, { detail }));
}
