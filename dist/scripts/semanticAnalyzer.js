/**
 * This is the semantic analyzer, which produces an AST and performs
 * semantic analysis on the source code.
 * Validates types and scopes.
 */
var TSC;
(function (TSC) {
    var SemanticAnalyzer = /** @class */ (function () {
        function SemanticAnalyzer() {
            this.warnings = [];
            this.errors = [];
            this.ast = new TSC.Tree();
        }
        /**
         * Starts the semantic analysis using the CST produced in parse
         */
        SemanticAnalyzer.prototype.analyze = function (parseResult) {
            // Traverse the CST in a preorder fashion
            // If we find something "important", add it to the CST
            this.traverse(parseResult.cst.root);
            // Return the AST for now
            return this.ast;
        };
        /**
         * Performs preorder traversal given a CST node
         */
        SemanticAnalyzer.prototype.traverse = function (node) {
            // Check if "important". If so, add to AST, descend AST.
            switch (node.value) {
                case TSC.Production.Block:
                    console.log("found block");
                    this.ast.addNTNode(TSC.Production.Block);
                    // Traverse node's children
                    for (var i = 0; i < node.children.length; i++) {
                        this.traverse(node.children[i]);
                    }
                    // Go up the AST once we finish traversing
                    // Don't go up if we're at the root doe
                    if (this.ast.curr != null) {
                        this.ast.ascendTree();
                    }
                    break;
                case TSC.Production.VarDecl:
                    console.log("found vardecl");
                    this.ast.addNTNode(TSC.Production.VarDecl);
                    // We now need to get its children and add to AST
                    // Get the type
                    this.ast.addNode(node.children[0].children[0].value);
                    this.ast.ascendTree();
                    // Get the id
                    this.ast.addNode(node.children[1].children[0].value);
                    this.ast.ascendTree();
                    this.ast.ascendTree();
                    break;
                case TSC.Production.PrintStmt:
                    console.log("found wendy");
                    this.ast.addNTNode(TSC.Production.PrintStmt);
                    // figure out expression
                    this.traverse(node.children[2]);
                    this.ast.ascendTree();
                    break;
                case TSC.Production.Id:
                    console.log("found id");
                    this.ast.addNode(node.children[0].value);
                    this.ast.ascendTree();
                    break;
                case TSC.Production.IntExpr:
                    console.log("found intexpr");
                    // figure out which intexpr this is
                    // actual expression
                    if (node.children.length > 1) {
                        this.ast.addNode(node.children[1].children[0].value);
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                        // figure out expression
                        this.traverse(node.children[2]);
                        this.ast.ascendTree();
                    }
                    else {
                        this.ast.addNode(node.children[0].children[0].value);
                        this.ast.ascendTree();
                    }
                    break;
                default:
                    // Traverse node's children
                    for (var i = 0; i < node.children.length; i++) {
                        this.traverse(node.children[i]);
                    }
                    break;
            }
        };
        return SemanticAnalyzer;
    }());
    TSC.SemanticAnalyzer = SemanticAnalyzer;
})(TSC || (TSC = {}));
