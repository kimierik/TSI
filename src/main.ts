
import { start_thing } from "./Vm"
import { ByteCode } from "./Bytecode"
import { lexInput } from "./compiler/lexer";
import * as fs from 'fs';
import * as path from 'path';
import { Parser } from "./compiler/parser";
import { prettyPrintAst } from "./utils/Prettyprint";


function main(){
    console.log("main start")
    let parser=new Parser;
    const code= 
    [
        ByteCode.ICONST,99, /* 0 */
        ByteCode.ICONST,2, 
        ByteCode.IADD, 
        ByteCode.PRINT,
        ByteCode.HALT       /* 4 */
    ];

    //start_thing(code)
    let data= fs.readFileSync(path.join(__dirname,"../examples/test.foo") )
    //console.log(data.toString())
    let tokens=lexInput(data.toString())
    let ast=parser.parseTokens(tokens)
    prettyPrintAst(ast)
    


    


    //console.log("main ended")
}



main()
