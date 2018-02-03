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
				// A lexeme is a sequence of characters in the source that we match to a pattern for a token.
				// When a lexeme matches a pattern, create a new instance of that token.
				// Take the input and create tokens
				// Have a RegExp for each kind of token
				
				// Define array to return tokens in
				let tokens = [];


				// Iterate through the input, creating tokens out of lexemes
				let startLexemePtr = 0;
				let endLexemePtr = 1;

				// Look at each character? fill a buffer?
				// Match regular expression to substrings?
				// i.e. whietrue
				// does w match to anything? id
				// does wh match to anything? nope. so wat do?
				// h -> id. i -> id. e -> id. t -> id
				// t -> id. r -> id. u -> id. e -> ohshitakeyword. how know? bc previous was 't' 'r' 'u'. so keep track of previous token.
				// we match the current buffer to the regexp for boolval. if adding character yields match, we know we just hit a keyword.
				// so remove last four tokens, which have been identified as identifiers, and put true token instead.
				// what's in the buffer? and when to update? when we hit a match? so then wouldn't it always be updating? when we hit a keyword?
				// keep buffer of characters being read. if letter, add to buffer. when this buffer matches a reserved keyword (i.e. while, if, int, string, boolean)
				// if not letter, clear buffer. 
				// if double quote, collect chars until end double quote. unexpected chars?
				// if space character, ignore... or clear buffer?	
				// if digit and previous token is digit (not space), error.
				// or rather, keep adding characters to buffer. when add character, match it to token (i.e. id, lbrace, digit). if added token doesn't match previous token type, clear buffer.
				// if match keyword, do aforementioned, clear buffer.
				// longest possible match performed.
				// if c add and we match, entire thing, then
				// /while$/
				// whil matches char/id
				// whi   whie     whiet     whietr  whietru    whietrue <- true matches to this
				// how to know true is keyword, not a bunch of ids put together

				// RegExp for Left Brace
				let rLBRACE = new RegExp('{$');
				// RegExp for Right Brace
				let rRBRACE = new RegExp('}$');
				// RegExp for EOP
				let rEOP = new RegExp('\\$$');
				// RegExp for ID (same as Character)
				let rID = new RegExp('[a-z]$');
				// RegExp for whitespace
				let rWHITE = new RegExp(' |\t|\n|\r');

				// Run Regular Expression matching on the buffer of characters we have so far
				while(endLexemePtr <= sourceCode.length){
					console.log(sourceCode.substring(startLexemePtr, endLexemePtr));
					console.log(endLexemePtr);
					// Test for ID
					// If the character we just "added" to the buffer we're looking at creates a match...
					// In this case, create a new Token for character
					if(rID.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TId, sourceCode.charAt(endLexemePtr-1));
						tokens.push(token);
					}

					// Test for Left Brace
					else if(rLBRACE.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TLbrace, sourceCode.charAt(endLexemePtr-1));
						tokens.push(token);
					}

					// Test for Right Brace
					else if(rRBRACE.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TRbrace, sourceCode.charAt(endLexemePtr-1));
						tokens.push(token);
					}

					// If whitespace, "clear" the buffer, aka set startLexemePtr to endLexemePtr
					// We ignore whitespace
					else if(rWHITE.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						console.log("WHITESPACE");
						startLexemePtr = endLexemePtr;
					}

					// If EOP, "clear" the buffer, aka set startLexemePtr to endLexemePtr
					// Also, add a EOP token
					else if(rEOP.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						console.log("EOP");
						var token: Token = new Token(TSC.TokenType.TEop, sourceCode.charAt(endLexemePtr-1));
						tokens.push(token);
						startLexemePtr = endLexemePtr;
					}





					endLexemePtr++;
				}

				console.log(tokens);

				// TODO: Comments

				// // Iterate through the input
				// let sourceCodePtr = 0;
				// while(sourceCodePtr < sourceCode.length){

				// 	// RegExp for Left Brace
				// 	let rLBRACE = new RegExp('{');
				// 	// RegExp for Right Brace
				// 	let rRBRACE = new RegExp('}');
				// 	// RegExp for EOP
				// 	let rEOP = new RegExp('\\$');
				// 	// RegExp for Character
				// 	let rCHAR = new RegExp('[a-z]');
				// // RegExp for ID (same as Character)
				// let rID = new RegExp('[a-z]');
				// 	// RegExp for Space
				// 	let rSPACE = new RegExp(' +');
				// 	// RegExp for Digit
				// 	let rDIGIT = new RegExp('[0-9]');
				// 	// RegExp for BoolOp
				// 	let rBOOLOP = new RegExp('== | \\!=');
				// 	// RegExp for IntOp
				// 	let rINTOP = new RegExp('\\+');
				// 	// RegExp for BoolVal
				// 	let rBOOLVAL = new RegExp('false | true');
				// 	// RegExp for Type
				// 	let rTYPE = new RegExp('int | string | boolean');

				// 	// Test for Left Brace
				// 	if(rLBRACE.test(sourceCode.charAt(sourceCodePtr))){
				// 		console.log("LBRACE");
				// 		// Create a new TLBrace token and add it to the array
				// 		var token: Token = Token.TLBrace;
				// 		tokens.push(token);
				// 	}
				// 	// Test for Right Brace
				// 	else if(rRBRACE.test(sourceCode.charAt(sourceCodePtr))){
				// 		console.log("RBRACE");
				// 		// Create a new TRBrace token and add it to the array
				// 		var token: Token = Token.TRBrace;
				// 		tokens.push(token);
				// 	}
				// 	// Test for EOP
				// 	else if(sourceCode.charAt(sourceCodePtr).match(rEOP)){
				// 		console.log("EOP");
				// 		// Create a new TEOP token and add it to the array
				// 		var token: Token = Token.TEOP;
				// 		tokens.push(token);
				// 	}
				// 	// Test for character
				// 	else if(sourceCode.charAt(sourceCodePtr).match(rCHAR)){
				// 		console.log("CHAR");
				// 		// Create a new Tchar token and add it to the array
				// 		var token: Token = Token.Tchar;
				// 		tokens.push(token);
				// 	}
				// 	// Test for Space
				// 	else if(sourceCode.charAt(sourceCodePtr).match(rSPACE)){
				// 		console.log("SPACE");
				// 		// Create a new Tspace token and add it to the array
				// 		var token: Token = Token.Tspace;
				// 		tokens.push(token);
				// 	}
				// 	// Test for Digit
				// 	else if(sourceCode.charAt(sourceCodePtr).match(rDIGIT)){
				// 		console.log("DIGIT");
				// 		// Create a new Tdigit token and add it to the array
				// 		var token: Token = Token.Tdigit;
				// 		tokens.push(token);
				// 	}
				// 	// Test for Boolean Operation
				// 	else if(sourceCode.charAt(sourceCodePtr).match(rBOOLOP)){
				// 		console.log("BOOLOP");
				// 		// Create a new Tboolop token and add it to the array
				// 		var token: Token = Token.Tboolop;
				// 		tokens.push(token);
				// 	}
				// 	// Test for Integer Operation
				// 	else if(sourceCode.charAt(sourceCodePtr).match(rINTOP)){
				// 		console.log("INTOP");
				// 		// Create a new Tintop token and add it to the array
				// 		var token: Token = Token.Tintop;
				// 		tokens.push(token);
				// 	}
				// 	// Test for Boolean Value
				// 	else if(sourceCode.charAt(sourceCodePtr).match(rBOOLVAL)){
				// 		console.log("BOOLVAL");
				// 		// Create a new Tboolval token and add it to the array
				// 		var token: Token = Token.Tboolval;
				// 		tokens.push(token);
				// 	}
				// 	// Test for Type
				// 	else if(sourceCode.charAt(sourceCodePtr).match(rTYPE)){
				// 		console.log("TYPE");
				// 		// Create a new Ttype token and add it to the array
				// 		var token: Token = Token.Ttype;
				// 		tokens.push(token);
				// 	}

				// 	// Catch for unrecognized tokens
				// 	else{
				// 		console.log("ERROR: Unrecognized token " + sourceCode.charAt(sourceCodePtr));
				// 	}
					
				// 	sourceCodePtr++;

				// }
				
				
				



		        // TODO: remove all spaces in the middle; remove line breaks too.
		        return sourceCode;
		    }
		}
	}
	}
