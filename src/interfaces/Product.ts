export interface Product {
	codigoDepartamento: number;
	codigoClase: number;
	codigoMarca: number;
	codigoProducto: string;
	existencia: number;
	nombreDepartamento: string;
	nombreClase: string;
	nombreProducto: string;
	precioUSD1: number;
	precioUSD2: number;
	precioLocal1: number;
	precioLocal2: number;
	imageURL: string | null;
}
