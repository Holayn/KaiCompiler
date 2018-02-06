module TSC {
    export enum ErrorType {
        InvalidToken = "InvalidToken",
        MissingCommentEnd = "MissingCommentEnd",
        InvalidCharacterInString = "InvalidCharacterInString",
        MissingStringEndQuote = "MissingStringEndQuote"
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
}