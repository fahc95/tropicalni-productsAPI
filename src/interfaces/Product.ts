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
