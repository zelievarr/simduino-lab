const WATERMARK = 'SIMduino lab · Inspired by Talanov';

export function captureFilename(projectName, kind) {
  const clean = String(projectName || 'SIMduino').replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'SIMduino';
  return `${clean}-${kind === 'code' ? 'code' : 'scheme'}.png`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(Error('Не удалось создать PNG.')), 'image/png'));
}

function addWatermark(ctx, width, height) {
  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.shadowColor = '#000c';
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#ffffff66';
  ctx.fillText(WATERMARK, width - 18, height - 16);
  ctx.restore();
}

function stylesheetText() {
  return [...document.styleSheets].map(sheet => {
    try { return [...sheet.cssRules].map(rule => rule.cssText).join('\n'); }
    catch { return ''; }
  }).join('\n');
}

function flattenComponentShadows(source, clone) {
  const sources = [...source.querySelectorAll('*')].filter(el => el.shadowRoot?.querySelector('svg'));
  const clones = [...clone.querySelectorAll('*')].filter(el => el.tagName.startsWith('WOKWI-'));
  sources.forEach((component, index) => {
    const target = clones[index];
    if (!target) return;
    const svg = component.shadowRoot.querySelector('svg').cloneNode(true);
    const holder = document.createElement('div');
    holder.style.cssText = `display:block;width:${component.offsetWidth}px;height:${component.offsetHeight}px;overflow:visible`;
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    holder.append(svg);
    target.replaceWith(holder);
  });
}

function imageFromSvg(svgText) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svgText], {type: 'image/svg+xml;charset=utf-8'}));
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(Error('Браузер не смог подготовить снимок схемы.')); };
    image.src = url;
  });
}

async function drawSvgElement(ctx, svg, x, y, width, height) {
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (svg.isConnected) {
    const sourceNodes = [svg, ...svg.querySelectorAll('*')];
    const cloneNodes = [clone, ...clone.querySelectorAll('*')];
    const properties = ['fill','fill-opacity','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-opacity','opacity','display','visibility','font-family','font-size','font-style','font-weight','letter-spacing','text-anchor','stop-color','stop-opacity','filter','clip-path','mask','transform','transform-origin'];
    sourceNodes.forEach((node, index) => {
      const target = cloneNodes[index];
      if (!target) return;
      const computed = getComputedStyle(node);
      properties.forEach(property => target.style.setProperty(property, computed.getPropertyValue(property)));
    });
  }
  const image = await imageFromSvg(new XMLSerializer().serializeToString(clone));
  ctx.drawImage(image, x, y, width, height);
}

export async function captureCircuit(element, projectName) {
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) throw Error('Окно схемы сейчас не видно.');
  const ratio = Math.min(2, window.devicePixelRatio || 1.5);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.fillStyle = '#222627';
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = '#48504b85';
  for (let x = 0; x < rect.width; x += 18) for (let y = 0; y < rect.height; y += 18) ctx.fillRect(x, y, 1, 1);

  const wireSvg = element.querySelector('#wires');
  const world = element.querySelector('#world');
  if (wireSvg && world) {
    const clean = wireSvg.cloneNode(true);
    clean.querySelectorAll('.wire-hit,title,#draft-wire').forEach(node => node.remove());
    clean.querySelectorAll('.wire-line').forEach(path => {
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
    });
    const worldRect = world.getBoundingClientRect();
    await drawSvgElement(ctx, clean, worldRect.left - rect.left, worldRect.top - rect.top, worldRect.width, worldRect.height);
  }

  for (const part of element.querySelectorAll('.part')) {
    const component = [...part.querySelectorAll('*')].find(node => node.tagName.startsWith('WOKWI-'));
    const svg = component?.shadowRoot?.querySelector('svg');
    if (!svg) continue;
    const componentRect = component.getBoundingClientRect();
    await drawSvgElement(ctx, svg, componentRect.left - rect.left, componentRect.top - rect.top, componentRect.width, componentRect.height);
    const label = part.querySelector('.part-label');
    if (label) {
      const labelRect = label.getBoundingClientRect();
      ctx.fillStyle = '#9eaaa1';
      ctx.font = '600 12px "SFMono-Regular", Consolas, monospace';
      ctx.fillText(label.textContent, labelRect.left - rect.left, labelRect.top - rect.top + 13);
    }
  }
  const shade = ctx.createRadialGradient(rect.width / 2, rect.height / 2, Math.min(rect.width, rect.height) * .25, rect.width / 2, rect.height / 2, Math.max(rect.width, rect.height) * .72);
  shade.addColorStop(0, '#00000000');shade.addColorStop(1, '#10171a35');ctx.fillStyle = shade;ctx.fillRect(0, 0, rect.width, rect.height);
  addWatermark(ctx, rect.width, rect.height);
  downloadBlob(await canvasBlob(canvas), captureFilename(projectName, 'scheme'));
}

export function tokenizeCodeLine(line) {
  const pattern = /(\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:void|int|long|float|double|bool|char|byte|const|unsigned|signed|if|else|for|while|do|switch|case|break|continue|return|HIGH|LOW|INPUT|OUTPUT|true|false)\b|\b\d+(?:\.\d+)?\b)/g;
  const pieces = [];
  let cursor = 0;
  for (const match of line.matchAll(pattern)) {
    if (match.index > cursor) pieces.push({text: line.slice(cursor, match.index), color: '#d7dbe1'});
    const token = match[0];
    const color = token.startsWith('//') ? '#78877f' : token.startsWith('"') || token.startsWith("'") ? '#b8d98a' : /^\d/.test(token) ? '#deb986' : '#c1a7e5';
    pieces.push({text: token, color});
    cursor = match.index + token.length;
    if (token.startsWith('//')) break;
  }
  if (cursor < line.length) pieces.push({text: line.slice(cursor), color: '#d7dbe1'});
  return pieces;
}

export async function captureCode(code, projectName) {
  const lines = String(code).replace(/\t/g, '  ').split('\n');
  const charWidth = 9.6;
  const gutter = 74;
  const padding = 30;
  const width = Math.max(980, Math.min(1800, gutter + padding * 2 + Math.max(...lines.map(line => line.length), 20) * charWidth));
  const lineHeight = 26;
  const contentHeight = Math.max(300, padding + lines.length * lineHeight + 54);
  const canvas = document.createElement('canvas');
  const ratio = 2;
  canvas.width = Math.ceil(width * ratio);
  canvas.height = Math.ceil(contentHeight * ratio);
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.fillStyle = '#1b1d20';
  ctx.fillRect(0, 0, width, contentHeight);
  ctx.fillStyle = '#24272a';
  ctx.fillRect(0, 0, gutter, contentHeight);
  ctx.font = '16px "SFMono-Regular", Consolas, monospace';
  ctx.textBaseline = 'top';
  lines.forEach((line, index) => {
    const y = padding + index * lineHeight;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#626b70';
    ctx.fillText(String(index + 1), gutter - 18, y);
    ctx.textAlign = 'left';
    let x = gutter + padding;
    tokenizeCodeLine(line).forEach(piece => {
      ctx.fillStyle = piece.color;
      ctx.fillText(piece.text, x, y);
      x += ctx.measureText(piece.text).width;
    });
  });
  addWatermark(ctx, width, contentHeight);
  downloadBlob(await canvasBlob(canvas), captureFilename(projectName, 'code'));
}
