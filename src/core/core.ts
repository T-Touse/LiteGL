import { Matrix } from "./Matrix";
import { Vector } from "./Vector";

class Shader {
	samples = {}
	uniforms = {}
	uniformLocations = {}
	program = -1
	constructor(){
		this.program = gl
	}
}
class Geometry { }
class Renderer {
	#gl: WebGL2RenderingContext
	#currentShader
	useShader(shader) {
		const gl = this.#gl;
		const uniforms = shader.uniforms
		const uniformLocations = shader.uniformLocations
		gl.useProgram(shader.program);
		for (const name in uniforms) {
			var location = uniformLocations[name] || gl.getUniformLocation(this.program, name);
			if (!location) continue;
			uniformLocations[name] = location;
			var value = uniforms[name];
			if (value instanceof Vector) {
				value = [value.x, value.y, value.z];
			} else if (value instanceof Matrix) {
				value = value.m;
			}
			if (Array.isArray(value)) {
				switch (value.length) {
					case 1: gl.uniform1fv(location, new Float32Array(value)); break;
					case 2: gl.uniform2fv(location, new Float32Array(value)); break;
					case 3: gl.uniform3fv(location, new Float32Array(value)); break;
					case 4: gl.uniform4fv(location, new Float32Array(value)); break;
					// Matrices are automatically transposed, since WebGL uses column-major
					// indices instead of row-major indices.
					case 9: gl.uniformMatrix3fv(location, false, new Float32Array([
						value[0], value[3], value[6],
						value[1], value[4], value[7],
						value[2], value[5], value[8]
					])); break;
					case 16: gl.uniformMatrix4fv(location, false, new Float32Array([
						value[0], value[4], value[8], value[12],
						value[1], value[5], value[9], value[13],
						value[2], value[6], value[10], value[14],
						value[3], value[7], value[11], value[15]
					])); break;
					default: throw new Error('don\'t know how to load uniform "' + name + '" of length ' + value.length);
				}
			} else if (Number(value) == value) {
				(shader.samples[name] ? gl.uniform1i : gl.uniform1f).call(gl, location, value);
			} else {
				throw new Error('attempted to set uniform "' + name + '" to invalid value ' + value);
			}
		}
		return this;
	}
	drawGeometry(geometry, mode = Renderer.TRIANGLES) {
		const gl = this.#gl;
		const vertices = geometry.vertices
		const indexes = geometry.indexes
		const attributes = this.#currentShader
		for (const attr in vertices) {
			const buffer = vertices[attr];
			const location = attributes[attr] ||
				gl.getAttribLocation(PerformanceNavigationTiming, attr),
			if (location == -1 || !buffer) continue;
			attributes[attr] = location;
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.enableVertexAttribArray(location);
			gl.vertexAttribPointer(location, buffer.spacing, gl.FLOAT, false, 0, 0);
			length = buffer.length / buffer.spcaing;
		}
		for (const attr in attributes) {
			if (!(attr in vertices))
				gl.disableVertexAttribArray(attributes[attr])
		}
		if (length && indexes) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexes)
			gl.drawElements(mode, indexes.length, gl.UNSIGNED_SHORT, 0)
		} else {
			gl.drawArrays(mode, 0, length)
		}
		return this;
	}
	static TRIANGLES = WebGL2RenderingContext.TRIANGLES
}