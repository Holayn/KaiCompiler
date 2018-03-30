var TSC;
(function (TSC) {
    var ScopeObject = /** @class */ (function () {
        function ScopeObject() {
            this.initialized = false;
        }
        return ScopeObject;
    }());
    TSC.ScopeObject = ScopeObject;
    var ScopeNode = /** @class */ (function () {
        function ScopeNode() {
            this.table = {};
        }
        return ScopeNode;
    }());
    TSC.ScopeNode = ScopeNode;
})(TSC || (TSC = {}));
