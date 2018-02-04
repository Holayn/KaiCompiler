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
            if (testcase.innerHTML == "Basic 1") {
                document.getElementById("taSourceCode").value = "/* This is a simple program with no operations */\n{}$";
            }
        };
        return Testcases;
    }());
    TSC.Testcases = Testcases;
})(TSC || (TSC = {}));
