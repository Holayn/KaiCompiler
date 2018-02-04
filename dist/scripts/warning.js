var TSC;
(function (TSC) {
    var WarningType;
    (function (WarningType) {
        WarningType["MissingEOP"] = "MissingEOP";
    })(WarningType = TSC.WarningType || (TSC.WarningType = {}));
    var Warning = /** @class */ (function () {
        function Warning(tokenType, value, lineNumber) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
        }
        return Warning;
    }());
    TSC.Warning = Warning;
})(TSC || (TSC = {}));
