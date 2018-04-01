var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * This is the Error class and the ErrorType enumeration, used to
 * hold information about an error.
 */
var TSC;
(function (TSC) {
    var ErrorType;
    (function (ErrorType) {
        ErrorType["InvalidToken"] = "InvalidToken";
        ErrorType["MissingCommentEnd"] = "MissingCommentEnd";
        ErrorType["InvalidCharacterInString"] = "InvalidCharacterInString";
        ErrorType["MissingStringEndQuote"] = "MissingStringEndQuote";
        ErrorType["DuplicateVariable"] = "DuplicateVariable";
        ErrorType["UndeclaredVariable"] = "UndeclaredVariable";
        ErrorType["TypeMismatch"] = "TypeMismatch";
    })(ErrorType = TSC.ErrorType || (TSC.ErrorType = {}));
    var Error = /** @class */ (function () {
        function Error(tokenType, value, lineNumber, colNumber) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
            this.colNumber = colNumber;
        }
        return Error;
    }());
    TSC.Error = Error;
    // For Duplicate Variable and Undeclared Variable
    var ScopeError = /** @class */ (function (_super) {
        __extends(ScopeError, _super);
        function ScopeError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ScopeError.prototype["super"] = function () {
        };
        ScopeError.prototype.setFirstDeclareLineCol = function (firstDeclareLine, firstDeclareCol) {
            this.firstDeclareLine = firstDeclareLine;
            this.firstDeclareCol = firstDeclareCol;
        };
        return ScopeError;
    }(Error));
    TSC.ScopeError = ScopeError;
    // For Type Mismatch
    var TypeError = /** @class */ (function (_super) {
        __extends(TypeError, _super);
        function TypeError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TypeError.prototype["super"] = function () { };
        TypeError.prototype.setTypes = function (idType, targetType) {
            this.targetType = targetType;
            this.idType = idType;
        };
        return TypeError;
    }(Error));
    TSC.TypeError = TypeError;
})(TSC || (TSC = {}));
