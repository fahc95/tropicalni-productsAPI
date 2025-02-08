export interface Product {
	codigoDepartamento: number;
	codigoClase: number;
	codigoMarca: number;
	codigoProducto: string;
	existencia: number;
	nombreDepartamento: string;
	nombreMarca: string;
	nombreClase: string;
	nombreProducto: string;
	precioUSD1: number;
	precioUSD2: number;
	precioUSD3: number;
	precioUSD4: number;
	precioLocal1: number;
	precioLocal2: number;
	precioLocal3: number;
	precioLocal4: number;
	imageURL: string | null;
}

export interface ProductChangesResult {
	codigoProducto: string;
	precioLocal1_Last: number;
	precioLocal2_Last: number;
	precioLocal3_Last: number;
	precioLocal4_Last: number;
	precioUSD1_Last: number;
	precioUSD2_Last: number;
	precioUSD3_Last: number;
	precioUSD4_Last: number;
	existencia_Last: number;
}

export function mapProductChangesToProduct(product: ProductChangesResult): Partial<Product> {
	return {
		codigoProducto: product.codigoProducto,
		existencia: product.existencia_Last,
		precioUSD1: product.precioUSD1_Last,
		precioUSD2: product.precioUSD2_Last,
		precioUSD3: product.precioUSD3_Last,
		precioUSD4: product.precioUSD4_Last,
		precioLocal1: product.precioLocal1_Last,
		precioLocal2: product.precioLocal2_Last,
		precioLocal3: product.precioLocal3_Last,
		precioLocal4: product.precioLocal4_Last,
	};
}
