import { Product } from "../interfaces/Product";

 export function findStringWithKey(array:Array<string>, key:string): string | null {
	return array.find(item => item.includes(key)) || null;
}

// Function to find products with duplicate codes
export const findDuplicatesByCode = (items: Product[], key: keyof Product) => {
	// Step 1: Count occurrences of each code
	const occurrences: Record<string, number> = {};
	items.forEach((item) => {
	  const code = item[key];
	  occurrences[code!] = (occurrences[code!] || 0) + 1;
	});
  
	// Step 2: Filter products that have duplicate codes
	return items.filter((item) => occurrences[item[key]!] > 1);
  };
