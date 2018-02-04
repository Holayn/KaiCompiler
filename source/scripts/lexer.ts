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
				let rWHITE = new RegExp(' $|\t$|\n$|\r$');
				// RegExp for Digit
				let rDIGIT = new RegExp('[0-9]$');
				// RegExp for IntOp
				let rINTOP = new RegExp('\\+$');
				// RegExp for BoolVal for true
				let rBOOLVALTRUE = new RegExp('true$');
				// RegExp for BoolVal for false
				let rBOOLVALFALSE = new RegExp('false$');
				// RegExp for While
				let rWHILE = new RegExp('while$');
				// RegExp for If
				let rIF = new RegExp('if$');
				// RegExp for Print
				let rPRINT = new RegExp('print$');
				// RegExp for Type Int
				let rTYPEINT = new RegExp('int$');
				// RegExp for Type Boolean
				let rTYPEBOOL = new RegExp('boolean$');
				// RegExp for Type String
				let rTYPESTR = new RegExp('string$');
				// RegExp for AssignmentOp
				let rASSIGN = new RegExp('\=$');
				// RegExp for BoolOp Equals
				let rBOOLOPEQUALS = new RegExp('\=\=$');
				// RegExp for BoolOp NotEquals
				let rBOOLOPNOTEQUALS = new RegExp('\\!=$');
				// RegExp for Comment Start
				let rCOMMENTSTART = new RegExp('/\\*$');
				// RegExp for Comment End
				let rCOMMENTEND = new RegExp('\\*/$');

				let inComment: boolean = false;

				// Run Regular Expression matching on the buffer of characters we have so far
				// If the character we just "added" to the buffer we're looking at creates a match...
				// Create a new Token for match
				while(endLexemePtr <= sourceCode.length){
					console.log(sourceCode.substring(startLexemePtr, endLexemePtr));
					console.log(endLexemePtr);

					// If the lexer is currently looking in a comment block, just ignore input
					// Also perform check to see if comment end has been reached.
					if(inComment){
						if(rCOMMENTEND.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
							inComment = false;
						}
						endLexemePtr++;
						continue;
					}

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

					// ------------------------ KEYWORDS START ----------------------------

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

					// Test for While
					else if(rWHILE.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TWhile, "while");
						// We have to remove the IDs that have been identified and added to the tokens array
						// 4 ID tokens have been added - "w", "h", "i", "l"... remove them from the array
						tokens = tokens.slice(0, tokens.length - ("while".length - 1));
						tokens.push(token);
					}

					// Test for If
					else if(rIF.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TIf, "if");
						// We have to remove the IDs that have been identified and added to the tokens array
						// 1 ID token has been added - "i"... remove them from the array
						tokens = tokens.slice(0, tokens.length - ("if".length - 1));
						tokens.push(token);
					}

					// Test for Type Int
					else if(rTYPEINT.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TType, "int");
						// We have to remove the IDs that have been identified and added to the tokens array
						// 2 ID tokens have been added - "i", "n" ... remove them from the array
						tokens = tokens.slice(0, tokens.length - ("int".length - 1));
						tokens.push(token);
					}

					// Test for Type Bool
					else if(rTYPEBOOL.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TType, "boolean");
						// We have to remove the IDs that have been identified and added to the tokens array
						// 6 ID tokens have been added - "b", "o", "o", "l", "e", "a" ... remove them from the array
						tokens = tokens.slice(0, tokens.length - ("boolean".length - 1));
						tokens.push(token);
					}

					// Test for Type Str
					else if(rTYPESTR.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TType, "string");
						// We have to remove the IDs that have been identified and added to the tokens array
						// 5 ID tokens have been added - "s", "t", "r", "i", "n" ... remove them from the array
						tokens = tokens.slice(0, tokens.length - ("string".length - 1));
						tokens.push(token);
					}

					// Test for Print
					else if(rPRINT.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TPrint, "print");
						// We have to remove the IDs that have been identified and added to the tokens array
						// 4 ID tokens have been added - "p", "r", "i", "n"... remove them from the array
						tokens = tokens.slice(0, tokens.length - ("print".length - 1));
						tokens.push(token);
					}

					// ------------------------ KEYWORDS END ----------------------------
					
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

					// Test for Assign
					else if(rASSIGN.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TAssign, sourceCode.charAt(endLexemePtr-1));
						tokens.push(token);
					}

					// Test for Boolean Equals
					else if(rBOOLOPEQUALS.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TBoolop, "==");
						// We have to remove the assign that has been identified and added to the tokens array
						tokens.pop();
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

					// Catch for illegal characters
					else{
						if(endLexemePtr == sourceCode.length-1){
							console.log("ERROR: Unrecognized token");
							break;
						}
						// Check to see if the next character creates a match for a Boolean NotEquals
						endLexemePtr++;
						if(rBOOLOPNOTEQUALS.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
							var token: Token = new Token(TSC.TokenType.TBoolop, "!=");
							// "!" is not a valid character by itself, so the lexer would throw an error when it reaches !, 
							// as if doesn't know that it is followed by an = yet. Perhaps we can fix this by
							// when recognizing an illegal characters, perform a 1-place lookahead to see if there is a match with anything.
							tokens.push(token);
						}
						else if(rCOMMENTSTART.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
							inComment = true;
						}
						// Check to see if the next character creates a match for a comment
						// If so, we continue to ignore until we reach the end comment
						// If we don't reach the end comment, then return error
						else{
							console.log("ERROR: Unrecognized token");
							break;
						}
					}

					endLexemePtr++;
				}

				// If we've reached the end of the source code, but no end comment has been found, throw an error
				if(inComment){
					console.log("ERROR: Unrecognized token");
				}

				console.log(tokens);

		        // TODO: remove all spaces in the middle; remove line breaks too.
		        return sourceCode;
		    }
		}
	}
	}
