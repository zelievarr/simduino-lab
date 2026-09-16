// Full word forms only. This prevents false positives in ordinary identifiers
// such as «себя», «class» or «compass».
const RUSSIAN_FORMS = new Set(`
 бля блят блять блядь блядский блядская блядские блядство
 сука суки суке суку сукой сукою сучка сучки сучке сучку сучкой
 хуй хуя хую хуем хуе хуи хуев хуйня хуйни хуйню хуйней хуйнюха
 пизда пизды пизде пизду пиздой пиздою пезда пезды пезде пезду пездой
 пиздец пиздеца пиздецу пиздецом пиздеть пизжу пиздишь пиздит пиздят
 ебать ебал ебала ебали ебало еблом ебешь ебете ебет ебут ебутся
 ебка ебки ебке ебку ебкой ебня ебаный ебаная ебаное ебаные ебанутый
 ебануть ебанул ебанула ебанули ебись ебитесь
 заебал заебала заебали заебать заебись заебывает заебывал
 выебал выебала выебали выебать выебывается
 поебал поебала поебали поебать проебал проебала проебали проебать
 подъебал подъебала подъебали подъебать подьебал подьебала подьебали подьебать
 доебал доебала доебали доебать наебал наебала наебали наебать
 переебал переебала переебали переебать отъебал отъебала отъебали отъебать
 долбоеб долбоеба долбоебы долбоебом мудак мудака мудаки мудаком
 гандон гандоны гандона гандоном залупа залупы залупе залупу залупой
 говно говна говне говном дерьмо дерьма дерьме дерьмом
`.trim().split(/\s+/));

const ENGLISH_FORMS = new Set(`
 fuck fucked fucker fuckers fucking fucks motherfucker motherfuckers motherfucking
 shit shitty shits shitting shitted bitch bitches bitchy cunt cunts dick dicks
 cock cocks asshole assholes bastard bastards
`.trim().split(/\s+/));

const TRANSLITERATED_FORMS = new Set(`
 blya blyat blyad suka suki huy hui huinya pizda pizdy pizdec pizdet ebat ebal ebka zaebal vyebal
`.trim().split(/\s+/));

function normalize(text){return String(text).toLowerCase().replace(/ё/g,'е').replace(/[@]/g,'a').replace(/\$/g,'s').replace(/[!1]/g,'i').replace(/[|]/g,'l');}
function isProfaneWord(word){return RUSSIAN_FORMS.has(word)||ENGLISH_FORMS.has(word)||TRANSLITERATED_FORMS.has(word);}
function maskedLetters(source){return source.match(/[a-zа-я](?:[._*\-\s]+[a-zа-я]){2,}/giu)?.map(value=>value.replace(/[^a-zа-я]/giu,''))||[];}

export function containsProfanity(source){
 const normalized=normalize(source);
 const words=normalized.match(/[a-zа-я]+/giu)||[];
 return words.some(isProfaneWord)||maskedLetters(normalized).some(isProfaneWord);
}
