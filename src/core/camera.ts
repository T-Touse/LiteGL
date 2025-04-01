import { Matrix4 } from "./Matrix";
import { Vector3 } from "./Vector";

export class Camera {
	#position = new Vector3(0, 0, 5)
	#rotation = new Vector3(0, 0, 5)
	get position(){return this.#position}
	get rotation(){return this.#rotation}

	public fov:number = 60;
	public aspect:number = 1;
	public near:number = .1;
	public far:number = 1000;

	#projectionMatrix:Matrix4
	#viewMatrix:Matrix4 = Matrix4.identity();
	get viewMatrix():Matrix4{return this.#viewMatrix}
	get projectionMatrix():Matrix4{return this.#projectionMatrix}
	constructor(fov = 60, aspect = 1, near = 0.1, far = 1000) {

		this.fov = fov;
		this.aspect = aspect;
		this.near = near;
		this.far = far;

		this.#projectionMatrix = Matrix4.perspective(fov, aspect, near, far);
	}

	update() {
		this.#projectionMatrix = Matrix4.perspective(this.fov, this.aspect, 
			this.near, this.far);
		// 📌 Matrice de vue (position + rotation)
		let view = Matrix4.identity();
		view = Matrix4.translate(-this.position.x, -this.position.y, -this.position.z, view);
		//view = Matrix4.rotate(this.rotation.x, 1, 0, 0, view);
		//view = Matrix4.rotate(this.rotation.y, 0, 1, 0, view);
		//view = Matrix4.rotate(this.rotation.z, 0, 0, 1, view);

		this.#viewMatrix = view;
	}

	move(x, y, z) {
		this.position.x += x;
		this.position.y += y;
		this.position.z += z;
		this.update();
	}

	rotate(x, y, z) {
		this.rotation.x += x;
		this.rotation.y += y;
		this.rotation.z += z;
		this.update();
	}
}
