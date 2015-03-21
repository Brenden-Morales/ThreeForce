/**
 * Created by brenden on 2/27/15.
 */
var ParticleSimulator = function(options){
    var self = this instanceof ParticleSimulator ? this : Object.create(ParticleSimulator.prototype);
    //call ShaderTexture, because this is one of those
    PingPong.call(self,options);

    //make a rtt target
    self.makeTexture = function(){
        //parse out options
        var halfBounds = this.bounds / 2;

        //make the typed array for the texture
        var textureArray = new Float32Array( this.particles * 4 );

        //loop through the data
        for ( var k = 0; k < textureArray.length; k += 4 ) {
            var x = Math.random() * this.bounds - halfBounds;
            var y = Math.random() * this.bounds - halfBounds;
            var z = Math.random() * this.bounds - halfBounds;
            //rgba
            textureArray[ k + 0 ] = x;
            textureArray[ k + 1 ] = y;
            textureArray[ k + 2 ] = z;
            textureArray[ k + 3 ] = 1;
        }

        var texture = new THREE.DataTexture( textureArray, Math.sqrt(this.particles), Math.sqrt(this.particles), THREE.RGBAFormat, THREE.FloatType );
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        texture.flipY = false;

        return texture;
    };

    return self;
};

ParticleSimulator.prototype = Object.create(PingPong.prototype);