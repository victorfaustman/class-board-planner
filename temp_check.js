
    const SHEETS = { A4:{w:210,h:297}, A3:{w:297,h:420} };
    const state = { posters:[], pending:null, pendingLoading:false, activeId:null, drag:null };
    const $ = (id)=>document.getElementById(id);

    function id(){ return Math.random().toString(36).slice(2,9); }
    function inputVals(){ return { wallW:Math.max(50,Number($('wallW').value)||300), wallH:Math.max(40,Number($('wallH').value)||120), target:Math.max(1,Math.min(60,Number($('targetSheets').value)||8)), sheet:$('sheetType').value }; }
    function bestGrid(target,imgRatio,tileRatio){ let best={cols:1,rows:1,sheets:1,score:1e9}; for(let c=1;c<=30;c++){for(let r=1;r<=30;r++){const s=c*r;if(s>60) continue; const pr=(c*tileRatio)/r; const score=Math.abs(Math.log(pr/imgRatio))*2 + Math.abs(s-target)/Math.max(1,target); if(score<best.score) best={cols:c,rows:r,sheets:s,score};}} return best; }

    function recalcPoster(p, targetValue, sheetType){
      p.sheet = sheetType || p.sheet;
      p.orientation = p.orientation || 'portrait';
      const target = Math.max(1, Math.min(60, Number(targetValue) || p.target || 8));
      const sheet = SHEETS[p.sheet] || SHEETS.A4;
      const baseW = p.orientation === 'landscape' ? sheet.h : sheet.w;
      const baseH = p.orientation === 'landscape' ? sheet.w : sheet.h;
      const tileW = baseW - 13, tileH = baseH - 13;
      const g = bestGrid(target, p.w/p.h, tileW/tileH);
      p.target = target; p.cols=g.cols; p.rows=g.rows; p.sheets=g.sheets; p.posterW=g.cols*tileW; p.posterH=g.rows*tileH;
    }

    function recalcPosterFromSizeMm(p, desiredWmm, desiredHmm){
      p.orientation = p.orientation || 'portrait';
      const sheet = SHEETS[p.sheet] || SHEETS.A4;
      const baseW = p.orientation === 'landscape' ? sheet.h : sheet.w;
      const baseH = p.orientation === 'landscape' ? sheet.w : sheet.h;
      const tileW = baseW - 13, tileH = baseH - 13;
      const cols = Math.max(1, Math.ceil(desiredWmm / tileW));
      const rows = Math.max(1, Math.ceil(desiredHmm / tileH));
      p.cols = cols;
      p.rows = rows;
      p.sheets = cols * rows;
      p.target = p.sheets;
      p.posterW = cols * tileW;
      p.posterH = rows * tileH;
    }

    function makePosterFromPending(){
      if(!state.pending) return null;
      const i=inputVals();
      const p={ id:id(), type:'image', url:state.pending.url, w:state.pending.w, h:state.pending.h, sheet:i.sheet, orientation:'portrait', target:i.target, cols:1, rows:1, sheets:1, posterW:0, posterH:0, x:0.5, y:0.5 };
      recalcPoster(p, i.target, i.sheet);
      return p;
    }

    function makeTextPoster(){
      const txt = ($('textValue').value || '').trim();
      if(!txt) return null;
      const i=inputVals();
      const target = Math.max(1, Math.min(60, Number($('textTargetSheets').value) || 4));
      const p = {
        id:id(),
        type:'text',
        text:txt,
        font:$('textFont').value || 'Arial',
        w:1800,
        h:600,
        sheet:i.sheet,
        orientation:'portrait',
        target,
        cols:1,
        rows:1,
        sheets:1,
        posterW:0,
        posterH:0,
        x:0.5,
        y:0.5
      };
      recalcPoster(p, target, i.sheet);
      return p;
    }

    function getPosterRenderUrl(p){
      if(p.type !== 'text') return p.url;
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let size = 180;
      const family = p.font || 'Arial';
      ctx.font = `700 ${size}px "${family}"`;
      while (size > 36 && ctx.measureText((p.text || '').toUpperCase()).width > canvas.width * 0.9) {
        size -= 6;
        ctx.font = `700 ${size}px "${family}"`;
      }
      ctx.fillText((p.text || '').toUpperCase(), canvas.width / 2, canvas.height / 2);
      return canvas.toDataURL('image/png');
    }

    function wallPx(){ const i=inputVals(); const wallWmm=i.wallW*10, wallHmm=i.wallH*10; const ppm=Math.min(900/wallWmm,520/wallHmm); return { w:Math.max(320,Math.round(wallWmm*ppm)), h:Math.max(180,Math.round(wallHmm*ppm)), ppm }; }
    function posterPx(p){ const wp=wallPx(); return { w:Math.max(90,Math.round(p.posterW*wp.ppm)), h:Math.max(70,Math.round(p.posterH*wp.ppm)) }; }

    function syncEditor(){
      const p = state.posters.find(x=>x.id===state.activeId);
      $('editorCard').style.display = p ? 'block' : 'none';
      if(!p) return;
      $('selectedSheets').value = p.target;
      $('selectedType').value = p.sheet;
      $('selectedOrientation').value = p.orientation || 'portrait';
      const isText = p.type === 'text';
      $('textEditorRow').style.display = isText ? 'flex' : 'none';
      if(isText){
        $('selectedTextValue').value = p.text || '';
        $('selectedTextFont').value = p.font || 'Arial';
      }
    }

    function render(){
      const wp=wallPx(); const wall=$('wall'); wall.style.width=wp.w+'px'; wall.style.height=wp.h+'px'; wall.innerHTML='';
      let total=0;
      for(const p of state.posters){
        total += p.sheets;
        const pp=posterPx(p);
        const el=document.createElement('div'); el.className='poster'+(p.id===state.activeId?' active':''); el.dataset.id=p.id;
        el.style.width=pp.w+'px'; el.style.height=pp.h+'px';
        const cx=Math.round(p.x*wp.w), cy=Math.round(p.y*wp.h);
        el.style.left=Math.max(0,Math.min(wp.w-pp.w,cx-pp.w/2))+'px';
        el.style.top=Math.max(0,Math.min(wp.h-pp.h,cy-pp.h/2))+'px';

        const tiles=document.createElement('div'); tiles.className='tiles'; tiles.style.gridTemplateColumns=`repeat(${p.cols},1fr)`; tiles.style.gridTemplateRows=`repeat(${p.rows},1fr)`;
        for(let r=0;r<p.rows;r++){ for(let c=0;c<p.cols;c++){ const n=r*p.cols+c+1; const t=document.createElement('div'); t.className='tile'; t.textContent=n;
          const bgX=p.cols===1?50:(c/(p.cols-1))*100, bgY=p.rows===1?50:(r/(p.rows-1))*100;
          const renderUrl = getPosterRenderUrl(p);
          t.style.backgroundImage=`linear-gradient(rgba(255,255,255,.15), rgba(255,255,255,.15)), url('${renderUrl}')`;
          t.style.backgroundSize=`${p.cols*100}% ${p.rows*100}%`; t.style.backgroundPosition=`${bgX}% ${bgY}%`; tiles.appendChild(t);
        }}
        const lbl=document.createElement('div'); lbl.className='posterLabel'; lbl.textContent=`${p.type==='text'?'Текст':'Изобр.'} · ${p.sheet} ${p.orientation === 'landscape' ? 'гор.' : 'верт.'} · ${p.sheets} л.`;
        const handle=document.createElement('div'); handle.className='resize-handle';
        el.appendChild(tiles); el.appendChild(lbl); el.appendChild(handle); wall.appendChild(el);
      }
      $('totalSheets').textContent=String(total);
      $('stats').textContent = state.posters.length ? `Постеров: ${state.posters.length}.` : 'Добавь хотя бы одно изображение.';
      syncEditor();
    }

    $('imageFile').addEventListener('change',(e)=>{
      const f=e.target.files&&e.target.files[0];
      if(!f){
        state.pending = null;
        state.pendingLoading = false;
        $('fileStatus').textContent = 'Файл не выбран.';
        return;
      }
      state.pending = null;
      state.pendingLoading = true;
      $('fileStatus').textContent = 'Загружаю изображение...';
      const rd = new FileReader();
      rd.onload = () => {
        const img = new Image();
        img.onload = () => {
          state.pending = { url: rd.result, w: img.naturalWidth, h: img.naturalHeight };
          state.pendingLoading = false;
          $('fileStatus').textContent = `Готово: ${f.name} (${img.naturalWidth}x${img.naturalHeight})`;
        };
        img.onerror = () => {
          state.pending = null;
          state.pendingLoading = false;
          $('fileStatus').textContent = 'Ошибка чтения изображения.';
        };
        img.src = rd.result;
      };
      rd.onerror = () => {
        state.pending = null;
        state.pendingLoading = false;
        $('fileStatus').textContent = 'Не удалось прочитать файл.';
      };
      rd.readAsDataURL(f);
    });

    $('addPosterBtn').addEventListener('click',()=>{
      if(state.pendingLoading){ alert('Подожди, изображение еще загружается.'); return; }
      if(!state.pending){ alert('Сначала загрузи изображение.'); return; }
      const p=makePosterFromPending(); if(!p) return;
      state.posters.push(p); state.activeId=p.id; render();
      $('fileStatus').textContent = 'Постер добавлен на доску.';
    });
    $('addTextPosterBtn').addEventListener('click',()=>{
      const p = makeTextPoster();
      if(!p){ alert('Введи текст надписи.'); return; }
      state.posters.push(p);
      state.activeId = p.id;
      render();
    });

    $('selectedSheets').addEventListener('input',()=>{
      const p=state.posters.find(x=>x.id===state.activeId); if(!p) return;
      recalcPoster(p, $('selectedSheets').value, $('selectedType').value); render();
    });
    $('selectedType').addEventListener('input',()=>{
      const p=state.posters.find(x=>x.id===state.activeId); if(!p) return;
      recalcPoster(p, $('selectedSheets').value, $('selectedType').value); render();
    });
    $('selectedOrientation').addEventListener('input',()=>{
      const p=state.posters.find(x=>x.id===state.activeId); if(!p) return;
      p.orientation = $('selectedOrientation').value;
      recalcPoster(p, $('selectedSheets').value, $('selectedType').value);
      render();
    });
    $('selectedTextValue').addEventListener('input',()=>{
      const p=state.posters.find(x=>x.id===state.activeId); if(!p || p.type!=='text') return;
      p.text = $('selectedTextValue').value || '';
      render();
    });
    $('selectedTextFont').addEventListener('input',()=>{
      const p=state.posters.find(x=>x.id===state.activeId); if(!p || p.type!=='text') return;
      p.font = $('selectedTextFont').value || 'Arial';
      render();
    });
    $('deleteSelected').addEventListener('click',()=>{
      if(!state.activeId) return;
      state.posters = state.posters.filter(p=>p.id!==state.activeId);
      state.activeId = state.posters[0]?.id || null;
      render();
    });

    function pointerToWall(e){ const r=$('wall').getBoundingClientRect(); return { x:e.clientX-r.left, y:e.clientY-r.top }; }
    $('wall').addEventListener('mousedown',(e)=>{
      const pEl=e.target.closest('.poster'); if(!pEl) return;
      const pid=pEl.dataset.id; const p=state.posters.find(x=>x.id===pid); if(!p) return;
      state.activeId=pid;
      const pt=pointerToWall(e);
      const wp=wallPx();
      const pp=posterPx(p);
      const cx=Math.round(p.x*wp.w), cy=Math.round(p.y*wp.h);
      const left=Math.max(0,Math.min(wp.w-pp.w,cx-pp.w/2));
      const top=Math.max(0,Math.min(wp.h-pp.h,cy-pp.h/2));
      if (e.target.closest('.resize-handle')) {
        state.drag={kind:'resize', id:pid, startX:pt.x, startY:pt.y, left, top, startW:pp.w, startH:pp.h};
      } else {
        state.drag={kind:'move', id:pid};
      }
      render();
    });
    window.addEventListener('mousemove',(e)=>{
      if(!state.drag) return;
      const p=state.posters.find(x=>x.id===state.drag.id); if(!p) return;
      const wp=wallPx(); const pt=pointerToWall(e);
      if (state.drag.kind === 'resize') {
        const ratio = p.w / p.h;
        const delta = Math.max(pt.x - state.drag.startX, pt.y - state.drag.startY);
        let newW = Math.max(60, state.drag.startW + delta);
        let newH = newW / ratio;
        if (state.drag.left + newW > wp.w) {
          newW = wp.w - state.drag.left;
          newH = newW / ratio;
        }
        if (state.drag.top + newH > wp.h) {
          newH = wp.h - state.drag.top;
          newW = newH * ratio;
        }
        recalcPosterFromSizeMm(p, newW / wp.ppm, newH / wp.ppm);
        const ppNew = posterPx(p);
        p.x = Math.max(0, Math.min(1, (state.drag.left + ppNew.w / 2) / wp.w));
        p.y = Math.max(0, Math.min(1, (state.drag.top + ppNew.h / 2) / wp.h));
      } else {
        p.x=Math.max(0,Math.min(1,pt.x/wp.w)); p.y=Math.max(0,Math.min(1,pt.y/wp.h));
      }
      render();
    });
    window.addEventListener('mouseup',()=>{ state.drag=null; });
    window.addEventListener('keydown',(e)=>{
      if((e.key==='Delete' || e.key==='Backspace') && state.activeId){
        state.posters = state.posters.filter(p=>p.id!==state.activeId);
        state.activeId = state.posters[0]?.id || null;
        render();
      }
    });

    function buildPrintHtml(){
      let pages='';
      for(const p of state.posters){
        const renderUrl = getPosterRenderUrl(p);
        for(let r=0;r<p.rows;r++) for(let c=0;c<p.cols;c++){
          const n=r*p.cols+c+1; const bgX=p.cols===1?50:(c/(p.cols-1))*100, bgY=p.rows===1?50:(r/(p.rows-1))*100;
          pages += `<div class="page"><div class="tile" style="background-image:url('${renderUrl}');background-size:${p.cols*100}% ${p.rows*100}%;background-position:${bgX}% ${bgY}%"><div class="num">${p.sheet} · ${n}/${p.sheets}</div></div></div>`;
        }
      }
      return `<!doctype html><html><head><meta charset="UTF-8"><style>@page{size:A4 portrait;margin:8mm}body{margin:0;font-family:Arial}.page{min-height:100vh;display:flex;align-items:center;justify-content:center;page-break-after:always}.page:last-child{page-break-after:auto}.tile{width:100%;aspect-ratio:210/297;border:1px dashed #999;background-repeat:no-repeat;position:relative}.num{position:absolute;left:8px;bottom:8px;background:rgba(255,255,255,.9);padding:2px 6px;border-radius:4px;font-size:12px;font-weight:700}</style></head><body>${pages}</body></html>`;
    }
    $('printBtn').addEventListener('click',()=>{ if(!state.posters.length){alert('Добавь хотя бы одно изображение.');return;} const w=window.open('','_blank'); if(!w) return; w.document.write(buildPrintHtml()); w.document.close(); setTimeout(()=>w.print(),300); });

    async function downloadPdf(){
      if(!window.jspdf || !window.jspdf.jsPDF){
        alert('Не удалось загрузить библиотеку PDF. Проверь интернет и попробуй снова.');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let first = true;
      for(const p of state.posters){
        const img = new Image();
        img.src = getPosterRenderUrl(p);
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
        const swBase = Math.floor(img.naturalWidth / p.cols);
        const shBase = Math.floor(img.naturalHeight / p.rows);
        for(let r=0;r<p.rows;r++){
          for(let c=0;c<p.cols;c++){
            if(!first) doc.addPage('a4', 'portrait');
            first = false;
            const sx = c * swBase;
            const sy = r * shBase;
            const sw = c === p.cols - 1 ? img.naturalWidth - sx : swBase;
            const sh = r === p.rows - 1 ? img.naturalHeight - sy : shBase;
            const canvas = document.createElement('canvas');
            canvas.width = sw;
            canvas.height = sh;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
            const dataUrl = canvas.toDataURL('image/png');
            const margin = 8;
            const w = 210 - margin * 2;
            const h = 297 - margin * 2;
            doc.addImage(dataUrl, 'PNG', margin, margin, w, h, undefined, 'FAST');
            doc.setFontSize(10);
            doc.text(`${p.sheet} · ${r*p.cols+c+1}/${p.sheets}`, margin, 294);
          }
        }
      }
      doc.save('composition.pdf');
    }

    $('pdfBtn').addEventListener('click', async ()=>{
      if(!state.posters.length){ alert('Добавь хотя бы один постер.'); return; }
      try { await downloadPdf(); } catch(e){ alert('Ошибка при создании PDF. Попробуй еще раз.'); }
    });

    const mascotFrames = ['01.png','02.png','03.png','04.png','05.png','06.png','07.png','08.png'];
    const mascotEl = $('heroMascot');
    if (mascotEl) {
      const frameUrls = mascotFrames.map((f) => `assets/mascot/${f}`);
      // Preload frames so switching is visible and smooth.
      frameUrls.forEach((u) => { const img = new Image(); img.src = u; });
      let mascotIndex = 0;
      setInterval(() => {
        mascotIndex = (mascotIndex + 1) % frameUrls.length;
        mascotEl.src = frameUrls[mascotIndex];
      }, 3200);
      mascotEl.onerror = () => {
        mascotEl.src = frameUrls[0];
      };
    }

    ['wallW','wallH','targetSheets','sheetType'].forEach(id=>$(id).addEventListener('input',render));
    render();
  
