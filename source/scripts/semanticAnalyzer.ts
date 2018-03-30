/**
 * This is the semantic analyzer, which produces an AST and performs
 * semantic analysis on the source code.
 * Validates types and scopes.
 */
module TSC {
    export class SemanticAnalyzer {

        // What if we took in a list of productions and symbols found and assembled AST from that?
        // Skip over stuff we don't care about.
        // We know that since this passed analyze, we don't have to worry about correct syntax.
        // Add to AST when find something "important"
        
        // VarDecl? Add to child of Block and descend to it.
        // We in VarDecl now. Look for Type and Id and add to child of VarDecl. Ascend tree.
        
        // PrintStatement? Add to child of Block and descend to it.
        // We in PrintStatement now. Look for print and some expression and add to child of PrintStatement. Ascend tree.
        // Have to figure out expression first.

        // IntExpr? Look ahead to see if there is IntOp. If so, make it a node descend to it. Else, make digit a node. Return node. 
        // We in IntOp now. Add Digit and other expression to child of IntOp. Ascend tree.

        // If expr, we have to figure out what it is. evalExpr(): returns node, which is added to tree.

        // Block? Add to child of Block and descend to it.
        // We in Block now. Do Block stuff, aka main loop.

        // Nah, fuck that. Let's just reuse parser ahahahah...?

        // Let's just go through source code again, assume everything correct
        // On "important" things, add to tree.

        // currentSymbol: number; // the index of the current nonterminal or terminal symbol we're looking at
        // tokenList: Array<Token>; // list of tokens passed from lexer
        warnings: Array<WarningType>; // array to hold warnings
        errors: Array<ErrorType>; // array to hold errors
        ast: Tree; // pointer to the ast

        constructor(){
            this.warnings = [];
            this.errors = [];
            this.ast = new Tree();
        }

        /**
         * Starts the semantic analysis using the CST produced in parse
         */
        public analyze(parseResult){
            // Traverse the CST in a preorder fashion
            // If we find something "important", add it to the CST
            this.traverse(parseResult.cst.root);
            // Return the AST for now
            return this.ast;
        }

