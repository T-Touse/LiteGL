import { Object3D } from "./Object3D"

export class Mesh extends Object3D{
	#geometry
	get geometry(){return this.#geometry}
	#material
	get geomematerialtry(){return this.#material}
	constructor(geometry,material){
		super()
		this.#geometry = geometry
		this.#material = material
	}
}