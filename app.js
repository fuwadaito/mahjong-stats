(() => {
  console.log('app.js loaded');
  // app.js - JAN STA (ルール選択 / 記録 / 集計 / localStorage)
  document.addEventListener('DOMContentLoaded', () => {
    const pages = {
      home: document.getElementById('home'),
      newMatch: document.getElementById('newMatch'),
      match: document.getElementById('match'),
      result: document.getElementById('result'),
      players: document.getElementById('players')
    };

    const btnNew = document.getElementById('btn-new');
    const navHome = document.getElementById('nav-home');
    const navRecords = document.getElementById('nav-records');
    const navPlayers = document.getElementById('nav-players');
    const navSettings = document.getElementById('nav-settings');

    const ruleDate = document.getElementById('rule-date');
    const ruleInit = document.getElementById('rule-init');
    const ruleReturn = document.getElementById('rule-return');
    const umaInputs = [0,1,2,3].map(i => document.getElementById('uma' + i));
    const chipRateInput = document.getElementById('chip-rate');
    const rateSelect = document.getElementById('rate-select');
    const playersChoose = document.getElementById('players-choose');
    const startRecordBtn = document.getElementById('start-record');
    const cancelNew = document.getElementById('cancel-new');

    const addPlayerBtn = document.getElementById('add-player');
    const playerNameInput = document.getElementById('player-name');
    const playersListSimple = document.getElementById('players-list-simple');

    const matchDate = document.getElementById('match-date');
    const matchInit = document.getElementById('match-init');
    const matchReturn = document.getElementById('match-return');
    const matchUma = document.getElementById('match-uma');
    const matchRate = document.getElementById('match-rate');
    const matchChip = document.getElementById('match-chip');
    const scoreRows = document.getElementById('score-rows');
    const nextMatchBtn = document.getElementById('next-match');
    const chipSettleBtn = document.getElementById('chip-settle');
    const showResultBtn = document.getElementById('show-result');
    const endMatchBtn = document.getElementById('end-match');

    const resultRows = document.getElementById('result-rows');
    const resultClose = document.getElementById('result-close');

    const statMatches = document.getElementById('stat-matches');
    const statAvg = document.getElementById('stat-avg');
    const statLast = document.getElementById('stat-last');
    const statTop2 = document.getElementById('stat-top2');
    const statEarn = document.getElementById('stat-earn');
    const playerList = document.getElementById('player-list');

    const PLAYERS_KEY = 'jan_players_v1';
    const RECORDS_KEY = 'jan_records_v1';

    let players = JSON.parse(localStorage.getItem(PLAYERS_KEY) || '[]');
    let records = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]');
    let currentSession = null;

    function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '<',
    '>': '>',
    '"': '&quot;',
    "'": '&#39;'
    }[c]));
    }

    function savePlayers(){ localStorage.setItem(PLAYERS_KEY, JSON.stringify(players)); renderPlayersUI(); }
    function saveRecords(){ localStorage.setItem(RECORDS_KEY, JSON.stringify(records)); renderHome(); }
    function showPage(name){
      Object.values(pages).forEach(p => p && p.classList.add('hidden'));
      if(pages[name]) pages[name].classList.remove('hidden');
      document.querySelectorAll('.header a').forEach(a => a.classList.remove('active'));
      if(name === 'home' && navHome) navHome.classList.add('active');
      if(name === 'players' && navPlayers) navPlayers.classList.add('active');
    }

    function renderPlayersUI(){
      playersListSimple.innerHTML = '';
      players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p;
        playersListSimple.appendChild(li);
      });
      playersChoose.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'player-checkbox';
      players.forEach(p => {
        const label = document.createElement('label');
        label.innerHTML = '<input type="checkbox" value="' + escapeHtml(p) + '"> ' + escapeHtml(p);
        wrapper.appendChild(label);
      });
      playersChoose.appendChild(wrapper);
    }

    function renderHome(){
      statMatches.textContent = records.length;
      const aggPoints = {};
      records.forEach(rec => {
        (rec.players || []).forEach(p => {
          aggPoints[p.name] = (aggPoints[p.name] || 0) + (p.totalPoints || 0);
        });
      });
      playerList.innerHTML = '';
      Object.keys(aggPoints).forEach(name => {
        const li = document.createElement('li');
        li.textContent = name + ' : ' + aggPoints[name].toFixed(2);
        playerList.appendChild(li);
      });
      statAvg.textContent = '—';
      statLast.textContent = '—';
      statTop2.textContent = '—';
      statEarn.textContent = (Object.values(aggPoints).reduce((a,b)=>a+b,0) || 0).toFixed(2);
    }

    startRecordBtn.addEventListener('click', () => {
      const chosen = Array.from(playersChoose.querySelectorAll('input[type=checkbox]:checked')).map(i => i.value);
      if(chosen.length !== 4){ alert('プレイヤーを4名選択してください'); return; }
      currentSession = {
        meta: {
          date: ruleDate.value || new Date().toISOString(),
          init: Number(ruleInit.value || 25000),
          ret: Number(ruleReturn.value || 30000),
          uma: umaInputs.map(i => Number(i.value || 0)),
          chipRate: Number(chipRateInput.value || 100),
          rateFactor: Number(rateSelect.value || 0.1)
        },
        players: chosen.slice(),
        rounds: []
      };
      renderMatchUI();
      showPage('match');
    });

    function renderMatchUI(){
      if(!currentSession) return;
      const m = currentSession.meta;
      matchDate.textContent = new Date(m.date).toLocaleString();
      matchInit.textContent = m.init;
      matchReturn.textContent = m.ret;
      matchUma.textContent = m.uma.join(' / ');
      matchRate.textContent = m.rateFactor;
      matchChip.textContent = m.chipRate;
      scoreRows.innerHTML = '';
      for(let r=0;r<7;r++){
        const tr = document.createElement('tr');
        const nameCols = currentSession.players.map((p,idx) =>
          '<div style="margin-bottom:6px"><label>' + escapeHtml(p) +
          ' <input class="score" data-row="' + r + '" data-col="' + idx + '" type="number" style="width:110px"></label></div>'
        ).join('');
        const chipCols = currentSession.players.map((p,idx) =>
          '<div style="margin-bottom:6px"><input class="chip" data-row="' + r + '" data-col="' + idx + '" type="number" value="0" style="width:72px"></div>'
        ).join('');
        tr.innerHTML =
          '<td>局 ' + (r+1) + '</td><td>' + nameCols + '</td><td>' + chipCols +
          '</td><td class="calc-cell" data-row="' + r + '">-</td><td class="pt-cell" data-row="' + r + '">-</td>';
        scoreRows.appendChild(tr);
      }
      scoreRows.querySelectorAll('.score, .chip').forEach(inp => inp.addEventListener('input', computeLive));
      computeLive();
    }

    function computeLive(){
      if(!currentSession) return;
      const m = currentSession.meta;
      for(let r=0;r<7;r++){
        const scoreInputs = Array.from(document.querySelectorAll('.score[data-row="'+r+'"]')).map(i => Number(i.value || 0));
        const chipInputs = Array.from(document.querySelectorAll('.chip[data-row="'+r+'"]')).map(i => Number(i.value || 0));
        const calcCell = document.querySelector('.calc-cell[data-row="'+r+'"]');
        const ptCell = document.querySelector('.pt-cell[data-row="'+r+'"]');
        if(scoreInputs.every(v => v === 0)){
          if(calcCell) calcCell.textContent = '-';
          if(ptCell) ptCell.textContent = '-';
          continue;
        }
        const s = m.init, t = m.ret;
        const post = scoreInputs.map(a => (s - t + a));
        const points = post.map((val, idx) => val * m.rateFactor + (chipInputs[idx] || 0) * m.chipRate);
        if(calcCell) calcCell.textContent = post.map(v => Math.round(v)).join(' / ');
        if(ptCell) ptCell.textContent = points.map(v => v.toFixed(2)).join(' / ');
      }
    }

    nextMatchBtn.addEventListener('click', () => {
      if(!currentSession) return;
      const m = currentSession.meta;
      const saved = [];
      for(let r=0;r<7;r++){
        const scores = Array.from(document.querySelectorAll('.score[data-row="'+r+'"]')).map(i => Number(i.value || 0));
        const chips = Array.from(document.querySelectorAll('.chip[data-row="'+r+'"]')).map(i => Number(i.value || 0));
        if(scores.some(v => v !== 0) || chips.some(v => v !== 0)){
          const post = scores.map(a => (m.init - m.ret + a));
          const points = post.map((val, idx) => val * m.rateFactor + (chips[idx] || 0) * m.chipRate);
          currentSession.rounds.push({scores, chips, post, points});
          saved.push(r+1);
          Array.from(document.querySelectorAll('.score[data-row="'+r+'"]')).forEach(i => i.value = '');
          Array.from(document.querySelectorAll('.chip[data-row="'+r+'"]')).forEach(i => i.value = '0');
        }
      }
      if(saved.length === 0){ alert('保存する局がありません'); return; }
      alert('局 ' + saved.join(',') + ' を保存しました。');
      computeLive();
    });

    chipSettleBtn.addEventListener('click', () => {
      if(!currentSession) return;
      const finalChips = currentSession.players.map(p => {
        const val = prompt(p + ' の最終チップ差（枚数）を入力してください（例: 3 または -2）', '0');
        return Number(val || 0);
      });
      const sums = currentSession.players.map(() => 0);
      currentSession.rounds.forEach(r => r.points.forEach((pt,i) => sums[i] += pt));
      const finalPoints = sums.map((v,i) => v + (finalChips[i] || 0) * currentSession.meta.chipRate);
      const rec = {
        id: 'rec_' + Date.now(),
        meta: currentSession.meta,
        players: currentSession.players.map((name,i) => ({ name, totalPoints: finalPoints[i], chipFinal: finalChips[i] || 0 })),
        rounds: currentSession.rounds,
        created: new Date().toISOString()
      };
      records.unshift(rec);
      saveRecords();
      alert('対局を保存しました。結果表示に移行します。');
      showResult(rec);
      currentSession = null;
      showPage('home');
    });

    function showResult(rec){
      resultRows.innerHTML = '';
      rec.players.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td>' + escapeHtml(p.name) + '</td><td>-</td><td>' + (p.totalPoints).toFixed(2) + '</td>';
        resultRows.appendChild(tr);
      });
      showPage('result');
    }

    showResultBtn.addEventListener('click', () => {
      if(!currentSession) { alert('現在のセッションがありません'); return; }
      const sums = currentSession.players.map(() => 0);
      currentSession.rounds.forEach(r => r.points.forEach((pt,i) => sums[i] += pt));
      resultRows.innerHTML = '';
      currentSession.players.forEach((name,i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td>' + escapeHtml(name) + '</td><td>-</td><td>' + sums[i].toFixed(2) + '</td>';
        resultRows.appendChild(tr);
      });
      showPage('result');
    });

    resultClose.addEventListener('click', () => showPage('match'));

    endMatchBtn.addEventListener('click', () => {
      if(confirm('対局を終了しますか？ 未保存データは失われます')) { currentSession = null; showPage('home'); }
    });

    addPlayerBtn.addEventListener('click', () => {
      const name = (playerNameInput.value || '').trim();
      if(!name) return alert('名前を入力してください');
      players.push(name);
      playerNameInput.value = '';
      savePlayers();
    });

    navHome?.addEventListener('click', (e) => { e && e.preventDefault(); showPage('home'); renderHome(); });
    navRecords?.addEventListener('click', (e) => { e && e.preventDefault(); alert('対局記録（未実装）'); });
    navPlayers?.addEventListener('click', (e) => { e && e.preventDefault(); showPage('players'); renderPlayersUI(); });
    navSettings?.addEventListener('click', (e) => { e && e.preventDefault(); alert('設定（未実装）'); });
    btnNew?.addEventListener('click', () => { showPage('newMatch'); renderPlayersUI(); });

    cancelNew?.addEventListener('click', () => showPage('home'));

    renderPlayersUI();
    renderHome();
    showPage('home');
  });

  // ヘッダーリンクの確実なバインド（fallback）
  (function(){
    function safeShowPlayers(e){
      e && e.preventDefault();
      const playersPage = document.getElementById('players');
      if(playersPage){
        document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
        playersPage.classList.remove('hidden');
        document.getElementById('nav-players')?.classList.add('active');
      } else {
        console.warn('players page not found');
      }
    }
    const np = document.getElementById('nav-players');
    if(np) np.addEventListener('click', safeShowPlayers);
    else console.warn('nav-players element missing');

    const nh = document.getElementById('nav-home');
    if(nh) nh.addEventListener('click', (e)=>{ e && e.preventDefault(); document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden')); document.getElementById('home')?.classList.remove('hidden'); nh.classList.add('active'); });
  })();

})();