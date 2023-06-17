
import { startVm } from "./Vm"
import { ByteCode } from "./Bytecode"
import { lexInput } from "./compiler/lexer";
import * as fs from 'fs';
import * as path from 'path';
import { Parser } from "./compiler/parser";
import { prettyPrintAst, prettyPrintByteCode } from "./utils/Prettyprint";
import { ByteCodeCompiler } from "./compiler/bytecode-compiler";


function main(){
    console.log("main start")
    let parser=new Parser;
    let compiler = new ByteCodeCompiler()

    let data= fs.readFileSync(path.join(__dirname,"../examples/factorial.foo") )
    //let data= fs.readFileSync(path.join(__dirname,"../examples/test.foo") )

    let tokens=lexInput(data.toString())
    
    let ast=parser.parseTokens(tokens)


    //prettyPrintAst(ast)

    compiler.compileAst(ast,undefined)
    let code= compiler.getbytecode()

    //currently manually push halt
    code.push(ByteCode.HALT)
    
    //prettyPrintByteCode(code)

    startVm(code,false)

    //console.log("main ended")
}



main()
