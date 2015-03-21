/**
 * Created by brenden on 3/2/15.
 */

//base class that will make textures for use in a shader
var ShaderTexture = function(options){
    var self = this instanceof ShaderTexture ? this : Object.create(ShaderTexture.prototype);

    //width of the texture
    self.renderer = options.renderer;

    //always the same passthrough shader, the texture changes
    self.passThroughShader = new THREE.ShaderMaterial({
        uniforms: {
            time: { type: "f", value: 1.0 },
            resolution: { type: "v2", value: null },
            texture: { type: "t", value: null }
        },
        vertexShader: "void main()	{\ngl_Position = vec4( position, 1.0 );\n}",
        fragmentShader: "uniform vec2 resolution;\nuniform float time;\nuniform sampler2D texture;\nvoid main()	{\nvec2 uv = gl_FragCoord.xy / resolution.xy;\nvec3 color = texture2D( texture, uv ).xyz;\ngl_FragColor = vec4( color, 1.0 );}"
    });


    self.passThroughShader.uniforms.resolution.value = new THREE.Vector2(options.width,options.width)

    //camera
    self.camera = new THREE.Camera();
    self.camera.z = 1;
    //scene
    self.scene = new THREE.Scene();
    //mesh
    self.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), self.passThroughShader );
    //add it to the scene
    self.scene.add(self.mesh);

    return self;
};

//always the same camera, always at z=1, pointing to origin
//ShaderTexture.prototype.camera = new THREE.Camera();
//ShaderTexture.prototype.camera.position.z = 1;

//always the same scene, the texture of the mesh is the only thing that changes
//ShaderTexture.prototype.scene = new THREE.Scene();

////always the same passthrough shader, the texture changes
//ShaderTexture.prototype.passThroughShader = new THREE.ShaderMaterial({
//    uniforms: {
//        time: { type: "f", value: 1.0 },
//        resolution: { type: "v2", value: null },
//        texture: { type: "t", value: null }
//    },
//    vertexShader: "void main()	{\ngl_Position = vec4( position, 1.0 );\n}",
//    fragmentShader: "uniform vec2 resolution;\nuniform float time;\nuniform sampler2D texture;\nvoid main()	{\nvec2 uv = gl_FragCoord.xy / resolution.xy;\nvec3 color = texture2D( texture, uv ).xyz;\ngl_FragColor = vec4( color, 1.0 );}"
//});

//always the same mesh
//ShaderTexture.prototype.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.passThroughShader );
////add it to the scene
//ShaderTexture.prototype.scene.add(ShaderTexture.prototype.mesh);

//take an input texture, render it once and then output it so we can use it in shaders (I think)
ShaderTexture.prototype.initializeTexture = function ( input, output ) {
    this.mesh.material = this.passThroughShader;
    this.passThroughShader.uniforms.texture.value = input;
    this.renderer.render( this.scene, this.camera, output );
};

//make a three.js render target for our textures that we want to render to
ShaderTexture.prototype.getRenderTarget = function( type,width) {
    return new THREE.WebGLRenderTarget(width, width, {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: type,
        type: THREE.FloatType,
        stencilBuffer: false
    });
};