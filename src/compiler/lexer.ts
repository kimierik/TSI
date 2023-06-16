//lex string into token list

import {exit} from "process"

//should be used to lex a file and a line
//so we can do propper interpretation thing

export enum TokenType{
    Illegal,

    NumLiteral,
    Identifier,

    Comma,
    Semicolon,

    Lparen,
    Rparen,
    Lsquerly,
    Rsquerly,
    Operator,

    Equals,
    EOF,


    KWReturn,
    KWIf,
}



type Token={
    tokentype:TokenType,
    val:string,
}


function makeToken(tokentype:TokenType,val:string):Token{ return { tokentype,val} }

function isChar(char:string):boolean{
    if (char==undefined){
        return false
    }
    let byte=char.charCodeAt(0)
    return "a".charCodeAt(0) <=byte &&"z".charCodeAt(0) >=byte || "A".charCodeAt(0) <=byte &&"Z".charCodeAt(0) >=byte 
}


function isnum(char:string):boolean{
    if (char==undefined){
        return false
    }
    let byte=char.charCodeAt(0)
    return "0".charCodeAt(0) <=byte &&"9".charCodeAt(0) >=byte
}


function lexInput(input:string):Token[]{
    let tokens:Token[] =[]
    let strPos=0

    while(strPos<input.length){
        let char=input[strPos]

        //skip white space
        if (char == ' ' || char == '\n'||  char == '\t'){
            strPos++
            continue
        }



        switch (char){
            case '{':
                tokens.push(makeToken(TokenType.Lsquerly, char))
                strPos++
                continue
            case '}':
                tokens.push(makeToken(TokenType.Rsquerly, char))
                strPos++
                continue

            case '(':
                tokens.push(makeToken(TokenType.Lparen, char))
                strPos++
                continue

            case ')':
                tokens.push(makeToken(TokenType.Rparen, char))
                strPos++
                continue

            case '+' || '*' || '-' || '/':
                tokens.push(makeToken(TokenType.Operator, char))
                strPos++
                continue

            case  '*' :
                tokens.push(makeToken(TokenType.Operator, char))
                strPos++
                continue

            case  '/' :
                tokens.push(makeToken(TokenType.Operator, char))
                strPos++
                continue

            case ',' :
                tokens.push(makeToken(TokenType.Comma, char))
                strPos++
                continue

            case ';' :
                tokens.push(makeToken(TokenType.Semicolon, char))
                strPos++
                continue
            case '=' :
                tokens.push(makeToken(TokenType.Equals, char))
                strPos++
                continue
        }




        //ident logic
        //this is not good logic rewrite this

        let id=""
        while(isChar(char)){ 
            id+=char
            char=input[++strPos]
        }
        //bad
        if (isChar(id[0])){
            if(isKeyword(id)){
                tokens.push(handleKeyword(id))

            }else{
                tokens.push(makeToken(TokenType.Identifier, id))
            }
            continue
        }
        
        //num literal logic
        while(isnum(char)){
            id+=char
            char=input[++strPos]
        }


        //bad
        if (isnum(id[0])){tokens.push(makeToken(TokenType.NumLiteral, id))
            continue
        }
        
        tokens.push(makeToken(TokenType.Illegal, char))
        strPos++
        console.log("illegal token : "+ char+ " is :"+ char.charCodeAt(0))

    }

    tokens.push(makeToken(TokenType.EOF, ""))
    return tokens

}


//TODO make the keyword handling better

function isKeyword(id:string):boolean{
    return id=="return"
}

function handleKeyword(id:string):Token{
    switch(id){
        case "return":
            return makeToken(TokenType.KWReturn, id)
        default:
            console.log("cannot handle keyword : ",id)
            exit()
    }

}


export {lexInput,Token} 


