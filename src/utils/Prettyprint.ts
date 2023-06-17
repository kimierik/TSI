//parser ast pretty print



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
                console.log("unprintavle statement :" ,statement)
        }


    }

}

function printFncall(call:FunctionCall){
    console.log("caling : ",call.name)
    console.log("with : ")
    for (let i =0;i<call.arguments.length;i++){
        process.stdout.write("\t")
        printExpr(call.arguments[i])
    }
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


function printExpr(e:parser.Expr){
    switch(e.eDiscriminator){
        case "NumLiteral":
            let lit=e as parser.ILiteralNode
            console.log("literal: ",lit.val)
            break

        case "Operation":
            let op=e as parser.OpNode
            console.log("opp: ",op.opp)
            printExpr(op.l)
            printExpr(op.r)
            break

        default:
        console.log("unimplemented expression",e)
    }

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

            case ByteCode.IMUL:
                console.log("IMUL ")
                pos++
            continue

            case ByteCode.ISUB:
                console.log("ISUB ")
                pos++
            continue

            case ByteCode.IDIV:
                console.log("IDIV ")
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

            case ByteCode.JEQ:
                console.log("if EQ jump to:", code[++pos])
                pos++
            continue

            case ByteCode.JLT:
                console.log("if LessThan jump to:", code[++pos])
                pos++
            continue

            case ByteCode.SAVE:
                console.log("SAVE:", code[++pos])
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
                console.log("defaulted printing :",code[pos++])
        }


    }

}

function prettyPrintOpCode(op:number){

        switch (op){
            case ByteCode.ICONST:
                console.log("ICONST " )
            break


            case ByteCode.IADD:
                console.log("IADD ")
            break

            case ByteCode.IMUL:
                console.log("IMUL ")
            break

            case ByteCode.ISUB:
                console.log("ISUB ")
            break

            case ByteCode.IDIV:
                console.log("IDIV ")
            break


            case ByteCode.PRINT:
                console.log("PRINT ")
            break

            case ByteCode.RET:
                console.log("RETURN ")
            break


            case ByteCode.CALL:
                console.log("CALL " )
            break

            case ByteCode.LOAD:
                console.log("LOAD:")
            break

            case ByteCode.JEQ:
                console.log("if EQ jump ")
            break

            case ByteCode.JLT:
                console.log("if LessThan jump")
            break

            case ByteCode.SAVE:
                console.log("SAVE:", )
            break


            case ByteCode.JUMP:
                console.log("JUMP to:", )
            break


            case ByteCode.HALT:
                console.log("HALT")
            break



            default:
                console.log("defaulted printing opcode  :" , op)

        }

}



export {prettyPrintAst, prettyPrintByteCode, prettyPrintOpCode}
