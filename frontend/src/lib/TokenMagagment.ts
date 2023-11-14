export function storeToken(jwt: string, ls: Storage) {
	const tParts = jwt.split('.');
	const encoded = tParts[1];
	const payload = JSON.parse(atob(encoded));
	localStorage.setItem('token', jwt);
	localStorage.setItem('tokenExp', Math.floor(payload.exp * 1000).toString());
}
export function clearToken(ls: Storage) {
	localStorage.removeItem('token',);
	localStorage.removeItem('tokenExp',);
}
export function getToken() {
	const token = localStorage.getItem('token')
	if (!token)
		throw new Error('No Token Available', { cause: 'localStorage token value not found' });
	return token;
}