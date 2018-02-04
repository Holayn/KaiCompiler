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
        TPrint = "TPrint"
    }

    export class Token {

        type: TokenType;
        value: String;
        lineNumber: number;

        constructor(tokenType: TokenType, value: String, lineNumber: number) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
        }
    }
}