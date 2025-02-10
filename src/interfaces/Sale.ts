interface SalesByMonthResult {
	SaleYear: number;
	SaleMonth: number;
	NumberOfInvoices: number;
	TotalSales: Float32Array;
	NetSales: Float32Array;
}

class SalesDocument {
	id: string;
	dataTableResult: SalesByMonthResult;

	constructor(dataTableResult: SalesByMonthResult) {
		this.dataTableResult = dataTableResult;
		this.id = this.generateId(dataTableResult.SaleMonth, dataTableResult.SaleYear);
	}

	private generateId(month: number, year: number) {
		const monthStr = month.toString().padStart(2, '0');
		const yearStr = year.toString().slice(-2);
		return monthStr + yearStr;
	}
}

export { SalesByMonthResult, SalesDocument };
