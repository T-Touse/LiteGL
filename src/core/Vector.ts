export class Vector {
	#x: number;
	#y: number;
	#z: number;

	get x(): number { return this.#x; }
	get y(): number { return this.#y; }
	get z(): number { return this.#z; }

	constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.#x = x || 0;
		this.#y = y || 0;
		this.#z = z || 0;
	}

	negative(): Vector {
		return new Vector(-this.#x, -this.#y, -this.#z);
	}

	add(v: number | Vector = 0): Vector {
		if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
		else return new Vector(this.x + v, this.y + v, this.z + v);
	}

	subtract(v: number | Vector = 0): Vector {
		if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
		else return new Vector(this.x - v, this.y - v, this.z - v);
	}

	multiply(v: number | Vector = 1): Vector {
		if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
		else return new Vector(this.x * v, this.y * v, this.z * v);
	}

	divide(v: number | Vector = 1): Vector {
		if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
		else return new Vector(this.x / v, this.y / v, this.z / v);
	}

	equals(v: Vector): boolean {
		return this.x === v.x && this.y === v.y && this.z === v.z;
	}

	dot(v: Vector): number {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	cross(v: Vector): Vector {
		return new Vector(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	}

	length(): number {
		return Math.sqrt(this.dot(this));
	}

	unit(): Vector {
		const len = this.length();
		return this.divide(len);
	}

	min(): number {
		return Math.min(this.x, this.y, this.z);
	}

	max(): number {
		return Math.max(this.x, this.y, this.z);
	}

	toAngles(): { theta: number, phi: number } {
		return {
			theta: Math.atan2(this.z, this.x),
			phi: Math.asin(this.y / this.length())
		};
	}

	angleTo(a: Vector): number {
		return Math.acos(this.dot(a) / (this.length() * a.length()));
	}

	toArray(n: number = 3): number[] {
		return [this.x, this.y, this.z].slice(0, n);
	}

	clone(): Vector {
		return new Vector(this.x, this.y, this.z);
	}

	static fromAngles(theta: number, phi: number): Vector {
		return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
	}

	static randomDirection(): Vector {
		return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
	}

	static min(a: Vector, b: Vector): Vector {
		return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
	}

	static max(a: Vector, b: Vector): Vector {
		return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
	}

	static lerp(a: Vector, b: Vector, fraction: number): Vector {
		return b.subtract(a).multiply(fraction).add(a);
	}

	static fromArray(a: number[]): Vector {
		return new Vector(a[0], a[1], a[2]);
	}

	static fromObject(a: Vector | Record<string, number>): Vector {
		return new Vector(a.x || 0, a.y || 0, a.z || 0);
	}

	static angleBetween(a: Vector, b: Vector): number {
		return a.angleTo(b);
	}
}