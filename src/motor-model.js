export const bridgePins=['1,2EN','1A','1Y','GND.4','GND.5','2Y','2A','VCC2','3,4EN','3A','3Y','GND.12','GND.13','4Y','4A','VCC1'];
export const bridgeTypes=['sn754410','l293d'];
export const breadboardColumns=30;
export function breadboardGroups(){
 const groups=['+1','-1','+2','-2'].map(rail=>Array.from({length:breadboardColumns},(_,i)=>rail+'.'+(i+1)));
 for(let i=1;i<=breadboardColumns;i++)for(const rows of ['ABCDE','FGHIJ'])groups.push([...rows].map(row=>row+i));
 return groups;
}
export function bridgeOutput(channel,read,grounded){
 const supply=read('VCC2'),logic=read('VCC1');
 if(!grounded||!(logic>=4.5)||!(supply>=4.5))return null;
 const enable=read(channel<=2?'1,2EN':'3,4EN');
 if(!(enable>0))return null;
 return {voltage:(read(channel+'A')??0)>=2?supply:0,duty:Math.min(1,enable/5)};
}
export function motorSpeed(a,b){
 if(!a||!b)return 0;
 return Math.max(-1,Math.min(1,(a.voltage-b.voltage)*Math.min(a.duty,b.duty)/9));
}
