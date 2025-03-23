import { Matrix } from "./Matrix";
import { Shader } from "./Shader";

export class Renderer {
	#gl: WebGL2RenderingContext
	constructor(gl: WebGL2RenderingContext) {
		this.#gl = gl
	}
	// -- SHADER --
	#shaders = new Map()
	#createShader(source, type) {
		const shader = this.#gl.createShader(type);
		if (!shader) throw new Error('Shader compile error: shader is null');

		this.#gl.shaderSource(shader, source);
		this.#gl.compileShader(shader);
		if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
			throw new Error('Shader compile error: ' + this.#gl.getShaderInfoLog(shader));
		}
		const name = crypto.randomUUID();
		this.#shaders.set(name, shader);
		return name;
	}
	createVertexShader(vertexShader) {
		return this.#createShader(vertexShader, this.#gl.VERTEX_SHADER)
	}
	createFragmentShader(fragmentShader) {
		return this.#createShader(fragmentShader, this.#gl.FRAGMENT_SHADER)
	}
	#programs = new Map()
	compileShaderProgram(name, vertexShader, fragmentShader, allowRenaming = false) {
		if (!name || this.#programs.has(name)) {
			if (name == null || allowRenaming) {
				name = crypto.randomUUID()
			} else {
				throw new Error("Program compile error: this name \"" + name + "\" already exist")
			}
		}
		vertexShader = this.#shaders.get(vertexShader)
		if (!vertexShader) throw new Error("Program compile error: vertexShader is not defined, use createVertexShader(vertexShader)")
		fragmentShader = this.#shaders.get(fragmentShader)
		if (!vertexShader) throw new Error("Program compile error: fragmentShader is not defined, use createFragmentShader(fragmentShader)")
		const program = this.#gl.createProgram();
		this.#gl.attachShader(program, vertexShader);
		this.#gl.attachShader(program, fragmentShader);
		if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
			throw new Error('Program link error: ' + this.#gl.getProgramInfoLog(program));
		}
		this.#programs.set(name, program);
		return name;
	}
	#program
	useShaderProgram(shaderProgram) {
		shaderProgram = this.#programs.get(shaderProgram)
		if (!shaderProgram) throw new Error("Program access error: shaderProgram is not defined, use compileShaderProgram(vertexShader,fragmentShader)")
		this.#gl.useProgram(shaderProgram);
		this.#program = shaderProgram
	}
	#uniformLocations = new Map()
	setUniform(name, value) {
		let location = this.#uniformLocations.get(name) || this.#gl.getUniformLocation(this.#program, name);
		if (!location) return;
		this.#uniformLocations.set(name, location);
		if (Array.isArray(value)) {
			switch (value.length) {
				case 1: this.#gl.uniform1fv(location, new Float32Array(value)); break;
				case 2: this.#gl.uniform2fv(location, new Float32Array(value)); break;
				case 3: this.#gl.uniform3fv(location, new Float32Array(value)); break;
				case 4: this.#gl.uniform4fv(location, new Float32Array(value)); break;
				case 9: this.#gl.uniformMatrix3fv(location, false, new Float32Array(value)); break;
				case 16: this.#gl.uniformMatrix4fv(location, false, new Float32Array(value)); break;
			}
		} else {
			this.#gl.uniform1f(location, value);
		}
	}
	// -- MESH --
	#createBuffer(type, data) {
		const buffer = this.#gl.createBuffer();
		this.#gl.bindBuffer(type, data);
		this.#gl.bufferData(type, new Float32Array(data), this.#gl.STATIC_DRAW);
		return buffer
	}
	#geometries = new Map()
	createGeometry(name, vertices, indices, allowRenaming = false) {
		if (!name || this.#programs.has(name)) {
			if (name == null || allowRenaming) {
				name = crypto.randomUUID()
			} else {
				throw new Error("Geometry compile error: this name \"" + name + "\" already exist")
			}
		}
		const geometry = {
			vertices: this.#createBuffer(this.#gl.ARRAY_BUFFER, vertices),
			indices: indices ? this.#createBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, indices) : null,
			count: indices ? indices.length : vertices.length / 3
		}
		this.#geometries.set(name, geometry);
		return name;
	}
	draw(geometry) {
		geometry = this.#geometries.get(geometry);
		if (!geometry) throw new Error("Draw access error: geometry is not defined, use createGeometry(name,vertices,indices,?allowRenaming)")
		this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, geometry.vertices);
		this.#gl.enableVertexAttribArray(0);
		this.#gl.vertexAttribPointer(0, 3, this.#gl.FLOAT, false, 0, 0);

		if (geometry.indices) {
			this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, geometry.indices);
			this.#gl.drawElements(this.#gl.TRIANGLES, geometry.count, this.#gl.UNSIGNED_SHORT, 0);
		} else {
			this.#gl.drawArrays(this.#gl.TRIANGLES, 0, geometry.count);
		}

	}
	// -- CAMERA --
	
	#tempMatrix = new Matrix();
	#resultMatrix = new Matrix();
	#modelviewMatrix = new Matrix();
	#projectionMatrix = new Matrix();
	#matrixMode = "modelviewMatrix"
	#multMatrix(m){
		this.#tempMatrix = m
		Matrix.multiply(this[this.#matrixMode], m, this.#resultMatrix)
	}
	translate(x, y, z){
		this.#multMatrix(Matrix.translate(x, y, z));
	}
	rotate(a, x, y, z){
		this.#multMatrix(Matrix.rotate(a, x, y, z));
	}
	scale(x, y, z){
		this.#multMatrix(Matrix.scale(x, y, z));
	}
	lookAt(x, y, z){
		this.#multMatrix(Matrix.translate(x, y, z));
	}
	perspective(fov, aspect, near, far){
		this.#multMatrix(Matrix.perspective(fov, aspect, near, far));
	}
	frustum(l, r, b, t, n, f){
		this.#multMatrix(Matrix.frustum(l, r, b, t, n, f));
	}
	ortho(l, r, b, t, n, f){
		this.#multMatrix(Matrix.ortho(l, r, b, t, n, f));
	}
}