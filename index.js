let input    = document.getElementById('inputarea');
let acc      = document.getElementById('accumulator');
let ix       = document.getElementById('ix');
let hexd     = document.getElementById('hexd');
let reset    = document.getElementById('reset');
let output   = document.getElementById('output');
let p        = document.getElementById('p');
let zeroFlag = document.getElementById('zf')

let runButton    = document.getElementById('run');
let assembleBtn  = document.getElementById('asm');
let hexdButton   = document.getElementById('hexdb');



/*
    PROGRAM STORED FROM     0     to   265

*/

let opcodes = {
    engC: ['LDM', 'LDX', 'STO', 'ADD', 'INC', 'DEC', 'CMP', 'JPE', 'JPN', 'JMP', 'OUT', 'END', 'CMI', 'SUB', 'LSL', 'LSR', 'LDD', 'LDR', 'LDI', 'MOV'],
    hexC: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,21,22,17,18,19,20],
    desC: ['Load immediate value into the accumulator', 'Store the value in address which is (operand + index register) into the accumulator', 'Store value in the accumulator at address (operand) given', 'Add immediate value into the accumulator OR Add value at given address into the accumulator', 'Increment value at the given register ACC OR IX', 'Decrement value at the given register ACC OR IX', 'Compare immediate value with the value in the accumulator returns a value 1 (true) or 0 (false) in the zero flag', 'Jumps to the address in memory if the last compare was true (if 1 is stored in the zero flag)', 'Jumps to the address in memory if the last compare was false (if 0 was stored in the zero flag)', 'Conditionless jump to the address in memory given as the operand', 'Outputs the value in the accumulator to the output screen as an ASCII character', 'Ends the program', 'Compares (indirect addressing) the value in the accumulator with the value of the memory address given by the value stored in the memory address that is given in the operand', 'Subtract immediate value from the value int he accumulator OR Subtract value given at the address in the operand withe the value in the accumulator', 'Logical shift left with the shift ammount given by the operand', 'Logical shift right with the shift ammount given by the operand', 'Load value in the address given by the operand into the accumulator', 'Loads immediate value into the IX (index register)', 'Load value given at the address into the accumulator the address being stored at the address given by the operand', 'Move contents of the accumulator into the IX (index register)']
}

let pContent = "";
for(let i = 0; i < opcodes.engC.length; i++){
    pContent += `<br> ${opcodes.hexC[i]} <b> ${opcodes.engC[i]} </b> ${opcodes.desC[i]}`
}

p.innerHTML = pContent;



let memory = [];


memory = initMemory(memory);

let pc = 0;
let zero_flag = 0;
let accumulator = 0;
let indexReg = 0;
let outputV = "";

acc.value = accumulator;
ix.value  = indexReg;
zeroFlag.value  = zero_flag;

assembleBtn.addEventListener('click', function(){

    
    let assembledProgram = [];
    memory = initMemory(memory);

    let program = input.value;
    program = program.split('\n');
    
    let currentInstruction;
    for(let i = 0; i < program.length; i++){
        currentInstruction = program[i].split(' ');

        currentInstruction = splitInstruction(currentInstruction.join(' '));
        currentInstruction = arrayCleanUp(currentInstruction);


        for(let j = 0; j < currentInstruction.length; j++){
            for(let k = 0; k < opcodes.engC.length; k++) {
                if(opcodes.engC[k] == currentInstruction[j]){
                    currentInstruction[j] = opcodes.hexC[k];
                }
                if(currentInstruction[j] == 'ACC'){
                    currentInstruction[j] = '1';

                }else if(currentInstruction[j] == 'IX'){
                    currentInstruction[j] = '2'
                }
                if(currentInstruction[j] == '#'){
                    currentInstruction[j] = '00';
                }
                
                
            }
        }

        assembledProgram.push(currentInstruction.join(' '));
        
    }

    assembledProgram = assembledProgram.join(' ');

    // LOAD TO MEMORY
    assembledProgram = assembledProgram.split(' ');
    for(let i = 0; i < assembledProgram.length; i++){
        memory[i] = assembledProgram[i];
        
    }


})


function hexToDecimal(hex) {
    hex = hex.replace(/^0x/i, '');
    const decimal = parseInt(hex, 16);

    return decimal;
}

function initMemory(memory){
    let i_memory = [];
    for(let i = 0; i < 265; i++){
        i_memory.push(0);
    }

    return i_memory;
}



function printMemory(memory){
    let memoryPrint = [];
    
    let headerNum = 0;
    for(let i = 0; i < memory.length; i++){
        if(headerNum == 0){
            memoryPrint.push(`\n${headerNum}: `);
        }else if(headerNum % 10 === 0){
            memoryPrint.push(`\n${headerNum}: `);
        }

        memoryPrint.push(memory[i]);
        headerNum++;
    }

    return memoryPrint.join(' ');
}

