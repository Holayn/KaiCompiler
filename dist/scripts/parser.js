/**
 * This is the parser, which takes the tokens generated by the lexer
 * and validates their ordering with the provided grammar.
 * Produces a CST.
 * Traverse inorder DFS.
 * Top-down recursive descent parser on an LL(1) grammar.
 */
var TSC;
(function (TSC) {
    var Production;
    (function (Production) {
        Production["Program"] = "Program";
        Production["Block"] = "Block";
        Production["Expr"] = "Expression";
        Production["Stmt"] = "Statement";
        Production["StmtList"] = "StatementList";
        Production["AssignStmt"] = "AssignmentStatement";
        Production["PrintStmt"] = "PrintStatement";
        Production["WhileStmt"] = "WhileStatement";
        Production["VarDecl"] = "VarDecl";
        Production["IfStmt"] = "IfStatement";
        Production["BooleanExpr"] = "BooleanExpression";
        Production["IntExpr"] = "IntegerExpression";
        Production["StringExpr"] = "StringExpression";
        Production["CharList"] = "CharList";
        Production["Id"] = "Id";
    })(Production = TSC.Production || (TSC.Production = {}));
    var Parser = /** @class */ (function () {
        // Constructor for parser, passed tokens from lexer. Inits values.
        function Parser(tokens) {
            this.tokenList = tokens;
            // Set current token to the first token in the list
            this.currentToken = 0;
            // Holds log messages generated by parser
            this.log = [];
            this.error = false;
            this.cst = new TSC.Tree();
        }
        // ---------------------------- NON-TERMINALS -------------------------------- //
        // Due to the brilliance of JavaScript's short-circuit evaluation, our
        // lives are made way easier. i.e. false && (anything) is false, JS
        // will not eval anything after the first expression if it is false. Praise!
        // I'm so lazy and I don't want to write out a million if statements.
        // Top-down recursive descent left->right leftmost derivation parser.
        // Each derivation returns true or false, flagging the success of following a
        // rewrite rule for a production.
        // I think most of the logic of the code is self-documenting if one refers to 
        // the grammar of the language.
        /**
         * Starts the parse of tokens passed in from the lexer
         */
        Parser.prototype.parse = function () {
            if (this.parseProgram()) {
                console.log("PARSER: success!");
            }
            else {
                console.log("PARSER: error");
            }
            console.log(this.log);
        };
        /**
         * Parses the tokens to see if they make up a Program, or a Block appended with an EOP marker
         */
        Parser.prototype.parseProgram = function () {
            if (this.parseBlock(Production.Program, true) && this.matchToken(TSC.TokenType.TEop, null, null, true)) {
                return true;
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a Block, or a ( StatementList )
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseBlock = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TLbrace, production, Production.Block, false) && this.parseStatementList(null, false) && this.matchToken(TSC.TokenType.TRbrace, null, null, true)) {
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting Block, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a StatementList, or a Statement StatementList, or epsilon
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseStatementList = function (production, expected) {
            if (this.parseStatement(Production.StmtList, false) && this.parseStatementList(Production.StmtList, false)) {
                return true;
            }
            else {
                return true;
            }
        };
        /**
         * Parses the tokens to see if they make up a Statement, or a PrintStatement, AssignStatement, WhileStatement, VarDecl, IfStatement, or Block
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseStatement = function (production, expected) {
            if (this.parsePrintStatement(Production.Stmt, false) || this.parseAssignmentStatement(Production.Stmt, false) || this.parseWhileStatement(Production.Stmt, false) ||
                this.parseVarDecl(Production.Stmt, false) || this.parseIfStatement(Production.Stmt, false) || this.parseBlock(Production.Stmt, false)) {
                return true;
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a PrintStatement, or a Print ( Expr )
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parsePrintStatement = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TPrint, production, Production.PrintStmt, false) && this.matchToken(TSC.TokenType.TLparen, null, null, true) &&
                this.parseExpr(Production.Expr, true) && this.matchToken(TSC.TokenType.TRparen, null, null, true)) {
                return true;
            }
            if (expected && !this.error) {
                this.log.push("ERROR - Expecting PrintStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up an AssignmentStatement, or an Id = Expr
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseAssignmentStatement = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TId, production, Production.AssignStmt, false) &&
                this.matchToken(TSC.TokenType.TAssign, null, null, true) && this.parseExpr(Production.Expr, true)) {
                return true;
            }
            if (expected && this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting AssignmentStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        /**
         * Parses the tokens to see if they make up a VarDecl, or a Type Id
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        Parser.prototype.parseVarDecl = function (production, expected) {
            if (this.matchToken(TSC.TokenType.TType, production, Production.VarDecl, false) &&
                this.parseId(null, true)) {
                return true;
            }
            if (expected && !this.error) {
                this.error = true;
                this.log.push("ERROR - Expecting VarDecl, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        Parser.prototype.parseWhileStatement = function () {
            console.log("PARSER: parsing a whilestatement");
            if (this.matchToken(TSC.TokenType.TWhile)) {
                console.log("PARSER: whilestatement found");
                this.log.push("VALID - Expecting Statement, found VarDecl");
                this.consumeToken(TSC.TokenType.TWhile);
                if (this.parseBooleanExpr(Production.While)) {
                    if (this.parseBlock()) {
                        return true;
                    }
                    this.error = true;
                    this.log.push("ERROR - Expecting Block, found " + this.tokenList[this.currentToken].type);
                }
                else {
                    this.error = true;
                    this.log.push("ERROR - Expecting BooleanExpr, found " + this.tokenList[this.currentToken].type);
                }
            }
            return false;
        };
        Parser.prototype.parseIfStatement = function () {
            console.log("PARSER: parsing an ifstatement");
            if (this.matchToken(TSC.TokenType.TIf)) {
                this.log.push("VALID - Expecting Statement, found IfStatement");
                this.consumeToken(TSC.TokenType.TIf);
                if (this.parseBooleanExpr(Production.If)) {
                    console.log("adfasd");
                    return true;
                    // && this.parseBlock()){
                }
                else {
                    this.log.push("ERROR - Expecting BooleanExpr, found " + this.tokenList[this.currentToken].type);
                }
                console.log("PARSER: ifstatement found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseExpr = function () {
            console.log("PARSER: parsing an expr");
            if (this.parseBooleanExpr(Production.Expr)) {
                console.log("PARSER: expr found");
                return true;
            }
            else if (this.parseIntExpr()) {
                console.log("PARSER: expr found");
                return true;
            }
            else if (this.parseId()) {
                console.log("PARSER: expr found");
                return true;
            }
            else if (this.parseStringExpr()) {
                console.log("PARSER: expr found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseBooleanExpr = function (production) {
            if (typeof production === 'undefined') {
                production = 'default';
            }
            console.log("PARSER: parsing a booleanexpr");
            if (this.matchToken(TSC.TokenType.TLparen)) {
                if (production == Production.Expr) {
                    this.log.push("VALID - Expecting Expr, found BooleanExpr");
                }
                console.log("PARSER: booleanexpr found");
                this.consumeToken(TSC.TokenType.TLparen);
                if (this.parseExpr()) {
                    if (this.matchToken(TSC.TokenType.TBoolop)) {
                        this.consumeToken(TSC.TokenType.TBoolop);
                        if (this.parseExpr()) {
                            if (this.matchToken(TSC.TokenType.TRparen)) {
                                this.consumeToken(TSC.TokenType.TRparen);
                                return true;
                            }
                            else {
                                this.log.push("ERROR - Expecting TBoolval, found " + this.tokenList[this.currentToken].type);
                            }
                        }
                    }
                    else {
                        this.log.push("ERROR - Expecting TBoolop, found " + this.tokenList[this.currentToken].type);
                        return false;
                    }
                }
            }
            else if (this.matchToken(TSC.TokenType.TBoolval)) {
                if (production == Production.Expr) {
                    this.log.push("VALID - Expecting Expr, found BooleanExpr");
                }
                this.consumeToken(TSC.TokenType.TBoolval);
                console.log("PARSER: booleanexpr found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseIntExpr = function () {
            console.log("PARSER: parsing an intexpr");
            // in case after a digit an intop is not found, we accept the digit
            if (this.matchToken(TSC.TokenType.TDigit)) {
                this.log.push("VALID - Expecting Expr, found IntExpr");
                this.log.push("VALID - Expecting Digit, found " + this.tokenList[this.currentToken].type);
                this.consumeToken(TSC.TokenType.TDigit);
                if (this.matchToken(TSC.TokenType.TIntop) && this.parseExpr()) {
                    this.log.push("VALID - Expecting Intop, found " + this.tokenList[this.currentToken].type);
                    console.log("PARSER: intexpr (digit op expr) found");
                    return true;
                }
                else {
                    console.log("PARSER: intexpr (digit) found");
                    return true;
                }
            }
            return false;
        };
        Parser.prototype.parseStringExpr = function () {
            console.log("PARSER: parsing a stringexpr");
            if (this.matchToken(TSC.TokenType.TQuote) && this.parseCharList() && this.matchToken(TSC.TokenType.TQuote)) {
                console.log("PARSER: stringexpr found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseId = function () {
            console.log("PARSER: parsing an id");
            if (this.matchToken(TSC.TokenType.TId)) {
                this.consumeToken(TSC.TokenType.TId);
                console.log("PARSER: id found");
                return true;
            }
            return false;
        };
        Parser.prototype.parseCharList = function () {
            console.log("PARSER: parsing a charlist");
            // spaces are treated as chars for me
            if (this.matchToken(TSC.TokenType.TChar) && this.parseCharList()) {
                console.log("PARSER: charlist found");
                return true;
            }
            else {
                // epsilon
                return true;
            }
        };
        // ---------------------------- TERMINALS -------------------------------- //
        /**
         * Matches and consumes a passed token type.
         * If the next token we're looking at match to a terminal symbol,
         * advance the current token.
         * If error, break out of parse
         * Logs appropriate production that is being derived.
         * Token is expected to be present based on boolean value passed. If
         * the token is not present, throw an error.
         * @param token the token that is being matched and consumed
         * @param start production that is being rewritten, if any
         * @param rewrite production that is being rewritten to, if any
         * @param expected flag for if token is expected to be matched
         */
        Parser.prototype.matchToken = function (token, start, rewrite, expected) {
            if (this.error) {
                return false;
            }
            if (this.tokenList[this.currentToken].type == token) {
                if (start != null) {
                    this.log.push("VALID - Expecting " + start + ", found " + rewrite);
                    // We know every statement is rewritten from StatementList
                    if (start == Production.Stmt) {
                        this.cst.addNTNode(Production.StmtList);
                    }
                    this.cst.addNTNode(start);
                    this.cst.addNTNode(rewrite);
                    console.log("add node");
                    console.log(start + "->" + rewrite);
                }
                this.log.push("VALID - Expecting " + token + ", found " + this.tokenList[this.currentToken].type + " " + this.tokenList[this.currentToken].value);
                // Add token to tree
                this.cst.addTNode(this.tokenList[this.currentToken]);
                console.log("Adding " + this.tokenList[this.currentToken].value + " to the tree");
                this.cst.traverseTree();
                // consume token
                this.currentToken++;
                return true;
            }
            // if token was expected and was not present, throw an error
            if (expected) {
                this.error = true;
                this.log.push("ERROR - Expecting " + token + ", found " + this.tokenList[this.currentToken].type);
            }
            return false;
        };
        return Parser;
    }());
    TSC.Parser = Parser;
})(TSC || (TSC = {}));