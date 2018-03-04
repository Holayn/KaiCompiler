module TSC {
    
        /**
         * Implementation of a Tree to represent the CST generated by the Parser
         */
        export class Tree {
            // root of the tree
            root: TreeNode;
            // current parent node we are looking at
            curr: TreeNode;
    
            constructor(){
                this.curr = null;
                this.root = null;
            }
        }
    
        /**
         * Implementation of a TreeNode that makes up a Tree
         */
        export abstract class TreeNode {
            value: any;
            // pointer to parent of this node
            parent: TreeNode;
            // the children this node points to
            children = [];
            constructor(value: any){
                this.value = value;
            }
        }
    
        /**
         * A TreeNode that represents NonTerminals
         */
        export class NonTerminalTreeNode extends TreeNode {
            value: Production;
            super(value: Production){
                this.value = value;
            }
        }
    
        /**
         * A TreeNode that represents Terminals
         */
        export class TerminalTreeNode extends TreeNode {
            value: Token;
            super(value: Token){
                this.value = value;
            }
        }
    }