function splitInstruction(instruction) {
    if (instruction.trim() === 'OUT') {
        return ['OUT'];
    }else if(instruction.trim() === 'END'){
        return ['END'];
    }


    const regex = /(\w+)\s+(#?)(\S+)/;
    const match = instruction.match(regex);

    if (match) {
        const operation = match[1];
        const hashSymbol = match[2] === '#' ? '#' : null;
        const operand = isNaN(match[3]) ? match[3] : parseInt(match[3], 10);

        return [operation, hashSymbol, operand];
    } else {
        return null; 
    }
}

function arrayCleanUp(array){
    for(let i = 0; i < array.length; i++){
        if(array[i] == null){
            array.splice(i, 1);
        }
    }

    return array;
}



hexdButton.addEventListener('click', function(){
    hexd.value =  printMemory(memory);
    
})

runButton.addEventListener('click', function(){

    

    for(pc = 0; pc < memory.length; pc++){
        
        if(memory[pc] == '1'){
            pc++;
            if(memory[pc] == '00'){ // IMMEDIATE
                pc++;
                accumulator = memory[pc];
                acc.value   = accumulator;
                
            }
        }

        if(memory[pc] == '2'){
            pc++;
            accumulator = memory[parseInt(memory[pc]) + parseInt(indexReg)];
            acc.value   = accumulator;
        }
        
        if(memory[pc] == '3'){
            pc++;
            memory[parseInt(memory[pc])] = accumulator;
        
                
            
        }


        if(memory[pc] == '4'){
            let tm;
            pc++;
            if(memory[pc] == '00'){ 
                pc++;
                tm = parseInt(accumulator);
                tm += parseInt(memory[pc++]);
                accumulator = tm.toString();
                acc.value   = accumulator;
                
            }else{                
                tm = parseInt(accumulator);
                tm += parseInt(memory[memory[pc++]]);
                accumulator = tm.toString(); 
                acc.value   = accumulator;
            }
        }

        if(memory[pc] == '5'){
            pc++;
            if(memory[pc] == '1'){
                accumulator++;
                acc.value   = accumulator;
            }else if(memory[pc] == '2'){
                indexReg++;
                acc.value   = accumulator;
            }
        }
        
        if(memory[pc] == '6'){
            pc++;
            if(memory[pc] == '1'){
                accumulator = parseInt(accumulator) - 1;
                acc.value   = accumulator.toString();
            }else if(memory[pc] == '2'){
                indexReg--;
                acc.value   = accumulator;
            }
        }

        if(memory[pc] == '7'){
            pc++;
            if(memory[pc] == '00'){ 
                pc++;
                if(parseInt(accumulator) == parseInt(memory[pc])){
                    zero_flag = 1;
                }else{
                    zero_flag = 0;
                }
                
            }else{                 
                if(accumulator == memory[parseInt(memory[pc])]){
                    zero_flag = 1;
                }else{
                    zero_flag = 0;
                }
            }
        }

        if(memory[pc] == '8'){
            pc++;
            if(zero_flag == 1){
                pc = memory[pc] - 1;
            }
            continue;

        }

        if(memory[pc] == '9'){
            pc++;
            if(zero_flag == 0){
                pc = memory[pc] - 1;
            }
            continue;
        }

        if(memory[pc] == '10'){
            pc++;
            pc = memory[pc] - 1;
            continue;
            
        }

        if(memory[pc] == '11'){
            outputV += String.fromCharCode(accumulator);

        }
        if(memory[pc] == '12'){
            pc++;
            return;
        }
        if(memory[pc] == '13'){
            pc++;
            if(accumulator == memory[parseInt(memory[parseInt(memory[pc])])]){
                zero_flag = 1;
            }else{
                zero_flag = 0;
            }
        }
        if(memory[pc] == '14'){
            pc++;
            let tm;
            if(memory[pc] == '00'){ 
                pc++;
                tm = parseInt(accumulator);
                tm -= parseInt(memory[pc++]);
                tm.toString();
                accumulator = tm;
                acc.value   = accumulator;
                
            }else{        
                tm = parseInt(accumulator);
                tm -= memory[parseInt(memory[pc++])]; 
                tm.toString();      
                accumulator = tm;
                acc.value   = accumulator;
            }
        }
        if(memory[pc] == '15'){
            
            

        }
        if(memory[pc] == '16'){
            pc++;
            if(memory[pc] == '00'){ 
                pc++;
                accumulator = (parseInt(accumulator) >>> parseInt(memory[pc]));
                acc.value   = accumulator;
                
            }else{                 
                pc++;
                accumulator =  (parseInt(accumulator) >>> memory[parseInt(memory[pc])]);
                acc.value   = accumulator;
            }
            
        }
        if(memory[pc] == '17'){
            pc++;
            if(memory[pc] != '00'){                 
                accumulator = memory[parseInt(memory[pc])];
                acc.value   = accumulator;
            }
        }
        if(memory[pc] == '18'){
            pc++;
            if(memory[pc] == '00'){ 
                pc++;
                indexReg = memory[pc];
                ix.value   = indexReg;
                
            }
        }
        if(memory[pc] == '19'){
            pc++;
            accumulator = memory[parseInt(memory[parseInt(memory[pc])])]
            acc.value   = accumulator;
        }
        if(memory[pc] == '20'){
            pc++;
            if(memory[pc] == '2'){
                indexReg = accumulator;
                acc.value   = accumulator;
                ix.value   = indexReg;
            }

        }
        if(memory[pc] == '21'){
            pc++
            accumulator = accumulator << memory[pc]
            acc.value = accumulator;
        }
       
    }


    acc.value    = accumulator;
    ix.value     = indexReg;
    output.value = outputV;
    zeroFlag.value  = zero_flag;
})

reset.addEventListener('click', function(){
    for(let i = 0; i < memory.length; i++){
        memory[i] = 0;
    }
    accumulator = 0;
    indexReg = 0;
    outputV = "";

    acc.value    = accumulator;
    ix.value     = indexReg;
    output.value = outputV;


})