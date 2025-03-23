class Matrix {
	static identity() {
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	}

	static translation(x, y, z) {
		return [
			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1
		];
	}

	static scaling(sx, sy, sz) {
		return [
			sx, 0, 0, 0,
			0, sy, 0, 0,
			0, 0, sz, 0,
			0, 0, 0, 1
		];
	}

	static rotationX(angle) {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		return [
			1, 0, 0, 0,
			0, c, -s, 0,
			0, s, c, 0,
			0, 0, 0, 1
		];
	}

	static rotationY(angle) {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		return [
			c, 0, s, 0,
			0, 1, 0, 0,
			-s, 0, c, 0,
			0, 0, 0, 1
		];
	}

	static rotationZ(angle) {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		return [
			c, -s, 0, 0,
			s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	}

	static multiply(a, b) {
		const result = new Array(16).fill(0);
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				for (let i = 0; i < 4; i++) {
					result[row * 4 + col] += a[row * 4 + i] * b[i * 4 + col];
				}
			}
		}
		return result;
	}
}

export { Matrix };
