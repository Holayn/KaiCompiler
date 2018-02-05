module TSC {
    
    export enum TokenType {
        TId = "TId",
        TLbrace = "TLbrace",
        TRbrace = "TRbrace",
        TEop = "TEop",
        TDigit = "TDigit",
        TIntop = "TIntop",
        TBoolval = "TBoolval",
        TType = "TType",
        TAssign = "TAssign",
        TBoolop = "TBoolop",
        TWhile = "TWhile",
        TIf = "TIf",
        TPrint = "TPrint",
        TRparen = "TRparen",
        TLparen = "TLparen"
    }

    export class Token {

        type: TokenType;
        value: String;
        lineNumber: number;
        colNumber: number;

        constructor(tokenType: TokenType, value: String, lineNumber: number, colNumber: number) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
            this.colNumber = colNumber;
        }
    }
}