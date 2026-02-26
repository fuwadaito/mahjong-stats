// app-newmatch.js — app.js の末尾で読み込むか index.html に script タグで追加してください
(function(){
  function toNum(v){ return Number((v||'').toString().trim()) || 0; }

  // fetch and insert newMatch.html once
  function loadNewMatchTemplate(cb){
    if(document.getElementById('newMatch')){ cb && cb(); return; }
    fetch('./newMatch.html').then(r => {
      if(!r.ok) throw new Error('template fetch failed');
      return r.text();
    }).then(html => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const sec = tmp.querySelector('#newMatch');
      if(sec){
        document.querySelector('main').appendChild(sec);
        cb && cb();
      } else {
        throw new Error('newMatch element not found in template');
      }
    }).catch(e => console.error(e));
  }

  function populatePlayersChoose(){
    const players = window.players && Array.isArray(window.players) && window.players.length
      ? window.players
      : JSON.parse(localStorage.getItem('jan_players_v1')||'[]');
    const wrap = document.getElementById('players-choose');
    if(!wrap) return;
    wrap.innerHTML = '';
    const grid = document.createElement('div'); grid.className='player-checkbox';
    players.forEach(p=>{
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" value="${p}"> ${p}`;
      grid.appendChild(label);
    });
    wrap.appendChild(grid);
  }

  function bindNewMatchEvents(){
    const startBtn = document.getElementById('start-record');
    const cancelBtn = document.getElementById('cancel-new');
    startBtn && startBtn.addEventListener('click', ()=> {
      const chosen = Array.from(document.querySelectorAll('#players-choose input[type=checkbox]:checked')).map(i=>i.value);
      if(chosen.length !== 4){ alert('プレイヤーを4名選択してください'); return; }
      const meta = {
        date: new Date().toISOString(),
        init: toNum(document.getElementById('rule-init')?.value),
        ret: toNum(document.getElementById('rule-return')?.value),
        uma: [0,1,2,3].map(i=> toNum(document.getElementById('uma'+i)?.value )),
        chipRate: toNum(document.getElementById('chip-rate')?.value),
        rateFactor: Number((document.getElementById('rate-select')?.value) || 0.1)
      };
      if(typeof window.startRecordHandler === 'function'){
        window.startRecordHandler({ meta, players: chosen });
        return;
      }
      localStorage.setItem('jan_temp_session', JSON.stringify({ meta, players: chosen, created: new Date().toISOString() }));
      if(typeof showPage === 'function') showPage('match');
    });
    cancelBtn && cancelBtn.addEventListener('click', ()=> {
      if(typeof showPage === 'function') showPage('home'); else {
        const sec = document.getElementById('newMatch'); sec && sec.remove();
      }
    });
  }

  // public initializer: call when you want to show newMatch
  window.openNewMatchPanel = function(){
    loadNewMatchTemplate(() => {
      const sec = document.getElementById('newMatch');
      if(!sec) return;
      populatePlayersChoose();
      bindNewMatchEvents();
      // show panel
      if(typeof showPage === 'function'){
        showPage('newMatch');
      } else {
        sec.style.display = ''; // unhide if direct insert
      }
    });
  };

  // wire existing button
  document.addEventListener('DOMContentLoaded', ()=> {
    const btn = document.getElementById('btn-new') || document.querySelector('.button-new');
    if(btn) btn.addEventListener('click', ()=> { window.openNewMatchPanel(); if(typeof renderPlayersUI==='function') renderPlayersUI(); });
  });
})();