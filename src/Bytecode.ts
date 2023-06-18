//ints
export enum ByteCode{
    ICONST,
    PRINT,
    HALT,
    JUMP,

    LOAD,
    SAVE,
    REPL,


    JLT,
    JEQ,

    IADD,
    IMUL,
    ISUB,
    IDIV,

    CALL,
    RET,
}


/*
    *
    * ICONST        next value is pushed on to the stack
    * PRINT         prints top of stack
    * HALT          ends program
    * JUMP          jumps to next value
    *
    * LOAD          loads value from stack
    * save          push val to stack
    * REPL          put top of stack to adress
    *
    * JLT           jump less than pop's 2 from stack compares if lesthan jumps to adress
    * JEQ           jump less than pop's 2 from stack compares if eq jumps to adress
    *
    * IADD          pop's 2 and applies propper operrand
    * ISUB          pop's 2 and applies propper operrand
    * IMUL          pop's 2 and applies propper operrand
    * IDIV          pop's 2 and applies propper operrand
    *
    * CALL          jumps to address with paramcount
    * RET           returns
    *
    * */






