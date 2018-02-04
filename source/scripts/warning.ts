module TSC {
    export enum WarningType {
        MissingEOP = "MissingEOP"
    }
    export class Warning {
        type: WarningType;
        value: String;

        constructor(tokenType: WarningType, value: String) {
            this.type = tokenType;
            this.value = value;
        }
    }
}