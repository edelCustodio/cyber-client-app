var FFI = require('node-ffi');


// user32.dll
var user32 = new FFI.Library('user32', {
    'OpenInputDesktop': [
       'IntPtr', [ 'int32', 'bool', 'int32' ]
    ],
    'SwitchDesktop': [
        'int32', [ 'int32' ]
     ]
 });
