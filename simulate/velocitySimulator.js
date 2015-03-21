/**
 * Created by brenden on 3/3/15.
 */
var VelocitySimulator = function(options) {
    var self = this instanceof VelocitySimulator ? this : Object.create(VelocitySimulator.prototype);
    //call ShaderTexture, because this is one of those
    PingPong.call(self,options);

    //make a rtt target
    self.makeTexture = function(){

        //make the typed array for the texture
        var textureArray = new Float32Array( this.particles * 4 );

        //loop through the data
        for ( var k = 0; k < textureArray.length; k += 4 ) {
            //rgba
            textureArray[ k + 0 ] = 0;
            textureArray[ k + 1 ] = 0;
            textureArray[ k + 2 ] = 0;
            textureArray[ k + 3 ] = 0;
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

VelocitySimulator.prototype = Object.create(PingPong.prototype);