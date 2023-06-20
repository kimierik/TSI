
interface Expr{
    eDiscriminator:string | "RAW EXPRESSION"
}

function makeExpr(){
    return{
        eDiscriminator:"RAW EXPRESSION"
    }
}


interface Statement{
    discriminator:string | "RawStatement"
}

type FunctionDecl={
    discriminator:"FunctionDecl"
    name:string
    body:Statement[]
    parameterC:number
    parameterNames:string[]
}


function makeFuncDecl():FunctionDecl{
    return{
        discriminator:"FunctionDecl",
        name:"",
        body:[],
        parameterC:0,
        parameterNames:[]
    }
}


type FunctionCall={
    discriminator:"FunctionCall"
    eDiscriminator:"FunctionCall"
    name:string,
    arguments:Expr[],
}


function makeFuncCall():FunctionCall{
    return{
        discriminator:"FunctionCall",
        eDiscriminator:"FunctionCall",
        name:"",
        arguments:[],
    }
}



type VariableRefrence={
    eDiscriminator:"VariableRefrence"
    name:string,
}
function makeVariableRefrence(name:string):VariableRefrence{
    return{
        eDiscriminator:"VariableRefrence",
        name:name,
    }
}


type VariableDecl={
    discriminator:"VariableDecl"
    name:string,
    init:Expr|undefined
    nth:number,
}

function makeVariableDecl():VariableDecl{
    return{
        discriminator:"VariableDecl",
        name:"",
        init:undefined,
        nth:0,
    }
}


type ReturnNode={
    discriminator:"ReturnStatement"
    rets:Expr
}
function makeReturnNode(e:Expr):ReturnNode{
    return{
        discriminator:"ReturnStatement",
        rets:e
    }
}



type VariableAssigment={
    discriminator:"VariableAssigment"
    name:string,
    val:Expr
}


function makeVariableAssigment():VariableAssigment{
    return{
        discriminator:"VariableAssigment",
        name:"",
        val: makeExpr(),
    }
}



type ILiteralNode={
    eDiscriminator:"NumLiteral"
    val:number
}

function makeILiteralNode(val:number):ILiteralNode{
    return{
        eDiscriminator:"NumLiteral",
        val:val
    }
}

type OpNode={
    eDiscriminator:"Operation"
    l:Expr,
    r:Expr,
    opp:string
}

function makeOpnode():OpNode{
    return{
        eDiscriminator:"Operation",
        l:makeExpr(),
        r:makeExpr(),
        opp:""

    }
}

type IfNode={
    discriminator:"IFNODE",
    lexpr:Expr,
    rexpr:Expr,
    op:string,
    Tbody:Statement[],
    Fbody:Statement[]
}

function makeIfNode():IfNode{
    return{
        discriminator:"IFNODE",
        lexpr:makeExpr(),
        rexpr:makeExpr(),
        op:"",
        Tbody:[],
        Fbody:[]
    }
}

export {Expr, makeExpr ,Statement, 
    FunctionDecl, makeFuncDecl,
    FunctionCall, makeFuncCall,
    VariableRefrence, makeVariableRefrence,
    VariableAssigment, makeVariableAssigment, 
    VariableDecl, makeVariableDecl,
    OpNode, makeOpnode, 
    ILiteralNode, makeILiteralNode,
    IfNode, makeIfNode,
    ReturnNode, makeReturnNode,
}


