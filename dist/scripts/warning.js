/**
 * Class and Enumeration for Warning that holds information
 * about different types of warnings that may be generated when
 * compiling source code.
 */
var TSC;
(function (TSC) {
    var WarningType;
    (function (WarningType) {
        WarningType["MissingEOP"] = "MissingEOP";
    })(WarningType = TSC.WarningType || (TSC.WarningType = {}));
    var Warning = /** @class */ (function () {
        function Warning(tokenType, value, lineNumber, colNumber) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
            this.colNumber = colNumber;
        }
        return Warning;
    }());
    TSC.Warning = Warning;
})(TSC || (TSC = {}));
