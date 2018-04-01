module TSC {
    export class ScopeObject {
        value: any;
        initialized: boolean;
        constructor(){
            this.initialized = false;
        }
    }

    export class ScopeNode {
        table: Object;
        lineNumber: number;
        colNumber: number;
        id: number;
        constructor(){
            this.table = {};
        }
    }
}