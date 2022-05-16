// Created by sebastien durand - 2013
// Edited by ESCowboy 
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

precision highp float;
varying vec4 pos;

uniform vec4 cameraPosition;
uniform vec4 cameraTarget;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float wValue;

// ---- <gui-config> ---- 

uniform float viewInside;

uniform vec4 color_0;
uniform vec4 color_1;
uniform float gradient_line;
uniform float gradient_rotation;

uniform vec4 tessaractSize;
uniform vec4 tessaractPosition;

uniform vec3 sphere_color;
uniform float sphere_radius;

// ---- <gui-config/> ----

#define ANTIALIASING 1

#define RAY_STEP 40
//#define DRAWAXES

float sdPlane( vec4 p ) {
	return p.y;
}

float sdSphere( vec4 p, float s ) {
    return length(p)-s;
}

float sdTesseract( vec4 p, vec4 b ) {
  vec4 d = abs(p) - b;
  return min(max(d.x,max(d.y,max(d.z,d.w))),0.0) + length(max(d,0.0));
}

float udRoundTesseract( vec4 p, vec4 b, float r) {
  return length(max(abs(p)-b,0.0))-r;
}

float opS( float d1, float d2 ) {
    return max(-d2,d1);
}

vec2 opU( vec2 d1, vec2 d2 ) {
	return (d1.x<d2.x) ? d1 : d2;
}

vec4 opRep( vec4 p, vec4 c ) {
    return mod(p,c)-0.5*c;
}

vec4 opRepW(vec4 p, float c) {
	p.w = mod(p.w,c)-0.5*c;
    return p;
}

vec4 opTwist( vec4 p ) {
    float  c = cos(10.0*p.y+10.0);
    float  s = sin(10.0*p.y+10.0);
    mat2   m = mat2(c,-s,s,c);
    return vec4(m*p.xz,p.y, p.w);
}

float smin( float a, float b, float k ) {
    float h = clamp( .5+0.5*(b-a)/k, 0., 1. );
    return mix( b, a, h ) - k*h*(1.0-h);
}

mat2 Rot(float a){
    float s = sin(a);
    float c = sin(a);
    return mat2(c, -s, s, c);
}

vec4 Rot4D(vec4 p4D, vec3 r){
    p4D.xz = p4D.xz*mat2(cos(r.y), sin(r.y), -sin(r.y), cos(r.y));
    p4D.yz = p4D.yz*mat2(cos(r.x), -sin(r.x), sin(r.x), cos(r.x));
    p4D.xy = p4D.xy*mat2(cos(r.z), -sin(r.z), sin(r.z), cos(r.z));

    p4D.xw = p4D.xw*mat2(cos(r.x), sin(r.x), -sin(r.x), cos(r.x));
    p4D.zw = p4D.zw*mat2(cos(r.z), -sin(r.z), sin(r.z), cos(r.z));
    p4D.yw = p4D.yw*mat2(cos(r.y), -sin(r.y), sin(r.y), cos(r.y));
    return p4D;
}

//----------------------------------------------------------------------

vec2 map( in vec4 pos ) {
    vec2 res = vec2(99999.,0);
    //input
    if(viewInside == 1.)
        res = vec2(sin(res.x), res.y);

    vec4 tp = pos-tessaractPosition;
    res = vec2(smin( res.x, udRoundTesseract( tp, tessaractSize, .7 ), 1.8), 1.0);
    // res = vec2(smin( res.x,  sdSphere(pos-vec4(0., iMouse.y, iMouse.x, 1.), 2.), 0.5), 1.0);
    // res = vec2(opS(res.x, sdSphere(pos-vec4(0., iMouse.y, iMouse.x, 1.), 1.)), 1.);

    // res = mix(res, vec2(1.3, .5), .15);
	return res;
}

vec2 castRay( in vec4 ro, in vec4 rd, in float maxd ) {
	// float precis = 0.1005;
	float precis = 0.0005;
    float h=precis*2.0;
    // float t = 10.;
    float t = 2.0;
	vec2 res;
    int s = int(ro.x);
    for( int i=0; i<RAY_STEP; i++ ) {
        if (abs(h)<precis || t>maxd ) break;
        t += h;
        res = map( ro+rd*t );
        h = res.x;
    }
    return vec2( t, t>=maxd ? sin(res.x) : mix(res.y, res.x, ro.x) );
    // return vec2( t, t>=maxd ? sin(res.x) : 1. );
    // return vec2( t, t>=maxd ? -1. : res.y );
}

float softshadow( in vec4 ro, in vec4 rd, in float mint) {
	float res = 1.0;
    float h,t = mint;
    for( int i=0; i<15; i++ ) {
        h = map( ro + rd*t ).x;
        res = min( res, 7.*h/t );
        t += 0.028;
    }
    return clamp( res-.6, 0.0, 1.0 );
}

