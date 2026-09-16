// Temporary Yandex Ads slot. Remove this import/mount call and the matching CSS block to delete it.
export function mountAdPlaceholder(){
 const status=document.querySelector('.statusbar');
 if(!status||document.querySelector('#ad-placeholder'))return;
 const slot=document.createElement('aside');
 slot.id='ad-placeholder';slot.className='ad-placeholder';slot.setAttribute('aria-label','Рекламное место');
 slot.innerHTML='<div class="ad-placeholder-inner"><span>Реклама</span><div aria-hidden="true"></div></div>';
 status.before(slot);
}
