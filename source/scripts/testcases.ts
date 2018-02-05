/* --------  
   testcases.ts

   Loads testcases into editor
   -------- */

   module TSC {
    
        export class Testcases {
    
        public static load(testcase: any){
            if(testcase.innerHTML == "Basic 1"){
                (<HTMLInputElement>document.getElementById("taSourceCode")).value = `/* This is a simple program with no operations */\n{}$`
            }
        }
    }
}
    