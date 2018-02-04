module TSC {
    export enum ErrorType {
        InvalidToken = "InvalidToken",
        MissingCommentEnd = "MissingCommentEnd"
    }
    export class Error {
        type: ErrorType;
        value: String;

        constructor(tokenType: ErrorType, value: String) {
            this.type = tokenType;
            this.value = value;
        }
    }
}