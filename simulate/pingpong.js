/**
 * Created by brenden on 3/7/15.
 */
var PingPong = function(options) {
    var self = this instanceof PingPong ? this : Object.create(PingPong.prototype);
    //call ShaderTexture, because this is one of those
    ShaderTexture.call(self,options);

    //passed in variables
    self.width = options.width;
    self.particleShaderId = options.particleShaderId;

    //the two textures we'll be using for "ping ponging"
    self.pingTexture;
    self.pongTexture;
    //ping/pong flag
    self.ping = true;
    //the texture that's currently active / has been pinged / ponged to
    self.activeTexture;

    //set up the fragment shaders loopdelta based on the width of the texture
    var shaderText = document.getElementById(self.particleShaderId).text;
    var loopDeltaText = "const float loopDelta = 1.0 /"
    var loopDeltaIndex = shaderText.indexOf(loopDeltaText) + loopDeltaText.length;
    shaderText = shaderText.substr(0,loopDeltaIndex) + self.width + ".0" + shaderText.substr(loopDeltaIndex,shaderText.length);


    //actual shader for the particles
    self.particleShader = new THREE.ShaderMaterial({
        uniforms : options.uniforms,
        vertexShader: document.getElementById( 'passThroughVertex' ).textContent,
        fragmentShader: shaderText
    });

    //render function
    self.renderTexture = function(data) {
        //set the global mesh to our shader
        this.mesh.material = this.particleShader;
        //decide if we're pinging or ponging
        if(this.ping){
            //we take from pong, render to ping
            this.particleShader.uniforms.positions.value = this.pongTexture;
        }
        else{
            //take from ping, render to pong
            this.particleShader.uniforms.positions.value = this.pingTexture;
        }
        //update all the uniforms
        for(var prop in data){
            if(data.hasOwnProperty(prop)){
                if(this.particleShader.uniforms[prop] !== undefined){
                    this.particleShader.uniforms[prop].value = data[prop];
                }
            }
        }
        if(this.ping){
            this.ping = false;
            this.renderer.render(this.scene,this.camera,this.pingTexture);
            this.activeTexture = this.pingTexture;

        }
        else{
            this.ping = true;
            this.renderer.render(this.scene,this.camera,this.pongTexture);
            this.activeTexture = this.pongTexture;
        }
    };

    self.initialize = function(initialTexture){

        //create the render targets
        this.pingTexture = this.getRenderTarget(THREE.RGBAFormat,this.width);
        this.pongTexture = this.pingTexture.clone();

        //render them once for some reason? (why not?)
        this.initializeTexture(initialTexture,this.pingTexture);
        this.initializeTexture(this.pingTexture,this.pongTexture);
    };

    return self;
};

//use ShaderTexture prototype
PingPong.prototype = Object.create(ShaderTexture.prototype);