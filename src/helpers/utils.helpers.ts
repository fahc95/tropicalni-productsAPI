 export function findStringWithKey(array:Array<string>, key:string): string | null {
	return array.find(item => item.includes(key)) || null;
}

