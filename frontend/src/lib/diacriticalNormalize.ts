export default function diacriticalNormalize(str: string): string {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}