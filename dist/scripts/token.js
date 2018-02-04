var TSC;
(function (TSC) {
    var TokenType;
    (function (TokenType) {
        TokenType["TId"] = "TId";
        TokenType["TLbrace"] = "TLbrace";
        TokenType["TRbrace"] = "TRbrace";
        TokenType["TEop"] = "TEop";
        TokenType["TDigit"] = "TDigit";
        TokenType["TIntop"] = "TIntop";
        TokenType["TBoolval"] = "TBoolval";
        TokenType["TType"] = "TType";
        TokenType["TAssign"] = "TAssign";
        TokenType["TBoolop"] = "TBoolop";
        TokenType["TWhile"] = "TWhile";
        TokenType["TIf"] = "TIf";
        TokenType["TPrint"] = "TPrint";
    })(TokenType = TSC.TokenType || (TSC.TokenType = {}));
    var Token = /** @class */ (function () {
        function Token(tokenType, value, lineNumber) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
        }
        return Token;
    }());
    TSC.Token = Token;
})(TSC || (TSC = {}));
