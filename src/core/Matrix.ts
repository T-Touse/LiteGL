import { Vector3 } from "./Vector";

const hasFloat32Array = (typeof Float32Array != 'undefined');

export class Matrix4 {
	private m: Float32Array | number[];
	private static readonly SIZE: number = 16;

	constructor(values?: number[]) {
		if (values && values.length === Matrix4.SIZE) {
			this.m = hasFloat32Array ? new Float32Array(values) : values;
		} else {
			this.m = hasFloat32Array ? new Float32Array(Matrix4.SIZE) : new Array(Matrix4.SIZE).fill(0);
			Matrix4.identity(this);
		}
	}

	get(index: number): number {
		return this.m[index];
	}

	set(index: number, value: number): void {
		this.m[index] = value;
	}

	inverse(result?: Matrix4): Matrix4 {
		result = result || new Matrix4();
		return Matrix4.inverse(this, result);
	}

	transpose(result?: Matrix4): Matrix4 {
		result = result || new Matrix4();
		return Matrix4.transpose(this, result);
	}

	multiply(Matrix4, result) {
		return Matrix4.multiply(this, Matrix4, result);
	}

	transformPoint(point: Vector3): Vector3 {
		const m = this.m;
		const w = m[12] * point.x + m[13] * point.y + m[14] * point.z + m[15];
		return new Vector3(
			(m[0] * point.x + m[1] * point.y + m[2] * point.z + m[3]) / w,
			(m[4] * point.x + m[5] * point.y + m[6] * point.z + m[7]) / w,
			(m[8] * point.x + m[9] * point.y + m[10] * point.z + m[11]) / w
		);
	}

	transformVector3(vector: Vector3): Vector3 {
		const m = this.m;
		return new Vector3(
			m[0] * vector.x + m[1] * vector.y + m[2] * vector.z,
			m[4] * vector.x + m[5] * vector.y + m[6] * vector.z,
			m[8] * vector.x + m[9] * vector.y + m[10] * vector.z
		);
	}

	static inverse(Matrix4, result?) {
		result = result || new Matrix4();
		const m = Matrix4.m;
		const r = result.m;

		r[0] = m[5] * m[10] * m[15] - m[5] * m[14] * m[11] - m[6] * m[9] * m[15] + m[6] * m[13] * m[11] + m[7] * m[9] * m[14] - m[7] * m[13] * m[10];
		r[1] = -m[1] * m[10] * m[15] + m[1] * m[14] * m[11] + m[2] * m[9] * m[15] - m[2] * m[13] * m[11] - m[3] * m[9] * m[14] + m[3] * m[13] * m[10];
		r[2] = m[1] * m[6] * m[15] - m[1] * m[14] * m[7] - m[2] * m[5] * m[15] + m[2] * m[13] * m[7] + m[3] * m[5] * m[14] - m[3] * m[13] * m[6];
		r[3] = -m[1] * m[6] * m[11] + m[1] * m[10] * m[7] + m[2] * m[5] * m[11] - m[2] * m[9] * m[7] - m[3] * m[5] * m[10] + m[3] * m[9] * m[6];

		r[4] = -m[4] * m[10] * m[15] + m[4] * m[14] * m[11] + m[6] * m[8] * m[15] - m[6] * m[12] * m[11] - m[7] * m[8] * m[14] + m[7] * m[12] * m[10];
		r[5] = m[0] * m[10] * m[15] - m[0] * m[14] * m[11] - m[2] * m[8] * m[15] + m[2] * m[12] * m[11] + m[3] * m[8] * m[14] - m[3] * m[12] * m[10];
		r[6] = -m[0] * m[6] * m[15] + m[0] * m[14] * m[7] + m[2] * m[4] * m[15] - m[2] * m[12] * m[7] - m[3] * m[4] * m[14] + m[3] * m[12] * m[6];
		r[7] = m[0] * m[6] * m[11] - m[0] * m[10] * m[7] - m[2] * m[4] * m[11] + m[2] * m[8] * m[7] + m[3] * m[4] * m[10] - m[3] * m[8] * m[6];

		r[8] = m[4] * m[9] * m[15] - m[4] * m[13] * m[11] - m[5] * m[8] * m[15] + m[5] * m[12] * m[11] + m[7] * m[8] * m[13] - m[7] * m[12] * m[9];
		r[9] = -m[0] * m[9] * m[15] + m[0] * m[13] * m[11] + m[1] * m[8] * m[15] - m[1] * m[12] * m[11] - m[3] * m[8] * m[13] + m[3] * m[12] * m[9];
		r[10] = m[0] * m[5] * m[15] - m[0] * m[13] * m[7] - m[1] * m[4] * m[15] + m[1] * m[12] * m[7] + m[3] * m[4] * m[13] - m[3] * m[12] * m[5];
		r[11] = -m[0] * m[5] * m[11] + m[0] * m[9] * m[7] + m[1] * m[4] * m[11] - m[1] * m[8] * m[7] - m[3] * m[4] * m[9] + m[3] * m[8] * m[5];

		r[12] = -m[4] * m[9] * m[14] + m[4] * m[13] * m[10] + m[5] * m[8] * m[14] - m[5] * m[12] * m[10] - m[6] * m[8] * m[13] + m[6] * m[12] * m[9];
		r[13] = m[0] * m[9] * m[14] - m[0] * m[13] * m[10] - m[1] * m[8] * m[14] + m[1] * m[12] * m[10] + m[2] * m[8] * m[13] - m[2] * m[12] * m[9];
		r[14] = -m[0] * m[5] * m[14] + m[0] * m[13] * m[6] + m[1] * m[4] * m[14] - m[1] * m[12] * m[6] - m[2] * m[4] * m[13] + m[2] * m[12] * m[5];
		r[15] = m[0] * m[5] * m[10] - m[0] * m[9] * m[6] - m[1] * m[4] * m[10] + m[1] * m[8] * m[6] + m[2] * m[4] * m[9] - m[2] * m[8] * m[5];

		const det = m[0] * r[0] + m[1] * r[4] + m[2] * r[8] + m[3] * r[12];
		if (det === 0) {
			throw new Error("Matrix4 is not invertible");
		}
		for (let i = 0; i < Matrix4.SIZE; i++) {
			r[i] /= det;
		}
		return result;
	}

