/**
 * This is the Token class and TokenType enumeration, which represents 
 * the Token object that is used to store information about the tokens 
 * generated during lexical analysis.
 */

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
        TLparen = "TLparen",
        TQuote = "TQuote",
        TChar = "TChar",
        TSpace = "TSpace",
        TString = "TString"
    }

    export class Token {

        type: TokenType;
        value: any;
        lineNumber: number;
        colNumber: number;

        constructor(tokenType: TokenType, value: any, lineNumber: number, colNumber: number) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
            this.colNumber = colNumber;
        }
    }

    /**
     * This class is a special kind of Token for identifiers, which will keep track
     * of what scope the identifier is in
     */
    export class IdentifierToken extends Token {
        scopeId: number;
        constructor(tokenType: TokenType, value: any, lineNumber: number, colNumber: number, scopeId: number){
            super(tokenType, value, lineNumber, colNumber);
            this.scopeId = scopeId;
        }
    }
}