export function createSerialLineDecoder(emit,{maxBytes=500}={}){
 const decoder=new TextDecoder('utf-8');
 let bytes=[];
 const flush=()=>{emit(decoder.decode(Uint8Array.from(bytes)));bytes=[];};
 return byte=>{
  if(byte===10){flush();return;}
  if(byte===13)return;
  bytes.push(byte&255);
  if(bytes.length>=maxBytes)flush();
 };
}
