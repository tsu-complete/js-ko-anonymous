
;(function ( factory ) {
    "use strict";

    if ("function" === typeof define && define.amd) {
        define(["knockout"], factory);
    } else if ("undefined" !== typeof module) {
        factory(require("knockout"));
    } else {
        factory(window.ko);
    }

})(function ( ko ) {
    "use strict";



    return ko;
});

