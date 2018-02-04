module TSC {
    export enum ErrorType {
        InvalidToken = "InvalidToken",
        MissingCommentEnd = "MissingCommentEnd"
    }
    export class Error {
        type: ErrorType;
        value: String;
        lineNumber: number;

        constructor(tokenType: ErrorType, value: String, lineNumber: number) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
        }
    }
}