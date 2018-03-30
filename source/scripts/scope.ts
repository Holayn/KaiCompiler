module TSC {
    export class ScopeObject {
        type: any;
        initialized: boolean;
        constructor(){
            this.initialized = false;
        }
    }

    export class ScopeNode {
        table: Object;
        lineNumber: number;
        colNumber: number;
        constructor(){
            this.table = {};
        }
    }
}