	static transpose(Matrix4, result?) {
		result = result || new Matrix4();
		var m = Matrix4.m, r = result.m;
		r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
		r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
		r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
		r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];
		return result;
	};

	static multiply(left, right, result?) {
		result = result || new Matrix4();
		var a = left.m, b = right.m, r = result.m;

		r[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
		r[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
		r[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
		r[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

		r[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
		r[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
		r[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
		r[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

		r[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
		r[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
		r[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
		r[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

		r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
		r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
		r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
		r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];

		return result;
	};

	static identity(result?) {
		result = result || new Matrix4();
		var m = result.m;
		m[0] = m[5] = m[10] = m[15] = 1;
		m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
		return result;
	};

	static perspective(fov, aspect, near, far, result?) {
		var y = Math.tan(fov * Math.PI / 360) * near;
		var x = y * aspect;
		return Matrix4.frustum(-x, x, -y, y, near, far, result);
	};

	static frustum(l, r, b, t, n, f, result?) {
		result = result || new Matrix4();
		var m = result.m;

		m[0] = 2 * n / (r - l);
		m[1] = 0;
		m[2] = (r + l) / (r - l);
		m[3] = 0;

		m[4] = 0;
		m[5] = 2 * n / (t - b);
		m[6] = (t + b) / (t - b);
		m[7] = 0;

		m[8] = 0;
		m[9] = 0;
		m[10] = -(f + n) / (f - n);
		m[11] = -2 * f * n / (f - n);

		m[12] = 0;
		m[13] = 0;
		m[14] = -1;
		m[15] = 0;

		return result;
	};

	static ortho(l, r, b, t, n, f, result?) {
		result = result || new Matrix4();
		var m = result.m;

		m[0] = 2 / (r - l);
		m[1] = 0;
		m[2] = 0;
		m[3] = -(r + l) / (r - l);

		m[4] = 0;
		m[5] = 2 / (t - b);
		m[6] = 0;
		m[7] = -(t + b) / (t - b);

		m[8] = 0;
		m[9] = 0;
		m[10] = -2 / (f - n);
		m[11] = -(f + n) / (f - n);

		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;

		return result;
	};

	static scale(x, y, z, result?) {
		result = result || new Matrix4();
		var m = result.m;

		m[0] = x;
		m[1] = 0;
		m[2] = 0;
		m[3] = 0;

		m[4] = 0;
		m[5] = y;
		m[6] = 0;
		m[7] = 0;

		m[8] = 0;
		m[9] = 0;
		m[10] = z;
		m[11] = 0;

		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;

		return result;
	};
	static translate(x, y, z, result?) {
		result = result || new Matrix4();
		var m = result.m;

		m[0] = 1;
		m[1] = 0;
		m[2] = 0;
		m[3] = x;

		m[4] = 0;
		m[5] = 1;
		m[6] = 0;
		m[7] = y;

		m[8] = 0;
		m[9] = 0;
		m[10] = 1;
		m[11] = z;

		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;

		return result;
	};

	static rotate(a, x, y, z, result?) {
		if (!a || (!x && !y && !z)) {
			return Matrix4.identity(result);
		}

		result = result || new Matrix4();
		var m = result.m;

		var d = Math.sqrt(x * x + y * y + z * z);
		a *= Math.PI / 180; x /= d; y /= d; z /= d;
		var c = Math.cos(a), s = Math.sin(a), t = 1 - c;

		m[0] = x * x * t + c;
		m[1] = x * y * t - z * s;
		m[2] = x * z * t + y * s;
		m[3] = 0;

		m[4] = y * x * t + z * s;
		m[5] = y * y * t + c;
		m[6] = y * z * t - x * s;
		m[7] = 0;

		m[8] = z * x * t - y * s;
		m[9] = z * y * t + x * s;
		m[10] = z * z * t + c;
		m[11] = 0;

		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;

		return result;
	};
	lookAt(ex, ey, ez, cx, cy, cz, ux, uy, uz, result?) {
		result = result || new Matrix4();
		var m = result.m;

		var e = new Vector3(ex, ey, ez);
		var c = new Vector3(cx, cy, cz);
		var u = new Vector3(ux, uy, uz);
		var f = e.subtract(c).unit();
		var s = u.cross(f).unit();
		var t = f.cross(s).unit();

		m[0] = s.x;
		m[1] = s.y;
		m[2] = s.z;
		m[3] = -s.dot(e);

		m[4] = t.x;
		m[5] = t.y;
		m[6] = t.z;
		m[7] = -t.dot(e);

		m[8] = f.x;
		m[9] = f.y;
		m[10] = f.z;
		m[11] = -f.dot(e);

		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;

		return result;
	}
}