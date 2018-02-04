var TSC;
(function (TSC) {
    var ErrorType;
    (function (ErrorType) {
        ErrorType["InvalidToken"] = "InvalidToken";
        ErrorType["MissingCommentEnd"] = "MissingCommentEnd";
    })(ErrorType = TSC.ErrorType || (TSC.ErrorType = {}));
    var Error = /** @class */ (function () {
        function Error(tokenType, value, lineNumber) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
        }
        return Error;
    }());
    TSC.Error = Error;
})(TSC || (TSC = {}));
