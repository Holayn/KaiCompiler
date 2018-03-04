/**
 * This is the parser, which takes the tokens generated by the lexer
 * and validates their ordering with the provided grammar.
 * Produces a CST.
 * Traverse inorder DFS.
 * Top-down recursive descent parser on an LL(1) grammar.
 */

module TSC {

    export enum Production {
        Program = "Program",
        Block = "Block",
        Expr = "Expression",
        Stmt = "Statement",
        StmtList = "StatementList",
        AssignStmt = "AssignmentStatement",
        PrintStmt = "PrintStatement",
        WhileStmt = "WhileStatement",
        VarDecl = "VarDecl",
        IfStmt = "IfStatement",
        BooleanExpr = "BooleanExpression",
        IntExpr = "IntegerExpression",
        StringExpr = "StringExpression",
        CharList = "CharList",
        Id = "Id"
    }

    export class Parser {

        currentToken: number; // the index of the current token we're looking at
        tokenList; // list of tokens passed from lexer
        log; // log of parser
        error: boolean; // keeps track if the parser has run into an error
        cst: Tree; // pointer to the tree

         // Constructor for parser, passed tokens from lexer. Inits values.
        constructor(tokens){
            this.tokenList = tokens;
            // Set current token to the first token in the list
            this.currentToken = 0;
            // Holds log messages generated by parser
            this.log = [];
            this.error = false;
            this.cst = new Tree();
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
        public parse() {
            if(this.parseProgram()){
                console.log("PARSER: success!");
            }
            else{
                console.log("PARSER: error");
            }
            console.log(this.log);
        }

        /**
         * Parses the tokens to see if they make up a Program, or a Block appended with an EOP marker
         */
        public parseProgram(): boolean {
            if(this.parseBlock(Production.Program, true) && this.matchToken(TokenType.TEop, null, null, true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Block, or a ( StatementList )
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseBlock(production: Production, expected: boolean): boolean {
            if(this.matchToken(TokenType.TLbrace, production, Production.Block, false) && this.parseStatementList(null, false) && this.matchToken(TokenType.TRbrace, null, null, true)){
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting Block, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a StatementList, or a Statement StatementList, or epsilon
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseStatementList(production: Production, expected: boolean) {
            if(this.parseStatement(Production.StmtList, false) && this.parseStatementList(Production.StmtList, false)){
                return true;
            }
            // epsilon... accept empty and return to parseBlock
            else{
                return true;
            }
        }

        /**
         * Parses the tokens to see if they make up a Statement, or a PrintStatement, AssignStatement, WhileStatement, VarDecl, IfStatement, or Block
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseStatement(production: Production, expected: boolean) {
            if(this.parsePrintStatement(Production.Stmt, false) || this.parseAssignmentStatement(Production.Stmt, false) || this.parseWhileStatement(Production.Stmt, false) || 
            this.parseVarDecl(Production.Stmt, false) || this.parseIfStatement(Production.Stmt, false) || this.parseBlock(Production.Stmt, false)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a PrintStatement, or a Print ( Expr )
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parsePrintStatement(production: Production, expected: boolean) {
            if(this.matchToken(TokenType.TPrint, production, Production.PrintStmt, false) && this.matchToken(TokenType.TLparen, null, null, true) &&
            this.parseExpr(Production.Expr, true) && this.matchToken(TokenType.TRparen, null, null, true)){
                return true;
            }
            if(expected && !this.error){
                this.log.push("ERROR - Expecting PrintStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an AssignmentStatement, or an Id = Expr
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseAssignmentStatement(production: Production, expected: boolean) {
            if(this.matchToken(TokenType.TId, production, Production.AssignStmt, false) && 
            this.matchToken(TokenType.TAssign, null, null, true) && this.parseExpr(Production.Expr, true)){
                return true;
            }
            if(expected && this.error){
                this.error = true;
                this.log.push("ERROR - Expecting AssignmentStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a VarDecl, or a Type Id
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseVarDecl(production: Production, expected: boolean) {
            if(this.matchToken(TokenType.TType, production, Production.VarDecl, false) && 
            this.parseId(null, true)){
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting VarDecl, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a WhileStatement, or a While BooleanExpr Block
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseWhileStatement(production: Production, expected: boolean) {
            if(this.matchToken(TokenType.TWhile, production, Production.WhileStmt, false) && this.parseBooleanExpr(Production.BooleanExpr, true) && this.parseBlock(null, true)){
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting WhileStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an IfStatement, or an If BooleanExpr Block
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseIfStatement(production: Production, expected: boolean) {
            if(this.matchToken(TokenType.TIf, production, Production.IfStmt, false) && this.parseBooleanExpr(Production.BooleanExpr, true) &&
            this.parseBlock(null, true)){
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting IfStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an Expr, or an IntExpr, StringExpr, BooleanExpr, or Id
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseExpr(production: Production, expected: boolean) {
            if(this.parseIntExpr(production, false) || this.parseStringExpr(production, false) || this.parseBooleanExpr(production, false) || 
            this.parseId(production, false)){
                return true;
            }
            // return error if expression not found
            if(!this.error){
                this.error = true;
                this.log.push("ERROR - Expecting Expr, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an IntExpr, or a Digit, or Digit Intop Expr
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseIntExpr(production: Production, expected: boolean) {
            if(this.matchToken(TokenType.TDigit, production, Production.IntExpr, false)){
                if(this.matchToken(TokenType.TIntop, null, null, false) && this.parseExpr(Production.Expr, true)){
                    return true;
                }
                else{
                    return true;
                }
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting IntExpr, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a StringExpr, or a " CharList "
         * @param production the production that is being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseStringExpr(production: Production, expected: boolean) {
            if(this.matchToken(TokenType.TQuote, production, Production.StringExpr, false) && this.parseCharList(Production.CharList, true) && this.matchToken(TokenType.TQuote, null, null, true)){
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting StringExpr, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }


        public parseCharList() {
            console.log("PARSER: parsing a charlist");
            // spaces are treated as chars for me
            if(this.matchToken(TokenType.TChar) && this.parseCharList()){
                console.log("PARSER: charlist found");
                return true;
            }
            else{
                // epsilon
                return true;
            }
        }



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
        public matchToken(token: TokenType, start: Production, rewrite: Production, expected: boolean) {
            if(this.error){
                return false;
            }
            if(this.tokenList[this.currentToken].type == token){
                if(start != null) {
                    this.log.push("VALID - Expecting " + start + ", found " + rewrite);
                    // We know every statement is rewritten from StatementList
                    if(start == Production.Stmt){
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
            if(expected){
                this.error = true;
                this.log.push("ERROR - Expecting " + token + ", found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }
    }
}