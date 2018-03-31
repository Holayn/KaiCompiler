/**
 * This is the Error class and the ErrorType enumeration, used to
 * hold information about an error.
 */
module TSC {
    export enum ErrorType {
        InvalidToken = "InvalidToken",
        MissingCommentEnd = "MissingCommentEnd",
        InvalidCharacterInString = "InvalidCharacterInString",
        MissingStringEndQuote = "MissingStringEndQuote",
        DuplicateVariable = "DuplicateVariable",
        UndeclaredVariable = "UndeclaredVariable"
    }
    export class Error {
        type: ErrorType;
        value: String;
        lineNumber: number;
        colNumber: number;

        constructor(tokenType: ErrorType, value: String, lineNumber: number, colNumber: number) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
            this.colNumber = colNumber;
        }
    }
    export class ScopeError extends Error {
        scopeLine: number;
        scopeCol: number;
        super(){
        }
        public setScopeLineCol(scopeLine, scopeCol){
            this.scopeLine = scopeLine;
            this.scopeCol = scopeCol;
        }
    }
}