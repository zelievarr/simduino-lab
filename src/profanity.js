const ENGLISH = /\b(?:fuck(?:er|ing|ed|s)?|motherfuck\w*|shit(?:ty|ting|ted|s)?|bitch(?:es|ing|y)?|cunts?|dicks?|cocks?|assholes?|bastards?)\b/i;
const RUSSIAN = /(?:^|[^а-я])(?:х(?:у[йеяиюё]|уе|уя)[а-яa-z0-9_]*|пизд[а-яa-z0-9_]*|(?:долбо)?[её]б(?:а|у|и|л|н|уч|ат|ан|аш|ись|ется)[а-яa-z0-9_]*|бля(?:д|т|ха)?[а-яa-z0-9_]*|су(?:ка|ки|ку|ке|кой)[а-яa-z0-9_]*|мудак[а-яa-z0-9_]*|гандон[а-яa-z0-9_]*|залуп[а-яa-z0-9_]*|говн[а-яa-z0-9_]*|дерьм[а-яa-z0-9_]*)(?:$|[^а-я])/i;
const TRANSLIT = /\b(?:blya(?:d|t)?\w*|suka\w*|hui\w*|huy\w*|pizd\w*|yeb\w*|ebat\w*)\b/i;

function normalize(text){return String(text).toLowerCase().replace(/ё/g,'е').replace(/[@]/g,'a').replace(/\$/g,'s').replace(/[!1]/g,'i').replace(/[|]/g,'l');}

export function containsProfanity(source){
 const normalized=normalize(source);
 if(ENGLISH.test(normalized)||RUSSIAN.test(normalized)||TRANSLIT.test(normalized))return true;
 return normalized.split(/\r?\n/).some(line=>{
  const compact=line.replace(/[^a-zа-я]+/gi,' ');
  const joined=line.replace(/[^a-zа-я]+/gi,'');
  return ENGLISH.test(compact)||RUSSIAN.test(compact)||TRANSLIT.test(compact)||ENGLISH.test(joined)||RUSSIAN.test(joined)||TRANSLIT.test(joined);
 });
}
