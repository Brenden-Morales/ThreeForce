//necessary global variables
var camera;
var controls;
var scene;
var renderer;
var stats;
var NP;

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
    console.log(NP.makePositionTexture(nodes));
    console.log(NP.makeEdgePointerTexture(nodes));
    console.log(NP.makeEdgeTexture(nodes));


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

    }
    renderer.render(scene,camera);
}