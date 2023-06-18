
import { startVm } from "./Vm"
import { ByteCode } from "./Bytecode"
import { lexInput } from "./compiler/lexer";
import * as fs from 'fs';
import * as path from 'path';
import { Parser } from "./compiler/parser";
import { prettyPrintAst, prettyPrintByteCode } from "./utils/Prettyprint";
import { ByteCodeCompiler } from "./compiler/bytecode-compiler";
import {exit} from "process";


function main(){
    console.log("main start")
    let filename=""

    console.log(process.argv.length)

    if (process.argv.length==1){
        printHelp()
        exit()
    }
    if (process.argv.length==3){
        filename=process.argv[2]
    }

    for (let i =0; i<process.argv.length;i++){
        let arg=process.argv[i]
        switch(arg){
            case '-h':
                printHelp()
            break
            
            case '--help':
                printHelp()
            break

            case '-i':
                filename=process.argv[i+1]
                break
        }
    }

    if (filename==""){
        printHelp()
        exit()
    }


    let parser=new Parser;
    let compiler = new ByteCodeCompiler()

    let rpath = path.join(__dirname,"../"+filename) 
    let data= fs.readFileSync(rpath)

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

function printHelp(){
    console.log("help text")
    console.log("first argument should be the filename to interpret")

}