        /**
         * Performs preorder traversal given a CST node
         */
        public traverse(node){
            // Check if "important". If so, add to AST, descend AST.
            switch(node.value){
                case Production.Block:
                    console.log("found block");
                    this.ast.addNTNode(Production.Block);
                    // Traverse node's children
                    for(var i=0; i<node.children.length; i++){
                        this.traverse(node.children[i]);
                    }
                    // Go up the AST once we finish traversing
                    // Don't go up if we're at the root doe
                    if(this.ast.curr != null){
                        this.ast.ascendTree();
                    }
                    break;
                case Production.VarDecl:
                    console.log("found vardecl");
                    this.ast.addNTNode(Production.VarDecl);
                    // We now need to get its children and add to AST
                    // Get the type
                    this.ast.addNode(node.children[0].children[0].value);
                    this.ast.ascendTree();
                    // Get the id
                    this.ast.addNode(node.children[1].children[0].value);
                    this.ast.ascendTree();
                    this.ast.ascendTree();
                    break;
                case Production.PrintStmt:
                    console.log("found wendy");
                    this.ast.addNTNode(Production.PrintStmt);
                    // figure out expression
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case Production.Id:
                    console.log("found id");
                    this.ast.addNode(node.children[0].value);
                    this.ast.ascendTree();
                    break;
                case Production.IntExpr:
                    console.log("found intexpr");
                    // figure out which intexpr this is
                    // more than just a digit
                    if(node.children.length > 1){
                        this.ast.addNode(node.children[1].children[0].value);
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                        // figure out expression
                        this.traverse(node.children[2]);
                        this.ast.ascendTree();
                    }
                    // just a digit
                    else{
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    break;
                case Production.BooleanExpr:
                    console.log("found boolexpr");
                    // figure out which boolexpr this is.
                    // more than just a boolval
                    if(node.children.length > 1){
                        console.log(node.children[2].children[0].value.value);
                        if(node.children[2].children[0].value.value == "=="){
                            this.ast.addNode("EqualTo");
                        }
                        else{
                            this.ast.addNode("NotEqualTo");
                        }
                        console.log("left expr");
                        this.traverse(node.children[1]);
                        console.log("right expr");
                        this.traverse(node.children[3]);
                        console.log("done boolexpr");
                        this.ast.ascendTree();
                    }
                    // just a boolval
                    else{
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    break;
                default:
                    // Traverse node's children
                    for(var i=0; i<node.children.length; i++){
                        this.traverse(node.children[i]);
                    }
                    break;
            }
        }

        // currentToken: number; // the index of the current token we're looking at
        // tokenList: Array<Token>; // list of tokens passed from lexer
        // warnings: Array<WarningType>; // array to hold warnings
        // errors: Array<ErrorType>; // array to hold errors
        // ast: Tree; // pointer to the ast

        //  // Constructor for analyzer, passed tokens from lexer. Inits values.
        // constructor(tokens){
        //     this.tokenList = tokens;
        //     // Set current token to the first token in the list
        //     this.currentToken = 0;
        //     this.warnings = [];
        //     this.errors = [];
        //     this.ast = new Tree();
        // }

        // // ---------------------------- NON-TERMINALS -------------------------------- //
        
        // /**
        //  * Starts the semantic analysis
        //  */
        // public analyze() {
        //     if(this.analyzeProgram()){
        //     }
        //     else{
        //     }
        //     return {

        //     }
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a Program, or a Block appended with an EOP marker
        //  */
        // public analyzeProgram(): boolean {
        //     if(this.analyzeBlock() && this.matchToken(TokenType.TEop, null)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a Block, or a ( StatementList )
        //  */
        // public analyzeBlock(): boolean {
        //     if(this.matchToken(TokenType.TLbrace, Production.Block) && this.analyzeStatementList() && this.matchToken(TokenType.TRbrace, null)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a StatementList, or a Statement StatementList, or epsilon
        //  */
        // public analyzeStatementList() {
        //     if(this.analyzeStatement() && this.analyzeStatementList()){
        //         return true;
        //     }
        //     // epsilon... accept empty and return to analyzeBlock
        //     else{
        //         return true;
        //     }
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a Statement, or a PrintStatement, AssignStatement, WhileStatement, VarDecl, IfStatement, or Block
        //  */
        // public analyzeStatement() {
        //     if(this.analyzePrintStatement() || this.analyzeAssignmentStatement() || 
        //     this.analyzeWhileStatement() || this.analyzeVarDecl() || 
        //     this.analyzeIfStatement() || this.analyzeBlock()){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a PrintStatement, or a Print ( Expr )
        //  */
        // public analyzePrintStatement() {
        //     if(this.matchToken(TokenType.TPrint, Production.PrintStmt) && this.matchToken(TokenType.TLparen, null) &&
        //     this.analyzeExpr() && this.matchToken(TokenType.TRparen, null)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up an AssignmentStatement, or an Id = Expr
        //  */
        // public analyzeAssignmentStatement() {
        //     if(this.analyzeId() && 
        //     this.matchToken(TokenType.TAssign, null) && this.analyzeExpr()){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a VarDecl, or a Type Id
        //  */
        // public analyzeVarDecl() {
        //     if(this.analyzeType() && this.analyzeId()){
        //         // If we've found a VarDecl, add the last two tokens to the symbol table
        //         console.log(this.tokenList[this.currentToken-1]);
        //         this.symbol["type"] = this.tokenList[this.currentToken-2].value;
        //         this.symbol["key"] = this.tokenList[this.currentToken-1].value;
        //         this.symbol["line"] = this.tokenList[this.currentToken-1].lineNumber;
        //         this.symbols.push(this.symbol);
        //         this.symbol = {};
        //         console.log(this.symbols);
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a WhileStatement, or a While BooleanExpr Block
        //  */
        // public analyzeWhileStatement() {
        //     if(this.matchToken(TokenType.TWhile, Production.WhileStmt) && this.analyzeBooleanExpr() && this.analyzeBlock()){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up an IfStatement, or an If BooleanExpr Block
        //  */
        // public analyzeIfStatement() {
        //     // we let analyzeBooleanExpr derive appropriate rewrite rules by passing empty production array
        //     if(this.matchToken(TokenType.TIf, Production.IfStmt) && this.analyzeBooleanExpr() &&
        //     this.analyzeBlock()){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up an Expr, or an IntExpr, StringExpr, BooleanExpr, or Id
        //  */
        // public analyzeExpr() {
        //     if(this.analyzeIntExpr() || this.analyzeStringExpr() || this.analyzeBooleanExpr() || 
        //     this.analyzeId()){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up an IntExpr, or a Digit, or Digit Intop Expr
        //  */
        // public analyzeIntExpr() {
        //     // if(this.matchToken(TokenType.TDigit, production, Production.IntExpr, false)){
        //     if(this.analyzeDigit()){
        //         // ascend the tree after we've derived an intexpr
        //         // if(this.analyzeIntop([Production.IntOp], false) && this.analyzeExpr([Production.Expr], true)){
        //         if(this.analyzeIntop() && this.analyzeExpr()){
        //             return true;
        //         }
        //         else{
        //             return true;
        //         }
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a StringExpr, or a " CharList "
        //  */
        // public analyzeStringExpr() {
        //     if(this.matchToken(TokenType.TQuote, Production.StringExpr) && this.analyzeCharList() && this.matchToken(TokenType.TQuote, null)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a BooleanExpr, or a Boolval or a ( Expr Boolop Expr )
        //  */
        // public analyzeBooleanExpr() {
        //     if(this.analyzeBoolVal()){
        //         return true;
        //     }
        //     else if(this.matchToken(TokenType.TLparen, Production.BooleanExpr) && this.analyzeExpr() &&
        //     this.analyzeBoolop() && this.analyzeExpr() && this.matchToken(TokenType.TRparen, null)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a BoolVal, or true or false
        //  */
        // public analyzeBoolVal() {
        //     // we add a BooleanExpr to the list of productions rewritten, as Expr is rewritten to BooleanExpr, which is then rewritten to Boolval
        //     if(this.matchToken(TokenType.TBoolval, Production.BoolVal)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up an Id
        //  */
        // public analyzeId() {
        //     if(this.matchToken(TokenType.TId, Production.Id)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a Type, or int, string, or boolean
        //  */
        // public analyzeType() {
        //     if(this.matchToken(TokenType.TType, Production.Type)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a Char, or a, b, c ..., z
        //  */
        // public analyzeChar() {
        //     if(this.matchToken(TokenType.TChar, Production.Char)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a Digit, or 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
        //  */
        // public analyzeDigit() {
        //     if(this.matchToken(TokenType.TDigit, Production.Digit)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up an Intop, or +
        //  */
        // public analyzeIntop() {
        //     if(this.matchToken(TokenType.TIntop, Production.IntOp)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up an Boolop, or == or !=
        //  */
        // public analyzeBoolop() {
        //     if(this.matchToken(TokenType.TBoolop, Production.BoolOp)){
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Analyzes the tokens to see if they make up a Space, or a " "
        //  */
        // public analyzeSpace() {
        //     if(this.matchToken(TokenType.TSpace, Production.Space)){
        //         return true;
        //     }
        //     return false;
        // }
        

        // /**
        //  * Analyzes the tokens to see if they make up a CharList, or a Char Charlist, or epsilon
        //  */
        // public analyzeCharList() {
        //     // spaces are treated as chars for me
        //     if(this.analyzeChar() && this.analyzeCharList()){
        //         return true;
        //     }
        //     else if(this.analyzeSpace() && this.analyzeCharList()){
        //         return true;
        //     }
        //     else{
        //         // epsilon... accept empty
        //         return true;
        //     }
        // }

        // /**
        //  * This performs matching and consuming of tokens in the source code.
        //  * Puts appropriate productions in the AST.
        //  * @param token the token being matched
        //  * @param production the production being derived
        //  */
        // public matchToken(token: TokenType, production: Production) {
        //     if(this.tokenList[this.currentToken].type == token){
        //         this.addToAST(production)
        //         // consume token
        //         this.currentToken++;
        //         return true;
        //     }
        //     return false;
        // }

        // /**
        //  * Adds to the AST if the production is "Important"
        //  * Check to see if production is an "important" one. Add it to the AST if it is.
        //  * Descend the AST when we find such a production.
        //  * @param production the production being added to AST
        //  */
        // public addToAST(production: Production){
            
        // }

    }
}