/**
 * This is the code generator, which takes the AST and produces 6502a op codes for it
 */

module TSC {

    export class CodeGenerator {
        // holds the generated op codes
        generatedCode: Array<String>;
        /* structure object to represent a table of static variables
        {
            "temp":
            "name":
            "at":
        }
        */
        staticTable: Object = {};
        /* structure object to represent the loop jumps
        {
            "temp":
            "jump":
        }
        */
        loopJumps: Object = {};
        /* structure object to represent the heap
        {
            "temp":
            "name":
            "ptr":
        }
        */
        heapTable: Object = {};
        // pointer representing where we are in op code array
        opPtr: number = 0;
        public CodeGenerator() {
            this.generatedCode = [];
            // fill with 00's
            for(var i=0; i<256; i++){
                this.generatedCode[i] = "00";
            }
            // load accumulator with 0
            this.generatedCode[this.opPtr] = "A9";
            this.opPtr += 2;
        }

        // traverse the ast in preorder fashion.
        // based on subtree root, perform certain action
        /**
         * Traverse AST. Generate correct opcodes on every subtree root
         * @param analyzeRes the result object from the semantic analyzer, contains the AST and symbol tree
         */
        public generateCode(analyzeRes) {
            let ast: Tree = analyzeRes.ast;
            this.traverseAST(ast.root);
        }
        
        /**
         * Helper to generateCode, performs actual traversing and code generation
         * @param node AST node
         */
        public traverseAST(node) {
            // Determine what kind of production the node is
            switch(node.value){
                // subtree root is block
                case TSC.Production.Block:
                    // traverse block's children
                    for(var i=0; i<node.children.length; i++){
                        this.traverseAST(node.children[i]);
                    }
                    break;
                // subtree root is a print statement
                case TSC.Production.PrintStmt:
                    // determine type of child
                    if(node.children[0].value.type == "TDigit"){
                        console.log("HA");
                    }
                    console.log(node);
                    break;
            }
        }


        /**
         * Prints the tree in dfs for AST display
         */
        public traverseTreeAST(treantTree){
            let tree: Array<String> = [];
            let level: number = 0;
            // if(this.root != null){
            //     this.DFSAST(this.root, level, tree, "", treantTree['nodeStructure'].children);
            // }
            // Return array of nodes and tree config
            return {"tree": tree, "treant": treantTree};
        }
        /**
         * Helper for traverseTreeAST
         */
        private DFSAST(node, level, tree, dash, treantTree){
            let child = {};
            // Check if null to find appropriate value to place in tree
            // Add new node to children array passed
            // Pass reference to new children array to next call
            if(node.value.value != null){
                tree.push(dash + node.value.value);
                child = {
                    text: { name: node.value.value + " " },
                    children: []
                }
            }
            else{
                tree.push(dash + node.value);
                child = {
                    text: { name: node.value + " " },
                    children: []
                }
            }
            treantTree.push(child);
            for(var i=0; i<node.children.length; i++){
                // to next call of DFS, increase level, pass the tree array, increase the dash by one dash, and pass
                // the reference to the next children array
                this.DFSAST(node.children[i], level + 1, tree, dash + "-", child['children']);
            }
        }
    }
}
