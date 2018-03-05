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

            /**
             * Adds non-terminal node
             */
            public addNTNode(production: Production){
                let node = new NonTerminalTreeNode(production);
                console.log(node);
                console.log(production);
                if(this.root == null){
                    this.root = node;
                    this.curr = node;
                    return;
                }
                // set parent
                node.parent = this.curr;
                // add to children of curr node
                this.curr.children.push(node);
                this.descendTree();
            }

            /**
             * Adds terminal node
             */
            public addTNode(token: Token){
                let node = new TerminalTreeNode(token);
                if(this.root == null){
                    this.root = node;
                    this.curr = node;
                    return;
                }
                // set parent
                node.parent = this.curr;
                // add to children of curr node
                this.curr.children.push(node);
                // Once we add a terminal to the tree, ascend the tree
            }

            /**
             * Sets current node to look at as the latest child
             */
            public descendTree(){
                if(this.curr == null){
                    return;
                }
                let latestChild = this.curr.children[this.curr.children.length-1];
                this.curr = latestChild;
            }

            /**
             * Sets current node to look at as the parent of the current node
             */
            public ascendTree(){
                this.curr = this.curr.parent;
            }

            /**
             * Prints the tree in dfs
             */
            public traverseTree(){
                let tree: Array<String> = [];
                let level: number = 0;
                let treantTree: Object = {};
                // Base Treant.js CST config
                treantTree = {
                    chart: {
                        container: "#tree-cst"
                    },
                    
                    nodeStructure: {
                        text: { name: "CST" },
                        children: [
                            // {
                            //     text: { name: "First child" }
                            // },
                            // {
                            //     text: { name: "Second child" }
                            // }
                        ]
                    }
                };
                if(this.root != null){
                    this.DFS(this.root, level, tree, "", treantTree['nodeStructure'].children);
                }
                // Return array of nodes and tree config
                return {"tree": tree, "treant": treantTree};
            }
            
            /**
             * Helper for traverseTree
             */
            private DFS(node, level, tree, dash, treantTree){
                let child = {};
                if(node.value instanceof Token){
                    console.log("CST: " + node.value.value + " Level: " + level);
                    tree.push(dash + "[" + node.value.value + "]")
                    // Add new node to children array passed
                    // Pass reference to new children array to next call
                    child = {
                        text: { name: node.value.value },
                        children: []
                    }
                    treantTree.push(child);
                }
                else{
                    console.log("CST: " + node.value + " Level: " + level);
                    tree.push(dash + "<" + node.value + ">")
                    // Add new node to children array passed
                    // Pass reference to new children array to next call
                    child = {
                        text: { name: node.value },
                        children: []
                    }
                    treantTree.push(child);
                }
                if(node.children.length != 0){
                    for(var i=0; i<node.children.length; i++){
                        // to next call of DFS, increase level, pass the tree array, increase the dash by one dash, and pass
                        // the reference to the next children array
                        this.DFS(node.children[i], level + 1, tree, dash + "-", child['children']);
                    }
                }
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