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
            if (this.parseBlock() && this.matchToken(TSC.TokenType.TEop)) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseBlock = function () {
            if (this.matchToken(TSC.TokenType.TLbrace) && this.parseStatementList() && this.matchToken(TSC.TokenType.TRbrace)) {
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
            if (this.matchToken(TSC.TokenType.TPrint) && this.matchToken(TSC.TokenType.TLparen) && this.parseExpr() && this.matchToken(TSC.TokenType.TRparen)) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseAssignmentStatement = function () {
            if (this.parseId() && this.matchToken(TSC.TokenType.TAssign) && this.parseExpr()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseVarDecl = function () {
            if (this.matchToken(TSC.TokenType.TType) && this.parseId()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseWhileStatement = function () {
            if (this.matchToken(TSC.TokenType.TWhile) && this.parseBooleanExpr() && this.parseBlock()) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseIfStatement = function () {
            if (this.matchToken(TSC.TokenType.TIf) && this.parseBooleanExpr() && this.parseBlock()) {
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
            if (this.matchToken(TSC.TokenType.TDigit) && this.matchToken(TSC.TokenType.TIntop) && this.parseExpr()) {
                return true;
            }
            else if (this.matchToken(TSC.TokenType.TDigit)) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseStringExpr = function () {
            if (this.matchToken(TSC.TokenType.TQuote) && this.parseCharList() && this.matchToken(TSC.TokenType.TQuote)) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseBooleanExpr = function () {
            if (this.matchToken(TSC.TokenType.TLparen) && this.parseExpr() && this.matchToken(TSC.TokenType.TBoolop) && this.parseExpr() && this.matchToken(TSC.TokenType.TRparen)) {
                return true;
            }
            else if (this.matchToken(TSC.TokenType.TBoolval)) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseId = function () {
            if (this.matchToken(TSC.TokenType.TChar)) {
                return true;
            }
            return false;
        };
        Parser.prototype.parseCharList = function () {
            // spaces are treated as chars for me
            if (this.matchToken(TSC.TokenType.TChar) && this.parseCharList()) {
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
        // Screw duplicated code
        Parser.prototype.matchToken = function (token) {
            if (this.tokenList[this.currentToken].type == token) {
                this.currentToken++;
                return true;
            }
            return false;
        };
        return Parser;
    }());
    TSC.Parser = Parser;
})(TSC || (TSC = {}));
