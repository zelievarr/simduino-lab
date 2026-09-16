const assets={klass:'/reactions/klass.png',angry:'/reactions/angry.png',wtf:'/reactions/wtf.png'};
let errorStreak=0,reactionTimer=null,reactionStage=null;

export function reactionForOutcome(success,errorsBefore=0){
 return success?'klass':(errorsBefore+1>=2?'wtf':'angry');
}

function removeReaction(){
 clearTimeout(reactionTimer);reactionStage?.remove();reactionStage=null;
}

function showReaction(kind){
 removeReaction();
 if(!document.querySelector('#canvas'))return;
 const stage=document.createElement('div');
 stage.className=`reaction-stage reaction-${kind}`;stage.setAttribute('aria-hidden','true');
 const image=document.createElement('img');image.className='reaction-image';image.src=assets[kind];image.alt='';image.draggable=false;
 stage.append(image);document.body.append(stage);reactionStage=stage;
 reactionTimer=setTimeout(removeReaction,kind==='wtf'?3500:3000);
}

export function showSuccessReaction(){
 const kind=reactionForOutcome(true,errorStreak);errorStreak=0;showReaction(kind);return kind;
}

export function showFailureReaction(){
 const kind=reactionForOutcome(false,errorStreak);errorStreak++;showReaction(kind);return kind;
}

export function preloadReactions(){
 Object.values(assets).forEach(src=>{const image=new Image();image.src=src;});
}
