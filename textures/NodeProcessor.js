/**
 * Created by brenden on 3/21/15.
 */
/**
 * Created by brenden on 3/7/15.
 */
var NodeProcessor = function(options) {
    var self = this instanceof NodeProcessor ? this : Object.create(NodeProcessor.prototype);

    self.makePositionTexture = function(nodes){

        var randomNegative = function(){
            if(Math.random() <= 0.5) return -1;
            else return 1;
        }

        //get the width we need to make the texture
        var width = this.halfTextureSize(nodes.length);
        //make the texture, all nodes start @ origin
        var textureArray = new Float32Array( width * width * 4 );
        for(var i = 0; i < textureArray.length; i ++){
            if(i < nodes.length * 4){
                //0 for nodes / pixels we're actually using
                textureArray[i] = Math.random() * 10 * randomNegative();
            }
            else{
                //-1 for ones we're not
                textureArray[i] = -1;
            }
        }
        return this.makeThreeTexture(textureArray,width);
    };

    self.makeEdgePointerTexture = function(nodes){
        //get the width we need to make the texture
        var width = this.halfTextureSize(nodes.length);
        //make the texture, format of pixel is "beginPixel,component,endPixel,component" for RGBA
        var textureArray = new Float32Array( width * width * 4 );
        var currentPixel = 0;
        var currentCoord = 0;
        for(var i = 0; i < nodes.length; i ++){
            //keep track of the beginning of the array for this node
            var startPixel = currentPixel;
            var startCoord = currentCoord;
            for(var j = 0; j < nodes[i].length; j ++){
                currentCoord++;
                if(currentCoord === 4){
                    currentPixel++;
                    currentCoord = 0;
                }
            }
            //write the two sets of texture indices out
            textureArray[i * 4] = startPixel;
            textureArray[i * 4 + 1] = startCoord;
            textureArray[i * 4 + 2] = currentPixel;
            textureArray[i * 4 + 3] = currentCoord;
        }
        for(var i = nodes.length * 4; i < textureArray.length; i ++){
            textureArray[i] = -1;
        }
        return this.makeThreeTexture(textureArray,width);
    };

    self.makeEdgeTexture = function(nodes){
        var width = this.edgeTextureSize(nodes);
        //straight array of the edges in the graph in order
        var textureArray = new Float32Array( width * width * 4 );
        var currentIndex = 0;
        for(var i = 0; i < nodes.length; i ++){
            for(var j = 0; j < nodes[i].length; j ++){
                textureArray[currentIndex] = nodes[i][j];
                currentIndex ++;
            }
        }
        for(var i = currentIndex; i < textureArray.length; i ++){
            textureArray[i] = -1;
        }
        return this.makeThreeTexture(textureArray,width);
    };

    return self;
};

NodeProcessor.prototype.halfTextureSize = function(num){
    var power = 1;
    while(power * power < num){
        power *= 2;
    }
    return power / 2 > 1 ? power : 2;
};

NodeProcessor.prototype.edgeTextureSize = function(nodes){
    var edgesCount = 0;
    for(var i = 0; i < nodes.length; i ++){
        edgesCount += nodes[i].length;
    }
    return this.halfTextureSize(Math.ceil(edgesCount/4));
};

NodeProcessor.prototype.makeThreeTexture = function(tex,width){
    var texture = new THREE.DataTexture( tex, width, width, THREE.RGBAFormat, THREE.FloatType );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
};
