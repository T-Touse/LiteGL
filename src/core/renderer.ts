import { Matrix4 } from "./Matrix";
import { Vector3 } from "./Vector";

interface ProgramInfo{
	program: WebGLProgram;
	uniformLocations:Map<string,WebGLUniformLocation>;
	attribLocations:Map<string,GLint>;
	vertexShader:string;
	fragmentShader;
}
interface Geometry{
	vertices:WebGLBuffer,
	indices:WebGLBuffer|null;
	count:number
	vao?:WebGLVertexArrayObject

}

interface Camera{
	projectionMatrix:Matrix4;
	viewMatrix: Matrix4;
}

export class Renderer {
	#gl: WebGL2RenderingContext
	constructor(gl: WebGL2RenderingContext) {
		this.#gl = gl
	}
	// -- SHADER --
	#shaders:Map<string,WebGLShader> = new Map()
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
	#programs:Map<string,ProgramInfo> = new Map()
	compileShaderProgram(name:string, vertexShader:string, fragmentShader:string, allowRenaming:boolean = false) {
		if (!name || this.#programs.has(name)) {
			if (name == null || allowRenaming) {
				name = crypto.randomUUID()
			} else {
				throw new Error("Program compile error: this name \"" + name + "\" already exist")
			}
		}
		const _vertexShader = this.#shaders.get(vertexShader)
		if (!_vertexShader) throw new Error("Program compile error: vertexShader is not defined, use createVertexShader(vertexShader)")
		const _fragmentShader = this.#shaders.get(fragmentShader)
		if (!_fragmentShader) throw new Error("Program compile error: fragmentShader is not defined, use createFragmentShader(fragmentShader)")
		const program = this.#gl.createProgram();
		this.#gl.attachShader(program, _vertexShader);
		this.#gl.attachShader(program, _fragmentShader);
		this.#gl.linkProgram(program);
		if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
			throw new Error('Program link error: ' + this.#gl.getProgramInfoLog(program));
		}
		const programInfo:ProgramInfo =  {
			vertexShader,fragmentShader,
			program,
			attribLocations : new Map(),
			uniformLocations : new Map(),
		}
		this.#programs.set(name,programInfo);
		return name;
	}
	#program:ProgramInfo|null = null;
	useShaderProgram(shaderProgram) {
		shaderProgram = this.#programs.get(shaderProgram)
		if (!shaderProgram) throw new Error("Program access error: shaderProgram is not defined, use compileShaderProgram(vertexShader,fragmentShader)")
		this.#gl.useProgram(shaderProgram.program);
		this.#program = shaderProgram
		this.#applyCamera()
	}
	setUniform(name, value) {
		if(!this.#program) throw `useShaderProgram` 
		let location = this.#program.uniformLocations.get(name) || this.#gl.getUniformLocation(this.#program.program, name);
		if (!location) throw new Error("location is null for "+name);
		this.#program.uniformLocations.set(name, location);
		if(value instanceof Vector3)value = value.toArray()
		if(value instanceof Matrix4)value = value.toArray()
		if (Array.isArray(value)) {
			value = value instanceof Float32Array ? value : new Float32Array(value)
			switch (value.length) {
				case 1: this.#gl.uniform1fv(location, value); break;
				case 2: this.#gl.uniform2fv(location, value); break;
				case 3: this.#gl.uniform3fv(location, value); break;
				case 4: this.#gl.uniform4fv(location, value); break;
				case 9: this.#gl.uniformMatrix3fv(location, false, value); break;
				case 16: this.#gl.uniformMatrix4fv(location, false, value); break;
			}
		} else {
			this.#gl.uniform1f(location, value);
		}
	}
	setAttribute(name, buffers,dimmension = 1,type=this.#gl.FLOAT,normalize=false,stride=0,offset=0) {
		if(!this.#program) throw `useShaderProgram` 
		let location = this.#program.attribLocations.get(name) || this.#gl.getAttribLocation(this.#program.program, name);
		if (!location) return;
		this.#program.attribLocations.set(name, location);
		this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffers);
		this.#gl.vertexAttribPointer(
			location,
			dimmension,
			type,
			normalize,
			stride,
			offset
		);
		this.#gl.enableVertexAttribArray(location);
	}
	// -- MESH --
	#createBuffer(type:number, data:Float32Array|Uint16Array):WebGLBuffer {
		const buffer = this.#gl.createBuffer();
		this.#gl.bindBuffer(type, buffer);
		this.#gl.bufferData(type, data, this.#gl.STATIC_DRAW);
		return buffer
	}
	#geometries:Map<string,Geometry> = new Map()
	createGeometry(name:string, vertices:Array<number>, indices:Array<number>|null, allowRenaming:boolean = false) {
		if (!name || this.#programs.has(name)) {
			if (name == null || allowRenaming) {
				name = crypto.randomUUID()
			} else {
				throw new Error("Geometry compile error: this name \"" + name + "\" already exist")
			}
		}
		const geometry:Geometry = {
			vertices: this.#createBuffer(this.#gl.ARRAY_BUFFER, new Float32Array(vertices)),
			indices: indices ? this.#createBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices)) : null,
			count: indices ? indices.length : vertices.length / 3
		}
		this.#geometries.set(name, geometry);
		return name;
	}
	draw(geometry:string) {
		const _geometry:Geometry|undefined = this.#geometries.get(geometry);
		if (!_geometry) throw new Error("Draw access error: geometry is not defined, use createGeometry(name,vertices,indices,?allowRenaming)")
		this.setAttribute("position", _geometry.vertices, 3);
		if (!_geometry.vao){
			const vao = this.#gl.createVertexArray();
			this.#gl.bindVertexArray(vao);
			this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, _geometry.vertices);
			this.#gl.enableVertexAttribArray(0);
			this.#gl.vertexAttribPointer(0, 3, this.#gl.FLOAT, false, 0, 0);
			this.#gl.bindVertexArray(null); // Unbind après configuration
			_geometry.vao = vao
		}else{
			this.#gl.bindVertexArray(_geometry.vao);
		}	
		if (_geometry.indices) {
			this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, _geometry.indices);
			this.#gl.drawElements(this.#gl.TRIANGLES, _geometry.count, this.#gl.UNSIGNED_SHORT, 0);
		} else {
			this.#gl.drawArrays(this.#gl.TRIANGLES, 0, _geometry.count);
		}

		const err = this.#gl.getError();
		if (err !== this.#gl.NO_ERROR) {
			console.error("WebGL Error:", err);
		}	
	}
	clear(mask){
		if(!mask)
			mask = 16640//this.#gl.COLOR_BUFFER_BIT|this.#gl.DEPTH_BUFFER_BIT
		this.#gl.clear(mask)
	}
	#camera:Camera|null = null
	setCamera(projectionMatrix:Matrix4,viewMatrix:Matrix4){
		this.#camera = {projectionMatrix,viewMatrix}
	}
	#applyCamera(){
		if(this.#camera){
			const {projectionMatrix,viewMatrix} = this.#camera
			this.setUniform("projectionMatrix",projectionMatrix)
			this.setUniform("modelViewMatrix",viewMatrix)
		}
	}
	protected deleteShader(shaderName:string){
		const shader:WebGLShader|undefined = this.#shaders.get(shaderName)
		if(shader){
			this.#gl.deleteShader(shader)
		}
	}
	deleteShaderProgram(shaderProgram:string){
		const programInfo:ProgramInfo|undefined = this.#programs.get(shaderProgram)
		if(programInfo){
			this.deleteShader(programInfo.vertexShader)
			this.deleteShader(programInfo.fragmentShader)
			this.#gl.deleteProgram(programInfo.program)
			if(this.#program == programInfo)
				this.#program = null;
			this.#programs.delete(shaderProgram)
		}
	}
	deleteGeometry(geometry:string){
		const _geometry:Geometry|undefined = this.#geometries.get(geometry);
		if(_geometry){
			this.#gl.deleteBuffer(_geometry.vertices);
			if(_geometry.vao)
				this.#gl.deleteVertexArray(_geometry.vao)
			if (_geometry.indices) this.#gl.deleteBuffer(_geometry.indices);
			this.#geometries.delete(geometry);
		}
	}
	dispose() {
		for (let shader of this.#shaders.values()) {
			this.#gl.deleteShader(shader);
		}
		for (let program of this.#programs.values()) {
			this.#gl.deleteProgram(program.program);
		}
		for (let geometry of this.#geometries.values()) {
			this.#gl.deleteBuffer(geometry.vertices);
			if (geometry.indices) this.#gl.deleteBuffer(geometry.indices);
		}
		this.#shaders.clear();
		this.#programs.clear();
		this.#geometries.clear();
	}
}