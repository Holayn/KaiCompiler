/* lexer.ts  */
var TSC;
(function (TSC) {
    var Lexer = /** @class */ (function () {
        function Lexer() {
        }
        Lexer.lex = function () {
            {
                // Grab the "raw" source code.
                var sourceCode = document.getElementById("taSourceCode").value;
                // Trim the leading and trailing spaces.
                sourceCode = TSC.Utils.trim(sourceCode);
                console.log(sourceCode);
                // We need to recognize different tokens.
                // Thus, we need to have the different patterns for each token defined.
                // A lexeme is a sequence of characters in the source that matches a pattern for a token.
                // When a lexeme matches a pattern, create a new instance of that token.
                // Take the input and create tokens
                // Have a RegExp for each kind of token
                // Define an enumeration for tokens
                var Token = void 0;
                (function (Token) {
                    Token[Token["TLBrace"] = 0] = "TLBrace";
                    Token[Token["TRBrace"] = 1] = "TRBrace";
                })(Token || (Token = {}));
                // Define array to return tokens in
                var tokens_1 = [];
                // Iterate through the input
                var sourceCodePtr = 0;
                while (sourceCodePtr < sourceCode.length) {
                    // RegExp for Left Brace
                    var rLBRACE = new RegExp('{');
                    if (rLBRACE.test(sourceCode.charAt(sourceCodePtr))) {
                        // Create a new TLBRACE token and add it to the array
                        var token = Token.TLBrace;
                        tokens_1.push(token);
                    }
                    // RegExp for Right Brace
                    var rRBRACE = new RegExp('}');
                    if (rRBRACE.test(sourceCode.charAt(sourceCodePtr))) {
                        // Create a new TLBRACE token and add it to the array
                        var token = Token.TRBrace;
                        tokens_1.push(token);
                    }
                    sourceCodePtr++;
                }
                // TODO: remove all spaces in the middle; remove line breaks too.
                return sourceCode;
            }
        };
        return Lexer;
    }());
    TSC.Lexer = Lexer;
})(TSC || (TSC = {}));
