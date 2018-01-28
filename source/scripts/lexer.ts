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
				console.log("Source code: " + sourceCode);
				// We need to recognize different tokens.
				// Thus, we need to have the different patterns for each token defined.
				// A lexeme is a sequence of characters in the source that matches a pattern for a token.
				// When a lexeme matches a pattern, create a new instance of that token.
				// Take the input and create tokens
				// Have a RegExp for each kind of token
				
				// Define an enumeration for tokens
				enum Token {
					TLBrace,
					TRBrace,
					Tchar,
					TSpace,
					EOP
				}

				// Define array to return tokens in
				let tokens = [];

				// Iterate through the input
				let sourceCodePtr = 0;
				while(sourceCodePtr < sourceCode.length){

					// RegExp for Left Brace
					let rLBRACE = new RegExp('{');
					// RegExp for Right Brace
					let rRBRACE = new RegExp('}');
					// RegExp for EOP
					let rEOP = new RegExp('\\$');
					// RegExp for Character
					let rCHAR = new RegExp('[a-z]');
					// RegExp for Space
					let rSPACE = new RegExp(' +');
					
					// Test for Left Brace
					if(rLBRACE.test(sourceCode.charAt(sourceCodePtr))){
						console.log("LBRACE");
						// Create a new TLBRACE token and add it to the array
						var token: Token = Token.TLBrace
						tokens.push(token);
					}
					// Test for Right Brace
					else if(rRBRACE.test(sourceCode.charAt(sourceCodePtr))){
						console.log("RBRACE");
						// Create a new TRBRACE token and add it to the array
						var token: Token = Token.TRBrace
						tokens.push(token);
					}
					// Test for EOP
					else if(sourceCode.charAt(sourceCodePtr).match(rEOP)){
						console.log("EOP");
						// Create a new EOP token and add it to the array
						var token: Token = Token.EOP
						tokens.push(token);
					}
					// Test for character
					else if(sourceCode.charAt(sourceCodePtr).match(rCHAR)){
						console.log("CHAR");
						// Create a new Tchar token and add it to the array
						var token: Token = Token.Tchar
						tokens.push(token);
					}
					// Test for Space
					else if(sourceCode.charAt(sourceCodePtr).match(rSPACE)){
						console.log("SPACE");
						// Create a new TSPACE token and add it to the array
						var token: Token = Token.TSpace
						tokens.push(token);
					}
					// Catch for unrecognized tokens
					else{
						console.log("ERROR: Unrecognized token " + sourceCode.charAt(sourceCodePtr));
					}
					
					sourceCodePtr++;

				}
				
				
				



		        // TODO: remove all spaces in the middle; remove line breaks too.
		        return sourceCode;
		    }
		}
	}
	}
