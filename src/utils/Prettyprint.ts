//parser ast pretty print



import {type} from "os"
import * as parser from "../compiler/parser"
import { FunctionCall,FunctionDecl,  } from "../compiler/parser"


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
        }


    }


}



function printFncall(call:FunctionCall){
    console.log("caling : ",call.name)
    console.log("with : ",call.arguments)
    console.log("")
}

function printExpressions(expressions : parser.Expr){}




function printFnDecl(call:FunctionDecl){
    console.log("declared: ", call.name)
    console.log("body: ")
                prettyPrintAst(call.body)
    console.log("paramc: ", call.parameterC)
    console.log("")
}

export {prettyPrintAst}
