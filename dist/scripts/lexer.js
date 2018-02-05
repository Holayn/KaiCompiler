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
                console.log("Source code: " + sourceCode);
                // Define array to return tokens in
                var tokens_1 = [];
                // Define array to return errors in
                var errors = [];
                // Define array to return warnings in
                var warnings = [];
                // Pointers that make up the buffer of characters we are matching to
                var startLexemePtr = 0;
                var endLexemePtr = 1;
                // Tracker for current line number
                var lineNumber = 1;
                // Tracker for current col
                var colNumber = 0;
                // We need to recognize different tokens.
                // Thus, we need to have the different patterns for each token defined.
                // A lexeme is a sequence of characters in the source that we match to a pattern for a token.
                // When a lexeme matches a pattern, create a new instance of that token.
                // Take the input and create tokens
                // Have a RegExp for each kind of token
                // RegExp for Left Brace
                var rLBRACE = new RegExp('{$');
                // RegExp for Right Brace
                var rRBRACE = new RegExp('}$');
                // RegExp for Left Paren
                var rLPAREN = new RegExp('\\($');
                // RegExp for Right Paren
                var rRPAREN = new RegExp('\\)$');
                // RegExp for Quote
                var rQUOTE = new RegExp('"$');
                // RegExp for EOP
                var rEOP = new RegExp('\\$$');
                // RegExp for ID
                var rID = new RegExp('[a-z]$');
                // RegExp for Character
                var rCHAR = new RegExp('[a-z]$| $');
                // RegExp for whitespace
                var rWHITE = new RegExp(' $|\t$|\n$|\r$');
                // RegExp for newline
                var rNEWLINE = new RegExp('\n$');
                // RegExp for Digit
                var rDIGIT = new RegExp('[0-9]$');
                // RegExp for IntOp
                var rINTOP = new RegExp('\\+$');
                // RegExp for BoolVal for true
                var rBOOLVALTRUE = new RegExp('true$');
                // RegExp for BoolVal for false
                var rBOOLVALFALSE = new RegExp('false$');
                // RegExp for While
                var rWHILE = new RegExp('while$');
                // RegExp for If
                var rIF = new RegExp('if$');
                // RegExp for Print
                var rPRINT = new RegExp('print$');
                // RegExp for Type Int
                var rTYPEINT = new RegExp('int$');
                // RegExp for Type Boolean
                var rTYPEBOOL = new RegExp('boolean$');
                // RegExp for Type String
                var rTYPESTR = new RegExp('string$');
                // RegExp for AssignmentOp
                var rASSIGN = new RegExp('\=$');
                // RegExp for BoolOp Equals
                var rBOOLOPEQUALS = new RegExp('\=\=$');
                // RegExp for BoolOp NotEquals
                var rBOOLOPNOTEQUALS = new RegExp('\\!=$');
                // RegExp for Comment Start
                var rCOMMENTSTART = new RegExp('/\\*$');
                // RegExp for Comment End
                var rCOMMENTEND = new RegExp('\\*/$');
                // Keeps track of the lexer is currently in a comment block
                var inComment = false;
                // Keeps track if we've run into EOP
                var foundEOP = false;
                // Keeps track if we've run into a quotation mark
                var foundQuote = false;
                // Pointer to keep track of quotation mark
                var startQuoteIndex = 0;
                // Pointer to keep track of quotation mark in tokens array
                var startQuoteArrayIndex = 0;
                // Run Regular Expression matching on the buffer of characters we have so far
                // If the character we just "added" to the buffer we're looking at creates a match...
                // Create a new Token for match
                // Iterate through the input, creating tokens out of lexemes
                // Runtime: O(n^2) where n is length of source code. One pass is performed over source code, 
                // with each iteration performing an O(n) regular expression check
                while (endLexemePtr <= sourceCode.length) {
                    console.log(sourceCode.substring(startLexemePtr, endLexemePtr));
                    console.log(endLexemePtr);
                    //We're iterating through the program, so that means we haven't found the EOP
                    foundEOP = false;
                    // If the lexer is currently looking in a comment block, just ignore input
                    // Also perform check to see if comment end has been reached.
                    if (inComment) {
                        if (rCOMMENTEND.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                            inComment = false;
                        }
                        endLexemePtr++;
                        continue;
                    }
                    // Test for Left Brace
                    if (rLBRACE.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TLbrace, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                    }
                    else if (rRBRACE.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TRbrace, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                    }
                    else if (rLPAREN.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TLparen, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                    }
                    else if (rRPAREN.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TRparen, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                    }
                    else if (rQUOTE.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TQuote, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                        if (!foundQuote) {
                            // We've reached the beginning quote
                            foundQuote = true;
                            // We need to keep track of where the first quote is so we if run into another quote
                            startQuoteIndex = endLexemePtr;
                            startQuoteArrayIndex = tokens_1.length - 1;
                        }
                        else {
                            // We've reached the end quote
                            foundQuote = false;
                            // Transform everything between beginning quote and end quote to Character Tokens
                            // First, we need to remove previous tokens added from the start quote and onwards
                            tokens_1 = tokens_1.slice(0, startQuoteArrayIndex + 1);
                            // Readjust colNumber and lineNumber
                            colNumber = startQuoteIndex;
                            lineNumber = tokens_1[tokens_1.length - 1].lineNumber;
                            for (var i = (startQuoteIndex); i < (endLexemePtr - 1); i++) {
                                if (rCHAR.test(sourceCode.charAt(i))) {
                                    var token = new TSC.Token(TSC.TokenType.TChar, sourceCode.charAt(i), lineNumber, colNumber);
                                    tokens_1.push(token);
                                    colNumber++;
                                }
                                else {
                                    // If we run into a character that does not match a Character, throw an error
                                    console.log("ERROR: Invalid character in String");
                                    var char = sourceCode.charAt(i);
                                    if (char == "\n") {
                                        char = "\\n";
                                    }
                                    errors.push(new TSC.Error(TSC.ErrorType.InvalidCharacterInString, char, lineNumber, colNumber));
                                    break;
                                }
                            }
                            if (errors.length != 0) {
                                break;
                            }
                            // Add on final quote to tokens
                            tokens_1.push(new TSC.Token(TSC.TokenType.TQuote, '"', lineNumber, colNumber));
                        }
                    }
                    else if (rBOOLVALTRUE.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TBoolval, "true", lineNumber, colNumber - ("true".length - 1));
                        // We have to remove the IDs that have been identified and added to the tokens array
                        // 4 ID tokens have been added - "t", "r", "u", "e"... remove them from the array
                        tokens_1 = tokens_1.slice(0, tokens_1.length - ("true".length - 1));
                        tokens_1.push(token);
                    }
                    else if (rBOOLVALFALSE.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TBoolval, "false", lineNumber, colNumber - ("false".length - 1));
                        // We have to remove the IDs that have been identified and added to the tokens array
                        // 5 ID tokens have been added - "f", "a", "l", "s"... remove them from the array
                        tokens_1 = tokens_1.slice(0, tokens_1.length - ("false".length - 1));
                        tokens_1.push(token);
                    }
                    else if (rWHILE.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TWhile, "while", lineNumber, colNumber - ("while".length - 1));
                        // We have to remove the IDs that have been identified and added to the tokens array
                        // 4 ID tokens have been added - "w", "h", "i", "l"... remove them from the array
                        tokens_1 = tokens_1.slice(0, tokens_1.length - ("while".length - 1));
                        tokens_1.push(token);
                    }
                    else if (rIF.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TIf, "if", lineNumber, colNumber - ("if".length - 1));
                        // We have to remove the IDs that have been identified and added to the tokens array
                        // 1 ID token has been added - "i"... remove them from the array
                        tokens_1 = tokens_1.slice(0, tokens_1.length - ("if".length - 1));
                        tokens_1.push(token);
                    }
                    else if (rPRINT.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TPrint, "print", lineNumber, colNumber - ("print".length - 1));
                        // We have to remove the IDs that have been identified and added to the tokens array
                        // 4 ID tokens have been added - "p", "r", "i", "n"... remove them from the array
                        tokens_1 = tokens_1.slice(0, tokens_1.length - ("print".length - 1));
                        tokens_1.push(token);
                    }
                    else if (rTYPEINT.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TType, "int", lineNumber, colNumber - ("int".length - 1));
                        // We have to remove the IDs that have been identified and added to the tokens array
                        // 2 ID tokens have been added - "i", "n" ... remove them from the array
                        tokens_1 = tokens_1.slice(0, tokens_1.length - ("int".length - 1));
                        tokens_1.push(token);
                    }
                    else if (rTYPEBOOL.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TType, "boolean", lineNumber, colNumber - ("boolean".length - 1));
                        // We have to remove the IDs that have been identified and added to the tokens array
                        // 6 ID tokens have been added - "b", "o", "o", "l", "e", "a" ... remove them from the array
                        tokens_1 = tokens_1.slice(0, tokens_1.length - ("boolean".length - 1));
                        tokens_1.push(token);
                    }
                    else if (rTYPESTR.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TType, "string", lineNumber, colNumber - ("string".length - 1));
                        // We have to remove the IDs that have been identified and added to the tokens array
                        // 5 ID tokens have been added - "s", "t", "r", "i", "n" ... remove them from the array
                        tokens_1 = tokens_1.slice(0, tokens_1.length - ("string".length - 1));
                        tokens_1.push(token);
                    }
                    else if (rDIGIT.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TDigit, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                    }
                    else if (rINTOP.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TIntop, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                    }
                    else if (rASSIGN.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TAssign, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                    }
                    else if (rBOOLOPEQUALS.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TBoolop, "==", lineNumber, colNumber - ("==".length - 1));
                        // We have to remove the assign that has been identified and added to the tokens array
                        tokens_1.pop();
                        tokens_1.push(token);
                    }
                    else if (rID.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        var token = new TSC.Token(TSC.TokenType.TId, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                    }
                    else if (rWHITE.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        console.log("WHITESPACE");
                        if (rNEWLINE.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                            console.log("NEWLINE");
                            lineNumber++;
                            colNumber = -1;
                        }
                        startLexemePtr = endLexemePtr;
                    }
                    else if (rEOP.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                        console.log("EOP");
                        var token = new TSC.Token(TSC.TokenType.TEop, sourceCode.charAt(endLexemePtr - 1), lineNumber, colNumber);
                        tokens_1.push(token);
                        startLexemePtr = endLexemePtr;
                        foundEOP = true;
                        // Stop looking for an ending quote. The next quote found belongs to the next program
                        foundQuote = false;
                    }
                    else {
                        if (endLexemePtr == sourceCode.length - 1) {
                            // If code ends with a trailling start comment, throw error
                            if (rCOMMENTSTART.test(sourceCode.substring(startLexemePtr, endLexemePtr + 1))) {
                                errors.push(new TSC.Error(TSC.ErrorType.MissingCommentEnd, "*/", lineNumber, colNumber - ("*/".length - 1)));
                            }
                            else {
                                errors.push(new TSC.Error(TSC.ErrorType.InvalidToken, sourceCode.charAt(endLexemePtr), lineNumber, colNumber));
                            }
                            break;
                        }
                        // Check to see if the next character creates a match for a Boolean NotEquals
                        endLexemePtr++;
                        if (rBOOLOPNOTEQUALS.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                            var token = new TSC.Token(TSC.TokenType.TBoolop, "!=", lineNumber, colNumber);
                            // "!" is not a valid character by itself, so the lexer would throw an error when it reaches !, 
                            // as if doesn't know that it is followed by an = yet. Perhaps we can fix this by
                            // when recognizing an illegal characters, perform a 1-place lookahead to see if there is a match with anything.
                            tokens_1.push(token);
                        }
                        else if (rCOMMENTSTART.test(sourceCode.substring(startLexemePtr, endLexemePtr))) {
                            inComment = true;
                        }
                        else {
                            errors.push(new TSC.Error(TSC.ErrorType.InvalidToken, sourceCode.charAt(endLexemePtr - 2), lineNumber, colNumber));
                            break;
                        }
                    }
                    endLexemePtr++;
                    colNumber++;
                }
                // If we've reached the end of the source code, but no end comment has been found, throw an error
                if (inComment) {
                    errors.push(new TSC.Error(TSC.ErrorType.MissingCommentEnd, "*/", lineNumber, colNumber));
                }
                // If we've reached the end of the source and no EOP was detected, along with no errors, throw a warning
                if (!foundEOP && errors.length == 0) {
                    warnings.push(new TSC.Warning(TSC.WarningType.MissingEOP, "$", lineNumber, colNumber));
                }
                console.log(tokens_1);
                // Define an object to return values in
                var lexAnalysisRes = {
                    "tokens": tokens_1,
                    "errors": errors,
                    "warnings": warnings
                };
                // TODO: remove all spaces in the middle; remove line breaks too.
                return lexAnalysisRes;
            }
        };
        return Lexer;
    }());
    TSC.Lexer = Lexer;
})(TSC || (TSC = {}));
