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
})(TSC || (TSC = {}));
