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
        // ---------------------------- NON-TERMINALS -------------------------------- //
        Parser.prototype.parse = function (tokens) {
            console.log(tokens);
            this.parseProgram();
        };
        Parser.prototype.parseProgram = function () {
            this.parseBlock();
            this.matchEOP();
        };
        Parser.prototype.parseBlock = function () {
            this.matchLBracket();
            this.parseStatementList();
            this.matchRBracket();
        };
        Parser.prototype.parseStatementList = function () {
            this.parseStatement();
            this.parseStatementList();
        };
        Parser.prototype.parseStatement = function () {
            this.parsePrintStatement();
            this.parseAssignmentStatement();
        };
        Parser.prototype.parsePrintStatement = function () {
        };
        Parser.prototype.parseAssignmentStatement = function () {
        };
        Parser.prototype.parseVarDecl = function () {
        };
        Parser.prototype.parseWhileStatement = function () {
        };
        Parser.prototype.parseIfStatement = function () {
        };
        Parser.prototype.parseExpr = function () {
        };
        Parser.prototype.parseIntExpr = function () {
        };
        Parser.prototype.parseStringExpr = function () {
        };
        Parser.prototype.parseBooleanExpr = function () {
        };
        Parser.prototype.parseId = function () {
        };
        Parser.prototype.parseCharList = function () {
        };
        // ---------------------------- TERMINALS -------------------------------- //
        Parser.prototype.matchEOP = function () {
        };
        Parser.prototype.matchLBracket = function () {
        };
        Parser.prototype.matchRBracked = function () {
        };
        Parser.prototype.matchPrint = function () {
        };
        Parser.prototype.matchLParen = function () {
        };
        Parser.prototype.matchRParen = function () {
        };
        Parser.prototype.matchWhile = function () {
        };
        Parser.prototype.matchIf = function () {
        };
        Parser.prototype.matchLQuote = function () {
        };
        Parser.prototype.matchRQuote = function () {
        };
        Parser.prototype.matchType = function () {
        };
        Parser.prototype.matchChar = function () {
        };
        Parser.prototype.matchSpace = function () {
        };
        Parser.prototype.matchDigit = function () {
        };
        Parser.prototype.matchBoolOp = function () {
        };
        Parser.prototype.matchBoolVal = function () {
        };
        Parser.prototype.matchIntOp = function () {
        };
        return Parser;
    }());
    TSC.Parser = Parser;
})(TSC || (TSC = {}));
