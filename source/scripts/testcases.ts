/* --------  
   testcases.ts

   Loads testcases into editor
   -------- */

   module TSC {
    
        export class Testcases {
    
        public static load(testcase: any){
            switch(testcase){
                case "Simple 1":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* This is a simple program with no operations */\n{}$`;
                    break;
                case "Simple 2":
                    (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* This is a simple program with no operations */\n{}$`;
                    break;
            }
        }
    }
}
    