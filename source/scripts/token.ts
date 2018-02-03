module TSC {
    
    export class Token {

        type: TokenType;
        value: String;

        constructor(tokenType: TokenType, value: String) {
            this.type = tokenType;
            this.value = value;
        }
    }
}