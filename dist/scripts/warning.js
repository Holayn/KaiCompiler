var TSC;
(function (TSC) {
    var WarningType;
    (function (WarningType) {
        WarningType["MissingEOP"] = "MissingEOP";
    })(WarningType = TSC.WarningType || (TSC.WarningType = {}));
    var Warning = /** @class */ (function () {
        function Warning(tokenType, value) {
            this.type = tokenType;
            this.value = value;
        }
        return Warning;
    }());
    TSC.Warning = Warning;
})(TSC || (TSC = {}));
