/**
 * This is the Token class and TokenType enumeration, which represents
 * the Token object that is used to store information about the tokens
 * generated during lexical analysis.
 */
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
        TokenType["TRparen"] = "TRparen";
        TokenType["TLparen"] = "TLparen";
        TokenType["TQuote"] = "TQuote";
        TokenType["TChar"] = "TChar";
    })(TokenType = TSC.TokenType || (TSC.TokenType = {}));
    var Token = /** @class */ (function () {
        function Token(tokenType, value, lineNumber, colNumber) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
            this.colNumber = colNumber;
        }
        return Token;
    }());
    TSC.Token = Token;
})(TSC || (TSC = {}));
