/**
 * This is the parser, which takes the tokens generated by the lexer
 * and validates their ordering with the provided grammar.
 * Produces a CST.
 * Traverse inorder DFS.
 * Top-down recursive descent parser on an LL(1) grammar.
 */
var TSC;
(function (TSC) {
    var Parser = /** @class */ (function () {
        function Parser() {
        }
        Parser.prototype.init = function (tokens) {
            this.tokenList = tokens;
            // Set current token to the first token in the list
            this.currentToken = 0;
        };
        // ---------------------------- NON-TERMINALS -------------------------------- //
        // Due to the brilliance of JavaScript's short-circuit evaluation, our
        // lives are made way easier. i.e. false && (anything) is false, JS
        // will not eval anything after the first expression if it is false. Bless
        Parser.prototype.parse = function (tokens) {
            console.log(tokens);
            this.init(tokens);
            if (this.parseProgram()) {
                // do something
            }
        };
        Parser.prototype.parseProgram = function () {
            if (this.parseBlock() && this.matchEOP) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseBlock = function () {
            if (this.matchLbrace() && this.parseStatementList() && this.matchRbrace()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseStatementList = function () {
            if (this.parseStatement() && this.parseStatementList()) {
                console.log("jesus christ it's jesus christ");
                return true;
            }
            else {
                console.log("jesus christ it's jason bourne");
                return true;
            }
        };
        Parser.prototype.parseStatement = function () {
            if (this.parsePrintStatement() || this.parseAssignmentStatement() || this.parseVarDecl() || this.parseWhileStatement() || this.parseIfStatement() || this.parseBlock()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parsePrintStatement = function () {
            if (this.matchPrint() && this.matchLparen() && this.parseExpr() && this.matchRparen()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseAssignmentStatement = function () {
            if (this.parseId() && this.matchAssign() && this.parseExpr()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseVarDecl = function () {
            if (this.matchType() && this.parseId()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseWhileStatement = function () {
            if (this.matchWhile() && this.parseBooleanExpr() && this.parseBlock()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseIfStatement = function () {
            if (this.matchIf() && this.parseBooleanExpr() && this.parseBlock()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseExpr = function () {
            if (this.parseIntExpr() || this.parseStringExpr() || this.parseBooleanExpr() || this.parseId()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseIntExpr = function () {
            if (this.matchDigit() && this.matchIntop() && this.parseExpr()) {
                return true;
            }
            else if (this.matchDigit()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseStringExpr = function () {
            if (this.matchQuote() && this.parseCharList() && this.matchQuote()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseBooleanExpr = function () {
            if (this.matchLparen() && this.parseExpr() && this.matchBoolop() && this.parseExpr() && this.matchRparen()) {
                return true;
            }
            else if (this.matchBoolval()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseId = function () {
            if (this.matchChar()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseCharList = function () {
            if (this.matchChar() && this.parseCharList()) {
                return true;
            }
            else if (this.matchSpace() && this.parseCharList()) {
                return true;
            }
            else {
                // epsilon
                return true;
            }
        };
        // ---------------------------- TERMINALS -------------------------------- //
        // if next token we're looking at match to a terminal symbol, advance the current token
        // if error, break out of parse
        Parser.prototype.matchEOP = function () {
        };
        Parser.prototype.matchLbrace = function () {
            if (this.tokenList[this.currentToken].type == TSC.TokenType.TLbrace) {
                this.currentToken++;
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.matchRbrace = function () {
            if (this.tokenList[this.currentToken].type == TSC.TokenType.TRbrace) {
                this.currentToken++;
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.matchPrint = function () {
            if (this.tokenList[this.currentToken].type == TSC.TokenType.TPrint) {
                this.currentToken++;
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.matchLparen = function () {
            if (this.tokenList[this.currentToken].type == TSC.TokenType.TLparen) {
                this.currentToken++;
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.matchRparen = function () {
            if (this.tokenList[this.currentToken].type == TSC.TokenType.TRparen) {
                this.currentToken++;
                return true;
            }
            else {
                return false;
            }
        };
        Parser.prototype.matchAssign = function () {
        };
        Parser.prototype.matchWhile = function () {
        };
        Parser.prototype.matchIf = function () {
        };
        Parser.prototype.matchQuote = function () {
        };
        Parser.prototype.matchType = function () {
        };
        Parser.prototype.matchChar = function () {
        };
        Parser.prototype.matchSpace = function () {
        };
        Parser.prototype.matchDigit = function () {
        };
        Parser.prototype.matchBoolop = function () {
        };
        Parser.prototype.matchBoolval = function () {
        };
        Parser.prototype.matchIntop = function () {
        };
        return Parser;
    }());
    TSC.Parser = Parser;
})(TSC || (TSC = {}));
