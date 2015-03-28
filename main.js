//necessary global variables
var camera;
var controls;
var scene;
var renderer;
var stats;
var NP;
var EdgeIndices;
var Edges;
var texSize;
var sim;

var cloudMaterial;
var edgeMaterial;

var gridSize = 40;

var simulate = false;

nodes = [
    [1],[2],[0,3],[0]
]

//when the user hits the spacebar stop/start the simulation
document.onkeypress = function(e){
    if(e.charCode === 32){
        if(simulate){
            simulate = false;
        }
        else{
            simulate = true;
        }
    }
};

var initialize = function(){
    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);

    //camera
    camera = new THREE.PerspectiveCamera(60,window.innerWidth / window.innerHeight,10,500);
    camera.position.z = 100;

    camera.position.y = 100;
    //controls
    controls = new THREE.OrbitControls( camera );
    controls.damping = 0.2;
    controls.staticMoving = false;

    //scene
    scene = new THREE.Scene();

    //process nodes
    NP = new NodeProcessor();
    var InitialPositions = NP.makePositionTexture(nodes);
    EdgeIndices = NP.makeEdgePointerTexture(nodes);
    Edges = NP.makeEdgeTexture(nodes);
    texSize = NP.halfTextureSize(nodes);

    sim = new PingPong({
        renderer : renderer,
        width : texSize,
        edgeTexWidth : NP.edgeTextureSize(nodes),
        particleShaderId : "nodeFragment",
        uniforms : {
            positions : {type : "t", value : null},
            edgeIndices : {type : "t", value : EdgeIndices},
            edges : {type : "t", value : Edges},
            delta : {type : "f", value : null},
            textureWidth : {type : "f", value : texSize},
            resolution : {type : "v2", value : new THREE.Vector2(texSize,texSize)}
        }
    });
    sim.initialize(InitialPositions);



    cloudMaterial = new THREE.ShaderMaterial( {
        uniforms:{
            positionTexture:   { type: "t", value: null }
        },
        attributes:{
            size:        { type: 'f', value: null },
            customColor: { type: 'c', value: null },
            texPos : {type : "v2", value : null}
        },
        vertexShader:   document.getElementById( 'cloudVertex' ).textContent,
        fragmentShader: document.getElementById( 'cloudFragment' ).textContent,
        blending:       THREE.AdditiveBlending,
        depthTest:      false,
        transparent:    true
    });

    var makeParticles = function(){
        //make a particle system with buffer geometry
        var geometry = new THREE.BufferGeometry();

        var positions = new Float32Array( nodes.length * 3 );
        var values_color = new Float32Array( nodes.length * 3 );
        var values_size = new Float32Array( nodes.length );
        var texPoses = new Float32Array(nodes.length * 2);

        var color = new THREE.Color();

        for( var v = 0; v < nodes.length; v++ ) {

            //wow this is dumb, this is how glsl indexes texture positions, as a fraction of the overall length
            //instead of something sane like an integer based index
            texPoses[v * 2] = (Math.floor(v / texSize)) / texSize;
            texPoses[(v * 2) + 1] = (v % texSize) / texSize;
            //nevermind that's actually pretty smart?

            //whatever, copypasta'ed code
            values_size[ v ] = 5.0;

            //positions don't matter since we'll be taking those from the texture anyways
            positions[ v * 3 ] = Math.random() * gridSize - gridSize / 2;
            positions[ v * 3 + 1 ] = Math.random() * gridSize - gridSize / 2;
            positions[ v * 3 + 2 ] = Math.random() * gridSize - gridSize / 2;

            //color, whatever
            color.setHSL( v / nodes.length, 1.0, 0.5 );
            values_color[ v * 3 ] = color.r;
            values_color[ v * 3 + 1 ] = color.g;
            values_color[ v * 3 + 2 ] = color.b;

        }

        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'customColor', new THREE.BufferAttribute( values_color, 3 ) );
        geometry.addAttribute( 'size', new THREE.BufferAttribute( values_size, 1 ) );
        geometry.addAttribute( 'texPos', new THREE.BufferAttribute( texPoses, 2 ) );
        geometry.computeBoundingBox();

        cloud = new THREE.PointCloud( geometry, cloudMaterial );

        scene.add( cloud );
    };

    makeParticles();

    edgeMaterial = new THREE.ShaderMaterial( {
        uniforms:{
            positionTexture:   { type: "t", value: null },
            color : {type : 'c', value : new THREE.Color(0x999999)}
        },
        attributes:{
            texPos : {type : "v2", value : null}
        },
        vertexShader:   document.getElementById( 'edgeVertex' ).textContent,
        fragmentShader: document.getElementById( 'edgeFragment' ).textContent,
        blending:       THREE.AdditiveBlending,
        depthTest:      false,
        transparent:    true
    });

    var makeEdges = function(){
        var geometry = new THREE.BufferGeometry();
        //get the number of edges
        var edges = 0;
        for(var i = 0; i < nodes.length; i ++){
            edges += nodes[i].length;
        }

        //two vec3s per line
        var positions = new Float32Array(edges * 2 * 3);
        //two texture indices per line
        var textureIndices = new Float32Array(edges * 2 * 2);

        //keeps track of which vertex we're on
        var currentVertex = 0;

        for(var i = 0; i < nodes.length; i ++){
            //get the starting texture position (will be the same for all in this node)
            var texStartX = (Math.floor(i / texSize)) / texSize;
            var texStartY = (i % texSize) / texSize;

            //now we get all the endpoints and put in the data
            for(var j = 0; j < nodes[i].length; j ++){
                //first do the start point
                textureIndices[currentVertex * 2] = texStartX;
                textureIndices[currentVertex * 2 + 1] = texStartY;
                //position
                positions[currentVertex * 3] = 0;
                positions[currentVertex * 3 + 1] = 0;
                positions[currentVertex * 3 + 2] = 0;
                //go to next vertex
                currentVertex++;
                //first do the start point
                textureIndices[currentVertex * 2] = (Math.floor(nodes[i][j]/ texSize)) / texSize;;
                textureIndices[currentVertex * 2 + 1] = (nodes[i][j] % texSize) / texSize;
                //position
                positions[currentVertex * 3] = 0;
                positions[currentVertex * 3 + 1] = 0;
                positions[currentVertex * 3 + 2] = 0;
                //go to the next vertex
                currentVertex++;
            }
        }
        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'texPos', new THREE.BufferAttribute( textureIndices, 2 ) );

        var mesh = new THREE.Line( geometry, edgeMaterial );
        scene.add( mesh );
    };

    makeEdges();



    //stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild( stats.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    animate();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();
}


function render() {
    renderer.render( scene, camera );
    stats.update();
}

function animate() {

    stats.update();
    controls.update();

    requestAnimationFrame(animate);
    render();
}

function render(){
    var now = window.performance.now();
    var delta = previousTime - now;
    var previousTime = now;

    if(simulate){
        sim.renderTexture({
            delta : delta,
            positions : sim.activeTexture
        });
        cloudMaterial.uniforms.positionTexture.value = sim.activeTexture;
    }
    renderer.render(scene,camera);
}