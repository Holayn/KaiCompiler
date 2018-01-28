/* lexer.ts  */

module TSC
	{
	export class Lexer {
		public static lex() {
		    {
		        // Grab the "raw" source code.
		        var sourceCode = (<HTMLInputElement>document.getElementById("taSourceCode")).value;
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
				enum Token {
					TLBrace,
					TRBrace
				}

				// Define array to return tokens in
				let tokens = [];

				// Iterate through the input
				let sourceCodePtr = 0;
				while(sourceCodePtr < sourceCode.length){
					// RegExp for Left Brace
					let rLBRACE = new RegExp('{');
					if(rLBRACE.test(sourceCode.charAt(sourceCodePtr))){
						// Create a new TLBRACE token and add it to the array
						var token: Token = Token.TLBrace
						tokens.push(token);
					}

					// RegExp for Right Brace
					let rRBRACE = new RegExp('}');
					if(rRBRACE.test(sourceCode.charAt(sourceCodePtr))){
						// Create a new TLBRACE token and add it to the array
						var token: Token = Token.TRBrace
						tokens.push(token);
					}





					sourceCodePtr++;
				}
				
				
				



		        // TODO: remove all spaces in the middle; remove line breaks too.
		        return sourceCode;
		    }
		}
	}
	}
