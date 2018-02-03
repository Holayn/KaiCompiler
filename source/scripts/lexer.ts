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
				// RegExp for Digit
				let rDIGIT = new RegExp('[0-9]$');
				// RegExp for IntOp
				let rINTOP = new RegExp('\\+');
				// RegExp for BoolVal for true
				let rBOOLVALTRUE = new RegExp('true$');
				// RegExp for BoolVal for false
				let rBOOLVALFALSE = new RegExp('false$');
				// RegExp for Type
				let rTYPE = new RegExp('int|string|boolean');
				// // RegExp for AssignmentOp
				// let rASSIGN = new RegExp('=$');
				// // RegExp for BoolOp
				// let rBOOLOP = new RegExp('==$ | \\!=$');

				// Run Regular Expression matching on the buffer of characters we have so far
				// If the character we just "added" to the buffer we're looking at creates a match...
				// Create a new Token for match
				while(endLexemePtr <= sourceCode.length){
					console.log(sourceCode.substring(startLexemePtr, endLexemePtr));
					console.log(endLexemePtr);

					// Test for Left Brace
					if(rLBRACE.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TLbrace, sourceCode.charAt(endLexemePtr-1));
						tokens.push(token);
					}

					// Test for Right Brace
					else if(rRBRACE.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TRbrace, sourceCode.charAt(endLexemePtr-1));
						tokens.push(token);
					}

					// Test for Boolean Value True
					else if(rBOOLVALTRUE.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TBoolval, "true");
						// We have to remove the IDs that have been identified and added to the tokens array
						// 4 ID tokens have been added - "t", "r", "u", "e"... remove them from the array
						tokens = tokens.slice(0, tokens.length - ("true".length - 1));
						tokens.push(token);
					}

					// Test for Boolean Value False
					else if(rBOOLVALFALSE.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TBoolval, "false");
						// We have to remove the IDs that have been identified and added to the tokens array
						// 5 ID tokens have been added - "f", "a", "l", "s"... remove them from the array
						tokens = tokens.slice(0, tokens.length - ("false".length - 1));
						tokens.push(token);
					}
					
					// Test for Digit
					else if(rDIGIT.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TDigit, sourceCode.charAt(endLexemePtr-1));
						tokens.push(token);
					}

					// Test for Integer Operation
					else if(rINTOP.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TIntop, sourceCode.charAt(endLexemePtr-1));
						tokens.push(token);
					}

					// Test for ID
					else if(rID.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TId, sourceCode.charAt(endLexemePtr-1));
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
