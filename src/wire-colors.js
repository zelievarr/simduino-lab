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

export function migrateLegacyWireColors(project){
 for(const wire of project?.wires||[]){
  const automatic=automaticWireColor(wire.from,wire.to);
  if(wire.color==='#829399'&&automatic==='#111111')wire.color=automatic;
  if(wire.color==='#ef7575'&&automatic==='#ef4f55')wire.color=automatic;
 }
 return project;
}
