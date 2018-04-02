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
        UndeclaredVariable = "UndeclaredVariable",
        TypeMismatch = "TypeMismatch",
        IncorrectTypeComparison = "IncorrectTypeComparison",
        IncorrectIntegerExpression = "IncorrectIntegerExpression"
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
    // For Duplicate Variable and Undeclared Variable
    export class ScopeError extends Error {
        firstDeclareLine: number;
        firstDeclareCol: number;
        constructor(tokenType: ErrorType, value: String, lineNumber: number, colNumber: number, firstDeclareLine: number, firstDeclareCol: number) {
            super(tokenType, value, lineNumber, colNumber);
            this.firstDeclareLine = firstDeclareLine;
            this.firstDeclareCol = firstDeclareCol;
        }
    }
    // For Type Mismatch
    export class TypeError extends Error {
        targetType: VariableType;
        idType: VariableType;
        constructor(tokenType: ErrorType, value: String, lineNumber: number, colNumber: number, idType: VariableType, targetType: VariableType) {
            super(tokenType, value, lineNumber, colNumber);
            this.targetType = targetType;
            this.idType = idType;
        }
    }
}