export const SIGNAL_WIRE_COLORS=['#d8f65d','#70c8ff','#c999ff','#ffc857','#5fe0c0','#ff8db4','#a9b4ff'];

export function endpointRole(endpoint=''){
 const pin=String(endpoint).split(':').slice(1).join(':').toUpperCase();
 if(pin.includes('GND'))return'ground';
 if(pin==='5V'||pin==='VCC'||pin==='V+')return'power';
 return'signal';
}

export function automaticWireColor(from,to,signalIndex=0){
 const roles=[endpointRole(from),endpointRole(to)];
 if(roles.includes('ground'))return'#111111';
 if(roles.includes('power'))return'#ef4f55';
 return SIGNAL_WIRE_COLORS[Math.abs(signalIndex)%SIGNAL_WIRE_COLORS.length];
}
