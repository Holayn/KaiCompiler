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
        Id = "Id",
        BoolVal = "BoolVal",
        Type = "Type",
        Char = "Char",
        Digit = "Digit",
        IntOp = "IntOp"
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
            if(this.parseBlock([Production.Program], true) && this.matchToken(TokenType.TEop, null, null, true)){
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Block, or a ( StatementList )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseBlock(production: Array<Production>, expected: boolean): boolean {
            if(this.matchToken(TokenType.TLbrace, production, Production.Block, false) && this.parseStatementList(null, false) && this.matchToken(TokenType.TRbrace, null, null, true)){
                // ascend the tree after we've derived a block
                this.cst.ascendTree();
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
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseStatementList(production: Array<Production>, expected: boolean) {
            if(this.parseStatement([Production.StmtList], false) && this.parseStatementList([Production.StmtList], false)){
                // ascend the tree after we've derived a stmtlist
                this.cst.ascendTree();
                return true;
            }
            // epsilon... accept empty and return to parseBlock
            else{
                return true;
            }
        }

        /**
         * Parses the tokens to see if they make up a Statement, or a PrintStatement, AssignStatement, WhileStatement, VarDecl, IfStatement, or Block
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseStatement(production: Array<Production>, expected: boolean) {
            if(this.parsePrintStatement([Production.StmtList, Production.Stmt], false) || this.parseAssignmentStatement([Production.StmtList, Production.Stmt], false) || 
            this.parseWhileStatement([Production.StmtList, Production.Stmt], false) || this.parseVarDecl([Production.StmtList, Production.Stmt], false) || 
            this.parseIfStatement([Production.StmtList, Production.Stmt], false) || this.parseBlock([Production.StmtList, Production.Stmt], false)){
                this.cst.ascendTree();
                return true;
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a PrintStatement, or a Print ( Expr )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parsePrintStatement(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TPrint, production, Production.PrintStmt, false) && this.matchToken(TokenType.TLparen, null, null, true) &&
            this.parseExpr([Production.Expr], true) && this.matchToken(TokenType.TRparen, null, null, true)){
                // ascend the tree after we've derived a printstmt
                this.cst.ascendTree();
                return true;
            }
            if(expected && !this.error){
                this.log.push("ERROR - Expecting PrintStatement, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an AssignmentStatement, or an Id = Expr
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseAssignmentStatement(production: Array<Production>, expected: boolean) {
            if(this.parseId(production.concat([Production.AssignStmt]), false) && 
            this.matchToken(TokenType.TAssign, null, null, true) && this.parseExpr([Production.Expr], true)){
                // ascend the tree after we've derived a assignstmt
                this.cst.ascendTree();
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
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseVarDecl(production: Array<Production>, expected: boolean) {
            if(this.parseType(production.concat([Production.VarDecl]), false) && this.parseId(null, true)){
                // ascend the tree after we've derived a vardecl
                this.cst.ascendTree();
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
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseWhileStatement(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TWhile, production, Production.WhileStmt, false) && this.parseBooleanExpr([Production.BooleanExpr], true) && this.parseBlock(null, true)){
                // ascend the tree after we've derived a whilestmt
                this.cst.ascendTree();
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
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseIfStatement(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TIf, production, Production.IfStmt, false) && this.parseBooleanExpr([Production.BooleanExpr], true) &&
            this.parseBlock(null, true)){
                // ascend the tree after we've derived an ifstatement
                this.cst.ascendTree();
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
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseExpr(production: Array<Production>, expected: boolean) {
            if(this.parseIntExpr(production, false) || this.parseStringExpr(production, false) || this.parseBooleanExpr(production, false) || 
            this.parseId(production, false)){
                // ascend the tree after we've derived an expr
                this.cst.ascendTree();
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
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseIntExpr(production: Array<Production>, expected: boolean) {
            // if(this.matchToken(TokenType.TDigit, production, Production.IntExpr, false)){
            if(this.parseDigit(production.concat([Production.IntExpr]), false)){
                // ascend the tree after we've derived an intexpr
                // if(this.parseIntop([Production.IntOp], false) && this.parseExpr([Production.Expr], true)){
                if(this.parseIntop(null, false) && this.parseExpr([Production.Expr], true)){
                    this.cst.ascendTree();
                    return true;
                }
                else{
                    this.cst.ascendTree();
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
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseStringExpr(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TQuote, production, Production.StringExpr, false) && this.parseCharList([Production.CharList], true) && this.matchToken(TokenType.TQuote, null, null, true)){
                // ascend the tree after we've derived a stringexpr
                this.cst.ascendTree();
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting StringExpr, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a BooleanExpr, or a Boolval or a ( Expr Boolop Expr )
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseBooleanExpr(production: Array<Production>, expected: boolean) {
            if(this.parseBoolVal(production, false)){
                // ascend the tree after we've derived a booleanexpr
                this.cst.ascendTree();
                return true;
            }
            else if(this.matchToken(TokenType.TLparen, production, Production.BooleanExpr, false) && this.parseExpr([Production.Expr], true) &&
            this.matchToken(TokenType.TBoolop, null, null, true) && this.parseExpr([Production.Expr], true) && this.matchToken(TokenType.TRparen, null, null, true)){
                // ascend the tree after we've derived a print statement
                this.cst.ascendTree();
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting BooleanExpr, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a BoolVal, or true or false
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseBoolVal(production: Array<Production>, expected: boolean) {
            // we add a BooleanExpr to the list of productions rewritten, as Expr is rewritten to BooleanExpr, which is then rewritten to Boolval
            if(this.matchToken(TokenType.TBoolval, production.concat([Production.BooleanExpr]), Production.BoolVal, false)){
                // // ascend the tree after we've derived a boolval statement
                // this.cst.ascendTree();
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting BoolVal, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an Id
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseId(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TId, production, Production.Id, false)){
                // ascend the tree after we've derived an id
                this.cst.ascendTree();
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting Id, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Type, or int, string, or boolean
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseType(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TType, production, Production.Type, false)){
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting Type, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Char, or a, b, c ..., z
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseChar(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TChar, production, Production.Char, false)){
                this.cst.ascendTree();
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting Char, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a Digit, or 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseDigit(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TDigit, production, Production.Digit, false)){
                this.cst.ascendTree();
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting Digit, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up an Intop, or +
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseIntop(production: Array<Production>, expected: boolean) {
            if(this.matchToken(TokenType.TIntop, production, Production.IntOp, false)){
                this.cst.ascendTree();
                return true;
            }
            if(expected && !this.error){
                this.error = true;
                this.log.push("ERROR - Expecting Digit, found " + this.tokenList[this.currentToken].type);
            }
            return false;
        }

        /**
         * Parses the tokens to see if they make up a CharList, or a Char Charlist, or epsilon
         * @param production the productions being rewritten
         * @param expected flag for if nonterminal is expected in rewrite rule
         */
        public parseCharList(production: Array<Production>, expected: boolean) {
            // spaces are treated as chars for me
            if(this.parseChar(production, false) && this.parseCharList(production, false)){
                // ascend the tree after we've derived a print statement
                this.cst.ascendTree();
                return true;
            }
            else{
                // epsilon... accept empty
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
         * @param start productions that is being rewritten, if any
         * @param rewrite production that is being rewritten to, if any
         * @param expected flag for if token is expected to be matched
         */
        public matchToken(token: TokenType, start: Array<Production>, rewrite: Production, expected: boolean) {
            console.log("PRODS");
            console.log(start);
            // If the parser has encountered an error, don't parse anymore tokens mate
            if(this.error){
                return false;
            }
            if(this.tokenList[this.currentToken].type == token){
                if(start != null) {
                    // this.log.push("VALID - Expecting " + start + ", found " + rewrite); // fix this
                    // add all productions in start
                    for(var i=0; i<start.length; i++){
                        this.cst.addNTNode(start[i]);
                        if(i != 0){
                            this.log.push("VALID - Expecting " + start[i-1] + ", found " + start[i]);
                        }
                    }
                    // add final production that was rewritten
                    this.cst.addNTNode(rewrite);
                    this.log.push("VALID - Expecting " + start[start.length-1] + ", found " + rewrite);
                    // console.log("add node");
                    // console.log(start + "->" + rewrite);
                }
                else if(rewrite != null){
                    this.cst.addNTNode(rewrite);
                    this.log.push("VALID - Expecting " + rewrite + ", found " + rewrite);
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