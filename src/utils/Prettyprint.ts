//parser ast pretty print



import {type} from "os"
import {ByteCode} from "../Bytecode"
import * as parser from "../compiler/parser"
import { FunctionCall,FunctionDecl, VariableAssigment  } from "../compiler/parser"

function prettyPrintAst(ast:parser.Statement[]){
    //go through tree and print it like it should be printer

    //we need to do runtime type checking
    for (let i=0; i<ast.length;i++){
        let statement=ast[i]

        switch (statement.discriminator){
            case "FunctionCall":
                printFncall(statement as FunctionCall)
                break

            case "FunctionDecl":
                printFnDecl(statement as FunctionDecl)
                break
            case "VariableAssigment":
                printVarAssigment(statement as VariableAssigment)
                break
            default:
                console.log("unimplemented statement :" ,statement)
        }


    }

}

function printFncall(call:FunctionCall){
    console.log("caling : ",call.name)
    console.log("with : ",call.arguments)
    console.log("")
}

function printVarAssigment(assigment : parser.VariableAssigment){
    console.log("assigning :",assigment.val)
    console.log("To variable :",assigment.name)


}

function printFnDecl(call:FunctionDecl){
    console.log("declared: ", call.name)
    console.log("body: ")
                prettyPrintAst(call.body)
    console.log("paramc: ", call.parameterC)
    console.log("")
}





function prettyPrintByteCode(code:number[]){

    let pos=0
    while( pos<code.length){
        process.stdout.write("address :"+pos+"\t")
        switch (code[pos]){
            case ByteCode.ICONST:
                console.log("ICONST " ,code[++pos])
                pos++
            continue


            case ByteCode.IADD:
                console.log("IADD ")
                pos++
            continue


            case ByteCode.PRINT:
                console.log("PRINT ")
                pos++
            continue

            case ByteCode.RET:
                console.log("RETURN ")
                pos++
            continue


            case ByteCode.CALL:
                console.log("CALL addr:", code[++pos],"wiht ",code[++pos])
                pos++
            continue

            case ByteCode.LOAD:
                console.log("LOAD:", code[++pos])
                pos++
            continue
            case ByteCode.JUMP:
                console.log("JUMP to:", code[++pos])
                pos++
            continue


            case ByteCode.HALT:
                console.log("HALT")
                pos++
            continue



            default:
                console.log("defaulted :",code[pos++])
        }


    }

}



export {prettyPrintAst, prettyPrintByteCode}
