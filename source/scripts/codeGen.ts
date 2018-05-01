/**
 * This is the code generator, which takes the AST and produces 6502a op codes for it
 */

   module TSC {

    export class CodeGenerator {
        // holds the generated op codes
        generatedCode: Array<String>;
        // object to represent a table of static variables
        staticTable: Object = {};
        // object to represent the loop jumps
        loopJumps: Object = {};
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

        // traverse the ast
        /**
         * Prints the tree in dfs for AST display
         */
        public traverseTreeAST(treantTree){
            let tree: Array<String> = [];
            let level: number = 0;
            if(this.root != null){
                this.DFSAST(this.root, level, tree, "", treantTree['nodeStructure'].children);
            }
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
