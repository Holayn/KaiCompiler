var TSC;
(function (TSC) {
    var Token = /** @class */ (function () {
        function Token(tokenType, value) {
            this.type = tokenType;
            this.value = value;
        }
        return Token;
    }());
    TSC.Token = Token;
})(TSC || (TSC = {}));