const vec2 eps = vec2( 0.001, 0.0);
vec4 calcNormal( in vec4 pos )
{
	return normalize(vec4(
	    map(pos+eps.xyyy).x - map(pos-eps.xyyy).x,
	    map(pos+eps.yxyy).x - map(pos-eps.yxyy).x,
	    map(pos+eps.yyxy).x - map(pos-eps.yyxy).x,
		map(pos+eps.yyyx).x - map(pos-eps.yyyx).x
	));
}

float calcAO( in vec4 pos, in vec4 nor ){
	float dd, hr, totao = 0.0;
    float sca = 1.0;
    vec4 aopos; 
    for( int aoi=0; aoi<5; aoi++ ) {
        hr = 0.01 + 0.05*float(aoi);
        aopos =  nor * hr + pos;
        totao += -(map( aopos ).x-hr)*sca;
        sca *= 0.75;
    }
    return clamp( 1.0 - 4.0*totao, 0.0, 1.0 );
}

vec3 render( in vec4 ro, in vec4 rd ){ 
    vec3 col = vec3(0);
    vec2 res = castRay(ro,rd, 19.0);
    float t = res.x;
	float m = res.y;
    float bac = 1.;
    if( m>.9 )
    {
        vec4 pos = ro + t*rd;
        vec4 nor = calcNormal( pos );

		col = vec3(1.);
		// col = vec3(0.6) + 0.4*sin( vec3(0.05,0.08,0.10)*(m-1.0) );
		
       // float ao = calcAO( pos, nor );
        float ao =1.;

		vec4 lig = normalize( vec4(-0.6, 0.7, -0.5, 0.5) );
		// vec4 lig = normalize( vec4(iMouse.x, iMouse.y, -0.5, 0.5) );

		float amb = clamp( 0.5*nor.y, 0.0, 1.0 );
        float dif = clamp( dot( nor, lig ), 0.0, 1.0 );
        // float bac = clamp( dot( nor, normalize(vec4(-lig.x,0.0,-lig.z,0.0))), 0.0, 1.0 );
        // float bac = clamp( dot( nor, normalize(vec4(-lig.x,0.0,-lig.z,0.0))), 0.0, 1.0 )*clamp( 1.0-pos.y,0.0,1.0);

		vec3 brdf = vec3(0.0);
		brdf += 0.20*amb*vec3(0.10,0.11,0.13)*ao;
        // brdf += vec3(0.15)*ao;
        // brdf += .2*bac*vec3(0.15)*ao;
        brdf += 1.20*dif;

		float pp = clamp( dot( reflect(rd,nor), lig ), 0., 1. );
		float spe = pow(pp,16.0);
		float fre = ao*pow( clamp(1.0+dot(nor,rd),0.0,1.0), 2.0 );
		// float fre = ao*pow( clamp(1.0+dot(nor,-rd),0.0,1.0), 2.0 );

		col = col*brdf + vec3(1.0)*col*spe + 0.7*fre*(0.5+0.5*col);
        // col = vec3(1., 0., 0.);
        col += sphere_color;

	}

	col *= exp( -0.02*t*t );

    vec3 color = vec3( clamp(col,0.0,1.0) );

	return vec3(color);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {    
    vec4 cw = normalize( cameraTarget-cameraPosition ),
        cp = vec4( 0., 1., 0., 0. ),
        cu = normalize( vec4(cross(cw.xyz,cp.xyz),0.)),
        cv = normalize( vec4(cross(cu.xyz,cw.xyz),0.));  
    
		vec2 q = fragCoord.xy/iResolution.xy;
		vec2 p = -1.0+2.0*q;
		p.x *= iResolution.x/iResolution.y;
		vec4 rd = normalize( p.x*cu + p.y*cv + 2.5*cw );
        // vec2 res = castRay(ro,rd, 19.0);

	    // fragColor= normalize(color_0+vec4(.0, sin(pos.y*0.2), -pos.xy*.4)+vec4(sqrt(render( ro, rd )), 1.));

        vec2 gline;
        gline.x = pos.x * cos(gradient_rotation)-pos.y*sin(gradient_rotation);
        gline.y = pos.x * sin(gradient_rotation)+pos.y*cos(gradient_rotation);

	    fragColor= (mix(color_0, color_1, gline.x-gradient_line)+vec4((render( cameraPosition, rd )), 1.));

    


	    // fragColor= normalize(vec4(.4, .0, .6, .0)+vec4(.0, sin(pos.y*0.2), -pos.xy*.4)+vec4(sqrt(render( cameraPosition, rd )), 1.));
	    // fragColor= mix(vec4(.4, .0, .6, .5), vec4(sqrt(render( ro, rd )), 1.), .6);
        // vec4 pinc = vec4(.4, .0, .6, .5);
	    // fragColor= vec4(sqrt(render( ro, rd )), 1.);
        
}
void main(){
    mainImage(gl_FragColor, gl_FragCoord.xy);
}