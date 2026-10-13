export const logicTypes=['mux','not','and','or','xor','nand','nor','xnor'];
export const logicPins=type=>type==='mux'?['A','B','S','Y']:type==='not'?['A','Y']:['A','B','Y'];
// Ideal digital gates: floating inputs are LOW, HIGH begins at 2.5 V.
export function logicVoltage(type,read){
 const high=pin=>(read(pin)??0)>=2.5;
 let value;
 switch(type){
  case 'mux':value=high(high('S')?'B':'A');break;
  case 'not':value=!high('A');break;
  case 'and':value=high('A')&&high('B');break;
  case 'or':value=high('A')||high('B');break;
  case 'xor':value=high('A')!==high('B');break;
  case 'nand':value=!(high('A')&&high('B'));break;
  case 'nor':value=!(high('A')||high('B'));break;
  case 'xnor':value=high('A')===high('B');break;
  default:return null;
 }
 return value?5:0;
}
