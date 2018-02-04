module TSC {
    export enum WarningType {
        MissingEOP = "MissingEOP"
    }
    export class Warning {
        type: WarningType;
        value: String;
        lineNumber: number;

        constructor(tokenType: WarningType, value: String, lineNumber: number) {
            this.type = tokenType;
            this.value = value;
            this.lineNumber = lineNumber;
        }
    }
}