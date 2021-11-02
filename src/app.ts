// abstract library
import { DrawingCommon } from './common';
import * as THREE from 'three'

// example from https://threejs.org/examples/#webgl_custom_attributes

// A class for our application state and functionality
class Drawing extends DrawingCommon {
    sphere: THREE.Mesh;
    uniforms = {
        amplitude: {value: 1.0},
        color: {value: new THREE.Color( 0xff2200 )},
        colorTexture: {value: new THREE.TextureLoader().load( "../assets/water.jpg" )} 
    };

    displacement: Float32Array
    noise: Float32Array

    constructor (canv: HTMLElement) {
        super (canv)


        this.uniforms.colorTexture.value.wrapS = this.uniforms[ "colorTexture" ].value.wrapT = THREE.RepeatWrapping;

        const shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            vertexShader: document.getElementById( 'vertexshader' )!.textContent!,
            fragmentShader: document.getElementById( 'fragmentshader' )!.textContent!
        } );

        const radius = 50, segments = 128, rings = 64;

        const geometry = new THREE.SphereGeometry( radius, segments, rings );

        this.displacement = new Float32Array( geometry.attributes.position.count );
        this.noise = new Float32Array( geometry.attributes.position.count );

        for ( let i = 0; i < this.displacement.length; i ++ ) {

            this.noise[ i ] = Math.random() * 5;

        }

        geometry.setAttribute( 'displacement', new THREE.BufferAttribute( this.displacement, 1 ) );

        this.sphere = new THREE.Mesh( geometry, shaderMaterial );
        this.scene.add( this.sphere );

    }

    //@ts-ignore  because this is initialized in initializeScene, which is called from the 
    // superclass constructor
    animatedMesh: THREE.Mesh;

    /*
	Set up the scene during class construction
	*/
	initializeScene(){
    }

    
	/*
	Update the scene during requestAnimationFrame callback before rendering
	*/
	updateScene(time: DOMHighResTimeStamp){
        time *= 0.01;

        this.sphere.rotation.y = this.sphere.rotation.z = 0.01 * time;

        this.uniforms[ "amplitude" ].value = 2.5 * Math.sin( this.sphere.rotation.y * 0.125 );
        this.uniforms[ "color" ].value.offsetHSL( 0.0005, 0, 0 );

        for ( let i = 0; i < this.displacement.length; i ++ ) {

            this.displacement[ i ] = Math.sin( 0.1 * i + time );

            this.noise[ i ] += 0.5 * ( 0.5 - Math.random() );
            this.noise[ i ] = THREE.MathUtils.clamp( this.noise[ i ], - 5, 5 );

            this.displacement[ i ] += this.noise[ i ];

        }

        this.sphere.geometry.attributes.displacement.needsUpdate = true;
}
}

// a global variable for our state.  We implement the drawing as a class, and 
// will have one instance
var myDrawing: Drawing;

// main function that we call below.
// This is done to keep things together and keep the variables created self contained.
// It is a common pattern on the web, since otherwise the variables below woudl be in 
// the global name space.  Not a huge deal here, of course.

function exec() {
    // find our container
    var div = document.getElementById("drawing");

    if (!div) {
        console.warn("Your HTML page needs a DIV with id='drawing'")
        return;
    }

    // create a Drawing object
    myDrawing = new Drawing(div);
}

exec()