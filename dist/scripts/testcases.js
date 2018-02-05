/* --------
   testcases.ts

   Loads testcases into editor
   -------- */
var TSC;
(function (TSC) {
    var Testcases = /** @class */ (function () {
        function Testcases() {
        }
        Testcases.load = function (testcase) {
            switch (testcase) {
                case "Simple 1":
                    document.getElementById("taSourceCode").value = "/* This is a simple program with no operations */\n{}$";
                    break;
                case "Simple 2":
                    document.getElementById("taSourceCode").value = "/* This is a simple program with no operations */\n{}$";
                    break;
            }
        };
        return Testcases;
    }());
    TSC.Testcases = Testcases;
})(TSC || (TSC = {}));
