export function extractFieldAndValue(detail: string) {
	const match = detail.match(/Key \((.*?)\)=\((.*?)\)/);

	if (!match) return null;

	return {
		field: match[1],
		value: match[2],
	};
}
