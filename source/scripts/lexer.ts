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
				
				// Define array to return tokens in
				let tokens = [];
				// Define array to return errors in
				let errors = [];
				// Define array to return warnings in
				let warnings = [];
				// Pointers that make up the buffer of characters we are matching to
				let startLexemePtr = 0;
				let endLexemePtr = 1;

				// We need to recognize different tokens.
				// Thus, we need to have the different patterns for each token defined.
				// A lexeme is a sequence of characters in the source that we match to a pattern for a token.
				// When a lexeme matches a pattern, create a new instance of that token.
				// Take the input and create tokens
				// Have a RegExp for each kind of token

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
				
				// Keeps track of the lexer is currently in a comment block
				let inComment: boolean = false;
				// Keeps track if we've run into EOP
				let hasEOP: boolean = false;

				// Run Regular Expression matching on the buffer of characters we have so far
				// If the character we just "added" to the buffer we're looking at creates a match...
				// Create a new Token for match
				// Iterate through the input, creating tokens out of lexemes
				// Runtime: O(n^2) where n is length of source code. One pass is performed over source code, 
				// with each iteration performing an O(n) regular expression check

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

					// Test for Print
					else if(rPRINT.test(sourceCode.substring(startLexemePtr, endLexemePtr))){
						var token: Token = new Token(TSC.TokenType.TPrint, "print");
						// We have to remove the IDs that have been identified and added to the tokens array
						// 4 ID tokens have been added - "p", "r", "i", "n"... remove them from the array
						tokens = tokens.slice(0, tokens.length - ("print".length - 1));
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
						hasEOP = true;
					}

					// Catch for illegal characters
					else{
						if(endLexemePtr == sourceCode.length-1){
							// If code ends with a trailling start comment, throw error
							if(rCOMMENTSTART.test(sourceCode.substring(startLexemePtr, endLexemePtr+1))){
								errors.push(new Error(TSC.ErrorType.MissingCommentEnd, "*/"));
							}
							else{
								errors.push(new Error(TSC.ErrorType.InvalidToken, sourceCode.charAt(endLexemePtr)));
							}
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
							errors.push(new Error(TSC.ErrorType.InvalidToken, sourceCode.charAt(endLexemePtr-2)));
							break;
						}
					}
					endLexemePtr++;
				}	

				// If we've reached the end of the source code, but no end comment has been found, throw an error
				if(inComment){
					errors.push(new Error(TSC.ErrorType.MissingCommentEnd, "*/"));
				}

				// If we've reached the end of the source and no EOP was detected, throw a warning
				if(!hasEOP){
					warnings.push(new Warning(TSC.WarningType.MissingEOP, "$"));
				}

				console.log(tokens);

				// Define an object to return values in
				let lexAnalysisRes = {
					"tokens": tokens,
					"errors": errors,
					"warnings": warnings,
				};

		        // TODO: remove all spaces in the middle; remove line breaks too.
		        return lexAnalysisRes;
		    }
		}
	}
	}
