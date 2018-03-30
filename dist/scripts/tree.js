var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSC;
(function (TSC) {
    /**
     * Implementation of a Tree to represent the CST generated by the Parser
     */
    var Tree = /** @class */ (function () {
        function Tree() {
            this.curr = null;
            this.root = null;
        }
        /**
         * Adds non-terminal node
         */
        Tree.prototype.addNTNode = function (production) {
            var node = new NonTerminalTreeNode(production);
            if (this.root == null) {
                this.root = node;
                this.curr = node;
                return;
            }
            // set parent
            node.parent = this.curr;
            // add to children of curr node
            this.curr.children.push(node);
            this.descendTree();
        };
        /**
         * Adds terminal node
         */
        Tree.prototype.addTNode = function (token) {
            var node = new TerminalTreeNode(token);
            if (this.root == null) {
                this.root = node;
                this.curr = node;
                return;
            }
            // set parent
            node.parent = this.curr;
            // add to children of curr node
            this.curr.children.push(node);
            // we don't descend tree here because terminal nodes are always leaf nodes
        };
        /**
         * Add general node
         */
        Tree.prototype.addNode = function (input) {
            var node = new GeneralTreeNode(input);
            if (this.root == null) {
                this.root = node;
                this.curr = node;
                return;
            }
            // set parent
            node.parent = this.curr;
            // add to children of curr node
            this.curr.children.push(node);
            this.descendTree();
        };
        /**
         * Sets current node to look at as the latest child
         */
        Tree.prototype.descendTree = function () {
            if (this.curr == null) {
                return;
            }
            var latestChild = this.curr.children[this.curr.children.length - 1];
            this.curr = latestChild;
        };
        /**
         * Sets current node to look at as the parent of the current node
         */
        Tree.prototype.ascendTree = function () {
            this.curr = this.curr.parent;
        };
        /**
         * Prints the tree in dfs
         */
        Tree.prototype.traverseTree = function (treantTree) {
            var tree = [];
            var level = 0;
            if (this.root != null) {
                this.DFS(this.root, level, tree, "", treantTree['nodeStructure'].children);
            }
            // Return array of nodes and tree config
            return { "tree": tree, "treant": treantTree };
        };
        /**
         * Helper for traverseTree
         */
        Tree.prototype.DFS = function (node, level, tree, dash, treantTree) {
            var child = {};
            if (node.value instanceof TSC.Token) {
                console.log("Tree: " + node.value.value + " Level: " + level);
                tree.push(dash + "[" + node.value.value + "]");
                // Add new node to children array passed
                // Pass reference to new children array to next call
                child = {
                    text: { name: "[" + node.value.value + "]" },
                    children: []
                };
                treantTree.push(child);
            }
            else {
                console.log("Tree: " + node.value + " Level: " + level);
                tree.push(dash + "<" + node.value + ">");
                // Add new node to children array passed
                // Pass reference to new children array to next call
                child = {
                    text: { name: "<" + node.value + ">" },
                    children: []
                };
                treantTree.push(child);
            }
            for (var i = 0; i < node.children.length; i++) {
                // to next call of DFS, increase level, pass the tree array, increase the dash by one dash, and pass
                // the reference to the next children array
                this.DFS(node.children[i], level + 1, tree, dash + "-", child['children']);
            }
        };
        return Tree;
    }());
    TSC.Tree = Tree;
    /**
     * Implementation of a TreeNode that makes up a Tree
     */
    var TreeNode = /** @class */ (function () {
        function TreeNode(value) {
            // the children this node points to
            this.children = [];
            this.value = value;
        }
        return TreeNode;
    }());
    TSC.TreeNode = TreeNode;
    /**
     * A TreeNode that represents NonTerminals
     */
    var NonTerminalTreeNode = /** @class */ (function (_super) {
        __extends(NonTerminalTreeNode, _super);
        function NonTerminalTreeNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NonTerminalTreeNode.prototype["super"] = function (value) {
            this.value = value;
        };
        return NonTerminalTreeNode;
    }(TreeNode));
    TSC.NonTerminalTreeNode = NonTerminalTreeNode;
    /**
     * A TreeNode that represents Terminals
     */
    var TerminalTreeNode = /** @class */ (function (_super) {
        __extends(TerminalTreeNode, _super);
        function TerminalTreeNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TerminalTreeNode.prototype["super"] = function (value) {
            this.value = value;
        };
        return TerminalTreeNode;
    }(TreeNode));
    TSC.TerminalTreeNode = TerminalTreeNode;
    /**
     * A TreeNode that represents any value
     */
    var GeneralTreeNode = /** @class */ (function (_super) {
        __extends(GeneralTreeNode, _super);
        function GeneralTreeNode() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GeneralTreeNode.prototype["super"] = function (value) {
            this.value = value;
        };
        return GeneralTreeNode;
    }(TreeNode));
    TSC.GeneralTreeNode = GeneralTreeNode;
})(TSC || (TSC = {}));
