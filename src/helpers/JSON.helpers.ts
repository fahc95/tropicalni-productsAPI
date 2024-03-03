import * as fs from "fs";

export async function readJSONFile(filePath:string) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err:any, data:any) => {
			if (err) reject(err);
			else resolve(JSON.parse(data));
		});
	});
}
