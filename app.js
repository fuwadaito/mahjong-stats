(() => {
  console.log('app.js: newMatch full features loaded');
  document.addEventListener('DOMContentLoaded', () => {
    // --- Element refs ---
    const recordDetailPage = document.getElementById('record-detail-page');
    const recordDetailSummary = document.getElementById('record-detail-summary');
    const recordDetailRounds = document.getElementById('record-detail-rounds');
    const recordDetailCloseBtn = document.getElementById('record-detail-close-btn');
    
    const pages = {
      home: document.getElementById('home'),
      newMatch: document.getElementById('newMatch'),
      match: document.getElementById('match'),
      result: document.getElementById('result'),
      players: document.getElementById('players'),
      intermediateResult: document.getElementById('intermediate-result'),
      chipSettle: document.getElementById('chip-settle-page'),
      recordDetail: recordDetailPage
    };
    let pointInputs = [];
    let chipInputs = [];  
    const btnNew = document.getElementById('btn-new') || document.querySelector('.button-new');
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
    const statEarn = document.getElementById('stat-earn');
    const playerList = document.getElementById('player-list');
    const playerSelectWrap = document.getElementById('player-select-wrap');

    const headerLogo = document.getElementById('header-logo');

    // [新規追加] match page elements
    const matchGameTitle = document.getElementById('match-game-title');
    const summaryUma = document.getElementById('summary-uma');
    const summaryReturn = document.getElementById('summary-return');
    const matchScoreInputs = document.getElementById('match-score-inputs');
    const recordNextGameBtn = document.getElementById('record-next-game');
    const recordEndSessionBtn = document.getElementById('record-end-session');
    // [新規追加] match page elements のブロックの下に追加
    const showIntermediateResultBtn = document.getElementById('show-intermediate-result');
    const intermediateTableContainer = document.getElementById('intermediate-table-container');
    const backToMatchBtn = document.getElementById('back-to-match');

    const chipSettlePage = document.getElementById('chip-settle-page');
    const chipInputsContainer = document.getElementById('chip-inputs-container');
    const confirmChipSettleBtn = document.getElementById('confirm-chip-settle');
    const cancelChipSettleBtn = document.getElementById('cancel-chip-settle');
    

   
    // --- Storage keys ---
    const PLAYERS_KEY = 'jan_players_v1';
    const RECORDS_KEY = 'jan_records_v1';

    // --- State ---
    let players = [];
    try { players = JSON.parse(localStorage.getItem(PLAYERS_KEY) || '[]'); if(!Array.isArray(players)) players = []; } catch(e){ players = []; }
    let records = [];
    try { records = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]'); if(!Array.isArray(records)) records = []; } catch(e){ records = []; }
    let currentSession = null;

    // ▼▼▼ [新規追加] グラフのインスタンスを保持する変数 ▼▼▼
    let cumulativeChartInstance = null;
    // --- Helpers ---
    function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'<','>':'>','"':'&quot;',"'":'&#39;'}[c])); }
    function savePlayers(){ localStorage.setItem(PLAYERS_KEY, JSON.stringify(players)); renderPlayersUI(); renderHome(); }
    function saveRecords(){ localStorage.setItem(RECORDS_KEY, JSON.stringify(records)); renderHome(); }

    function showPage(name){
      Object.values(pages).forEach(p => p && p.classList.add('hidden'));
      if(pages[name]) pages[name].classList.remove('hidden');
      document.querySelectorAll('.header a').forEach(a => a.classList.remove('active'));
      if(name === 'home' && navHome) navHome.classList.add('active');
      if(name === 'players' && navPlayers) navPlayers.classList.add('active');
    }

    // --- Players UI & selection (1) ---
    function renderPlayersUI(){
      // simple list
      if(playersListSimple){
        playersListSimple.innerHTML = '';
        players.forEach((p, idx) => {
          const li = document.createElement('li');
          li.textContent = p;
          li.dataset.index = idx;
          li.addEventListener('contextmenu', e => {
            e.preventDefault();
            if(!confirm(`"${p}" を削除しますか？`)) return;
            players.splice(idx,1); savePlayers();
          });
          playersListSimple.appendChild(li);
        });
      }
      // players choose checkboxes
      if(playersChoose){
        playersChoose.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'player-checkbox';
        players.forEach(p => {
          const label = document.createElement('label');
          label.innerHTML = `<input type="checkbox" value="${escapeHtml(p)}"> ${escapeHtml(p)}`;
          grid.appendChild(label);
        });
        playersChoose.appendChild(grid);
      }
    }

    // --- Home (stats & quick select) ---
    function renderHome(){
      statMatches && (statMatches.textContent = records.length);
      const agg = {};
      records.forEach(rec => (rec.players||[]).forEach(pa => agg[pa.name] = (agg[pa.name]||0) + (pa.totalPoints||0)));
      if(playerList){
        playerList.innerHTML = '';
        Object.keys(agg).forEach(name => {
          const li = document.createElement('li');
          li.textContent = `${name} : ${agg[name].toFixed(2)}`;
          playerList.appendChild(li);
        });
      }
      statEarn && (statEarn.textContent = (Object.values(agg).reduce((a,b)=>a+b,0)||0).toFixed(2));
      if(playerSelectWrap){
        playerSelectWrap.innerHTML = '';
        players.forEach(name => {
          const b = document.createElement('button');
          b.type='button'; b.className='player-btn button'; b.textContent = name;
          b.addEventListener('click', ()=> renderPlayerDashboard(name));
          playerSelectWrap.appendChild(b);
        });
        const addBtn = document.createElement('button');
        addBtn.type='button'; addBtn.className='button ghost'; addBtn.textContent='＋ プレイヤー追加';
        addBtn.addEventListener('click', () => {
          const nm = prompt('プレイヤー名を入力してください'); if(!nm) return; const t = nm.trim(); if(!t) return;
          if(players.includes(t)){ alert('既に存在します'); return; }
          players.push(t); savePlayers();
        });
        playerSelectWrap.appendChild(addBtn);
      }
    }

    function renderPlayerDashboard(name){
      if(!playerList) return;
      playerList.innerHTML = '';
      records.forEach(rec => {
        const p = (rec.players||[]).find(x=>x.name===name);
        if(p){
          const li = document.createElement('li');
          li.textContent = `${rec.created} : ${p.totalPoints.toFixed(2)} (${rec.players.map(q=>q.name).join(',')})`;
          playerList.appendChild(li);
        }
      });
    }

    // [変更] 対局記録ページを表示するように変更
    startRecordBtn && startRecordBtn.addEventListener('click', () => {
    const chosen = Array.from(playersChoose ? playersChoose.querySelectorAll('input[type=checkbox]:checked') : []).map(i => i.value);
    if (chosen.length !== 4) { alert('プレイヤーを4名選択してください'); return; }
    
    const meta = {
        date: (ruleDate && ruleDate.value) || new Date().toISOString().split('T')[0],
        init: Number((ruleInit && ruleInit.value) || 25000),
        ret: Number((ruleReturn && ruleReturn.value) || 30000),
        uma: umaInputs.map(i => Number((i && i.value) || 0)),
        chipRate: Number((chipRateInput && chipRateInput.value) || 100),
        rate: Number(rateSelect.value)
    };
    
    currentSession = { meta, players: chosen.slice(), rounds: [] };
    renderMatchPage(); // 新しい対局記録ページを描画
    showPage('match'); // ページを切り替え
    });

    // app.js に以下の関数とイベントリスナーを追加

    /**
     * 最終チップ入力のUIを表示する
     */
    function showChipSettleUI() {
        chipInputsContainer.innerHTML = ''; // 中身をクリア
        currentSession.players.forEach((player, index) => {
            const div = document.createElement('div');
            div.className = 'chip-input-row';
            div.innerHTML = `
                <label for="chip-player-${index}">${escapeHtml(player)}</label>
                <input type="number" id="chip-player-${index}" value="0" placeholder="チップ枚数">
            `;
            chipInputsContainer.appendChild(div);
        });
        showPage('chipSettle'); // チップ入力ページを表示
    }

    // チップ入力画面の「キャンセル」ボタン
    cancelChipSettleBtn && cancelChipSettleBtn.addEventListener('click', () => {
        showPage('match'); // 対局画面に戻る
    });


        // ...
    // チップ入力画面の「キャンセル」ボタン
    cancelChipSettleBtn && cancelChipSettleBtn.addEventListener('click', () => {
        showPage('match'); // 対局画面に戻る
    });

    // ▲▲▲ ここまでが目印 ▲▲▲

    // ▼▼▼ ここから、以下のコードブロックを丸ごと貼り付け ▼▼▼

    // ===================================================
    // ===== 対局記録ページ関連の処理 (ここから) =====
    // ===================================================

    // --- 1. 要素の参照 ---
    const recordsPage = document.getElementById('records-page');
    const recordsList = document.getElementById('records-list');
    const recordsCloseBtn = document.getElementById('records-close-btn');

    // --- 2. pages オブジェクトへの追加 ---
    // ※ pages の定義がこれより上にあることを確認してください
    if (pages) {
        pages.records = recordsPage;
    }

    /**
 * 記録ページをレンダリング（描画）する
 */
    function renderRecordsPage() {
        if (!recordsList) return;
        recordsList.innerHTML = '';

        if (records.length === 0) {
            recordsList.innerHTML = '<p>まだ対局記録がありません。</p>';
            return;
        }

        records.forEach(rec => {
            // ▼▼▼ ここから修正 ▼▼▼

            const playersHtml = (rec.players || [])
                // ソート処理をより安全に
                .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
                .map(p => {
                    // finalScoreが存在し、かつ数値であるかをチェック
                    const scoreValue = typeof p.finalScore === 'number' ? p.finalScore : 0;
                    const score = scoreValue.toFixed(2); // 安全な値に対して .toFixed を実行

                    const scoreClass = scoreValue > 0 ? 'score-positive' : (scoreValue < 0 ? 'score-negative' : '');
                    return `<li><span>${escapeHtml(p.name)}</span> <span class="${scoreClass}">${score}</span></li>`;
                })
                .join('');

            // ▲▲▲ 修正ここまで ▲▲▲

            const li = document.createElement('li');
            li.className = 'record-item';
            li.innerHTML = `
                <div class="record-header">
                    <span class="record-date">${new Date(rec.created).toLocaleString()}</span>
                </div>
                <ul class="record-players">
                    ${playersHtml}
                </ul>
                <div class="record-actions">
                    <button class="button ghost small detail-record-btn" data-id="${rec.id}">詳細</button>
                    <button class="button danger small delete-record-btn" data-id="${rec.id}">削除</button>
                </div>
            `;
            recordsList.appendChild(li);
        });
    }

        // app.js にこの新しい関数を丸ごと追加

    /**
     * 特定の対局記録の詳細ページを生成・表示する
     * @param {object} record 表示する記録オブジェクト
     */
    function renderRecordDetailPage(record) {
        if (!record || !recordDetailSummary || !recordDetailRounds) return;

        recordDetailSummary.innerHTML = ''; // サマリー表示を完全に削除

        let roundsTableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>対局</th>
                        <th>${escapeHtml(record.players[0].name)}</th>
                        <th>${escapeHtml(record.players[1].name)}</th>
                        <th>${escapeHtml(record.players[2].name)}</th>
                        <th>${escapeHtml(record.players[3].name)}</th>
                    </tr>
                </thead>
                <tbody>
        `;
        // 各ラウンドの行を追加
        (record.rounds || []).forEach((round, index) => {
            roundsTableHtml += `<tr><td>${index + 1}</td>`;
            (round.points || [0,0,0,0]).forEach(point => {
                const displayPoint = (point / 1000).toFixed(2);
                const className = displayPoint > 0 ? 'positive' : (displayPoint < 0 ? 'negative' : '');
                roundsTableHtml += `<td class="${className}">${displayPoint}</td>`;
            });
            roundsTableHtml += `</tr>`;
        });

        // ▼▼▼ [変更点1] チップ枚数に色付け用のクラスを追加 ▼▼▼
        roundsTableHtml += `<tr class="chip-total-row"><td>チップ</td>`;
        record.players.forEach(player => {
            const chipCount = player.chipCount || 0;
            const className = chipCount > 0 ? 'positive' : (chipCount < 0 ? 'negative' : '');
            roundsTableHtml += `<td class="${className}">${chipCount}</td>`;
        });
        roundsTableHtml += `</tr>`;

        // ▼▼▼ [変更点2] 最終ポイントにも同じクラス名ルールを適用 ▼▼▼
        roundsTableHtml += `<tr class="final-score-row"><td>ポイント</td>`;
        record.players.forEach(player => {
            const score = (player.finalScore || 0);
            const scoreText = score.toFixed(2);
            const className = score > 0 ? 'positive' : (score < 0 ? 'negative' : '');
            roundsTableHtml += `<td class="${className}">${scoreText}</td>`;
        });
        roundsTableHtml += `</tr>`;

        roundsTableHtml += `</tbody></table>`;
        recordDetailRounds.innerHTML = roundsTableHtml;
    }

    // --- 4. イベントリスナー ---
    // 記録ページの「閉じる」ボタン
    recordsCloseBtn?.addEventListener('click', () => showPage('home'));

 

    // (app.js のイベントリスナーセクション)

    // 記録リスト内のボタンに対するイベント処理を修正
    recordsList?.addEventListener('click', e => {
        const target = e.target;
        const recordId = target.dataset.id;
        if (!recordId) return;

        // 「削除」ボタンが押された場合
        if (target.classList.contains('delete-record-btn')) {
            if (confirm('この対局記録を本当に削除しますか？この操作は元に戻せません。')) {
                records = records.filter(rec => rec.id !== recordId);
                saveRecords();
                renderRecordsPage();
            }
        } 
        // 「詳細」ボタンが押された場合
        else if (target.classList.contains('detail-record-btn')) {
            const record = records.find(r => r.id === recordId);
            if (record) {
                renderRecordDetailPage(record);
                showPage('recordDetail');
            }
        }
    });

    // ▼▼▼ この新しいイベントリスナーを追加 ▼▼▼
    // 詳細ページの「戻る」ボタン
    recordDetailCloseBtn?.addEventListener('click', () => showPage('records'));


    // ===================================================
    // ===== 対局記録ページ関連の処理 (ここまで) =====
    // ===================================================


    // --- Navigation & init (7) ---
    // ▼▼▼ ここから下がナビゲーションのブロック ▼▼▼
    navHome?.addEventListener('click', e => { e.preventDefault(); showPage('home'); renderHome(); });
    navRecords?.addEventListener('click', e => { 
        e.preventDefault(); 
        renderRecordsPage(); // 記録ページを生成
        showPage('records');   // 記録ページを表示
    });
    // navRecordsの処理は、この下の完成版に差し替えます
    // ...

    // --- Match UI & live compute (2) ---
    function renderMatchUI(){
      if(!currentSession) return;
      const m = currentSession.meta;
      matchDate && (matchDate.textContent = new Date(m.date).toLocaleString());
      matchInit && (matchInit.textContent = m.init);
      matchReturn && (matchReturn.textContent = m.ret);
      matchUma && (matchUma.textContent = m.uma.join(' / '));
      matchRate && (matchRate.textContent = m.rateFactor);
      matchChip && (matchChip.textContent = m.chipRate);

      // build score row form for next round
      if(scoreRows){
        scoreRows.innerHTML = '';
        const tr = document.createElement('tr');
        const nameCols = currentSession.players.map((p,idx)=>
          `<div style="margin-bottom:6px"><label>${escapeHtml(p)} <input class="score" data-col="${idx}" type="number" style="width:140px" placeholder="${m.init}"></label></div>`
        ).join('');
        tr.innerHTML = `<td>局 ${currentSession.rounds.length + 1}</td><td>${nameCols}</td><td class="calc-cell">-</td><td class="pt-cell">-</td>`;
        scoreRows.appendChild(tr);
        scoreRows.querySelectorAll('.score').forEach(inp => inp.addEventListener('input', computeLive));
        computeLive();
      }
    }

    function computeLive(){
      if(!currentSession) return;
      const m = currentSession.meta;
      if(!scoreRows) return;
      const scores = Array.from(document.querySelectorAll('.score[data-col]')).map(i => Number(i.value || 0));
      const calcCell = document.querySelector('.calc-cell');
      const ptCell = document.querySelector('.pt-cell');
      if(scores.length === 0 || scores.every(v=>v===0)){
        if(calcCell) calcCell.textContent = '-'; if(ptCell) ptCell.textContent = '-'; return;
      }
      const umaPoints = (m.uma||[]).map(u => Number(u)*1000);
      const ret = Number(m.ret);
      const diffs = scores.map(s => s - ret);
      const idxs = diffs.map((v,i)=>i).sort((a,b)=>{
        if(diffs[b] === diffs[a]) return a - b;
        return diffs[b] - diffs[a];
      });
      const ptsRaw = Array(currentSession.players.length).fill(0);
      for(let rank=1; rank<currentSession.players.length; rank++){
        const playerIndex = idxs[rank];
        const u = umaPoints[rank] || 0;
        ptsRaw[playerIndex] = diffs[playerIndex] + u;
      }
      const sumOthers = ptsRaw.reduce((a,b)=>a+b,0);
      ptsRaw[idxs[0]] = -sumOthers;
      if(calcCell) calcCell.textContent = diffs.map(v=>Math.round(v)).join(' / ');
      if(ptCell) ptCell.textContent = ptsRaw.map(v => (v/1000).toFixed(2)).join(' / ');
    }

    // --- Save round & next (3) ---
    nextMatchBtn && nextMatchBtn.addEventListener('click', () => {
      if(!currentSession) return;
      const scores = Array.from(document.querySelectorAll('.score[data-col]')).map(i => Number(i.value || 0));
      if(scores.every(v => v === 0)){ alert('保存する対局の入力がありません'); return; }
      const m = currentSession.meta;
      const umaPoints = (m.uma||[]).map(u => Number(u)*1000);
      const ret = Number(m.ret);
      const diffs = scores.map(s => s - ret);
      const idxs = diffs.map((v,i)=>i).sort((a,b)=>{
        if(diffs[b] === diffs[a]) return a - b;
        return diffs[b] - diffs[a];
      });
      const ptsRaw = Array(currentSession.players.length).fill(0);
      for(let rank=1; rank<currentSession.players.length; rank++){
        const playerIndex = idxs[rank];
        const u = umaPoints[rank] || 0;
        ptsRaw[playerIndex] = diffs[playerIndex] + u;
      }
      const sumOthers = ptsRaw.reduce((a,b)=>a+b,0);
      ptsRaw[idxs[0]] = -sumOthers;
      currentSession.rounds.push({ scores, post: diffs, points: ptsRaw });
      renderMatchUI();
      alert('この対局を保存しました。次の対局を入力してください（終了する場合は「チップ精算をして対戦終了」を押してください）');
    });

    

    // --- Result show (5) ---
    function showResult(rec){
      if(resultRows) resultRows.innerHTML = '';
      (rec.players||[]).forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(p.name)}</td><td>-</td><td>${(p.totalPoints).toFixed(2)}</td>`;
        resultRows.appendChild(tr);
      });
      showPage('result');
    }
    showResultBtn && showResultBtn.addEventListener('click', () => {
      if(!currentSession){ alert('現在のセッションがありません'); return; }
      const sums = currentSession.players.map(()=>0);
      currentSession.rounds.forEach(r => r.points.forEach((pt,i)=>sums[i]+=pt));
      if(resultRows) resultRows.innerHTML = '';
      currentSession.players.forEach((name,i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(name)}</td><td>-</td><td>${(sums[i]/1000).toFixed(2)}</td>`;
        resultRows.appendChild(tr);
      });
      showPage('result');
    });
    resultClose && resultClose.addEventListener('click', ()=> showPage('match'));

    endMatchBtn && endMatchBtn.addEventListener('click', () => {
      if(confirm('対局を中止しますか？ 未保存データは失われます')){ currentSession = null; showPage('home'); }
    });

    // --- [新規追加] 対局記録ページのUI生成と制御 ---
    function renderMatchPage() {
        if (!currentSession) return;
        const m = currentSession.meta;

        // ヘッダーのサマリー情報を更新
        matchGameTitle.textContent = `対局 ${currentSession.rounds.length + 1}`;
        summaryUma.textContent = m.uma.join(' / ');
        summaryReturn.textContent = m.ret;

        // プレイヤーごとの点数入力欄を生成
        matchScoreInputs.innerHTML = '';
        currentSession.players.forEach((player, index) => {
            const div = document.createElement('div');
            div.className = 'player-score-input';
            // ▼▼▼ この input タグに class="point-input" を追加しました ▼▼▼
            div.innerHTML = `
                <label for="score-player-${index}">${escapeHtml(player)}</label>
                <input type="number" class="point-input" id="score-player-${index}" data-player-index="${index}" placeholder="点数">
            `;
            matchScoreInputs.appendChild(div);
        });

        // 新しく生成した入力要素をグローバル変数にセットする
        pointInputs = Array.from(document.querySelectorAll('.point-input'));
        chipInputs = []; // このUIではチップ入力がないため、空にしておく

        // 最初の入力欄にフォーカス
        if (pointInputs.length > 0) {
            pointInputs[0].focus();
        }
    }

       

        /**
     * 現在入力されているスコアを処理し、ラウンドデータとして保存する
     * @returns {boolean} 成功した場合はtrue, 失敗した場合はfalse
     */
    function processAndSaveCurrentRound() {
        // 1. 点数を取得
        const points = pointInputs.map(i => Number(i.value || 0));

        // 2. 点数が一つも入力されていなければ処理を中断
        if (points.length < 4 || points.every(p => p === 0)) {
            return false;
        }

        // 3. 合計点をチェック
        const pointsSum = points.reduce((sum, current) => sum + current, 0);
        const expectedTotal = currentSession.meta.init * 4;

        if (pointsSum !== expectedTotal) {
            alert('点数が正しく入力されてません');
            return false;
        }

        // ▼▼▼ ここから、移植忘れていた計算ロジックを追加 ▼▼▼

        // 4. 計算に必要な設定値を取得
        const m = currentSession.meta;
        const umaPoints = (m.uma || []).map(u => Number(u) * 1000);
        const ret = Number(m.ret);

        // 5. 返し点からの差分を計算
        const diffs = points.map(s => s - ret);

        // 6. 点数に基づいて順位を決定 (点数が同じ場合はプレイヤーの順番)
        const idxs = diffs.map((v, i) => i).sort((a, b) => {
            if (diffs[b] === diffs[a]) return a - b;
            return diffs[b] - diffs[a];
        });

        // 7. ウマを加算して最終的なポイントを計算
        const ptsRaw = Array(currentSession.players.length).fill(0);
        // 2位から4位までのポイントを計算
        for (let rank = 1; rank < currentSession.players.length; rank++) {
            const playerIndex = idxs[rank];
            const u = umaPoints[rank] || 0;
            ptsRaw[playerIndex] = diffs[playerIndex] + u;
        }
        // 1位は、他のプレイヤーの合計ポイントの逆数をとる (合計が0になるように)
        const sumOthers = ptsRaw.reduce((a, b) => a + b, 0);
        ptsRaw[idxs[0]] = -sumOthers;

        // ▲▲▲ 計算ロジックここまで ▲▲▲

        // 8. チップを取得
        const chips = chipInputs.map(i => Number(i.value || 0));

        // 9. 計算後のデータでラウンドデータを作成して保存
        const round = {
            scores: points,  // 入力された素点
            points: ptsRaw,  // ウマ・返し点を計算した後のポイント
            chips: chips
        };
        currentSession.rounds.push(round);

        // 10. 成功したことを伝える
        return true;
    }
    

    // 「次の対局へ」ボタンの処理
    recordNextGameBtn && recordNextGameBtn.addEventListener('click', () => {
        if (processAndSaveCurrentRound()) {
            renderMatchPage(); // UIを次のラウンド用にリセット
        }
    });

    // app.js の古い recordEndSessionBtn と、新しく confirmChipSettleBtn の処理を以下に置き換える

    // 「チップ精算をして終了」ボタンの処理
    recordEndSessionBtn && recordEndSessionBtn.addEventListener('click', () => {
        // 点数入力欄に値が入力されているかを確認
        const scoresAreEntered = pointInputs.some(input => input.value.trim() !== '');

        // もし点数が入力されている場合は、まずそのラウンドを保存しようと試みる
        if (scoresAreEntered) {
            if (!processAndSaveCurrentRound()) {
                // 点数合計が違うなどで保存に失敗した場合
                alert('最後に入力した点数が正しくありません。修正するか、点数をすべて空にしてから終了してください。');
                return;
            }
        }

        // 最終確認は残しても良いが、UIにキャンセルがあるので必須ではない
        if (!confirm('チップ精算画面に進みますか？')) {
            // もし直前のラウンドを保存してしまっていたら、それを取り消す
            if (scoresAreEntered) {
                currentSession.rounds.pop();
            }
            return;
        }
        
        // チップ入力UIを表示する
        showChipSettleUI();
    });


    // （新）「精算を確定」ボタンの処理
    confirmChipSettleBtn && confirmChipSettleBtn.addEventListener('click', () => {
        // 1. UIからチップ枚数を取得
        const finalChips = Array.from(chipInputsContainer.querySelectorAll('input')).map(input => Number(input.value || 0));

        // 2. 全ラウンドのポイントを合計
        const totalPoints = new Array(4).fill(0);
        currentSession.rounds.forEach(round => {
            if (round.points) {
                round.points.forEach((point, index) => {
                    totalPoints[index] += point;
                });
            }
        });

            // 3. レートとチップを考慮して最終スコアを計算
        const finalScores = totalPoints.map((point, index) => {
            // ラウンドポイントにレートを掛ける
            const roundScore = point * currentSession.meta.rate;

            // チップ枚数にチップレートを掛ける
            const chipScore = (finalChips[index] || 0) * currentSession.meta.chipRate;

            // 2つを合算したものが最終スコアとなる
            return roundScore + chipScore;
        });

        // 4. 最終的な記録オブジェクトを作成
        const finalRecord = {
            id: 'rec_' + Date.now(),
            created: currentSession.meta.date,
            meta: currentSession.meta,
            players: currentSession.players.map((name, i) => ({
                name,
                finalScore: finalScores[i],
                chipCount: finalChips[i] || 0
            })),
            rounds: currentSession.rounds
        };

        // 5. 保存してホームに戻る
        records.unshift(finalRecord);
        saveRecords();
        
        alert('対局記録をすべて保存しました。');
        currentSession = null;
        showPage('home');
    });

   

    // [新規追加] 「途中結果」ボタンの処理
    showIntermediateResultBtn && showIntermediateResultBtn.addEventListener('click', () => {
        if (!currentSession || currentSession.rounds.length === 0) {
            alert('まだ記録された対局がありません。');
            return;
        }

        const totalPoints = new Array(4).fill(0);
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>対局</th>
                        <th>${escapeHtml(currentSession.players[0])}</th>
                        <th>${escapeHtml(currentSession.players[1])}</th>
                        <th>${escapeHtml(currentSession.players[2])}</th>
                        <th>${escapeHtml(currentSession.players[3])}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // 各ラウンドの行を生成
        currentSession.rounds.forEach((round, index) => {
            tableHTML += `<tr><td>${index + 1}</td>`;
            round.points.forEach((point, pIndex) => {
                const displayPoint = (point / 1000).toFixed(1);
                const className = displayPoint > 0 ? 'positive' : (displayPoint < 0 ? 'negative' : '');
                tableHTML += `<td class="${className}">${displayPoint}</td>`;
                totalPoints[pIndex] += point; // 合計に加算
            });
            tableHTML += `</tr>`;
        });

        // 合計行を生成
        tableHTML += `<tr class="total-row"><td>合計</td>`;
        totalPoints.forEach(point => {
            const displayPoint = (point / 1000).toFixed(1);
            const className = displayPoint > 0 ? 'positive' : (displayPoint < 0 ? 'negative' : '');
            tableHTML += `<td class="${className}">${displayPoint}</td>`;
        });
        tableHTML += `</tr>`;

        tableHTML += `</tbody></table>`;
        intermediateTableContainer.innerHTML = tableHTML;
        showPage('intermediateResult');
    });

    // [新規追加] 「戻る」ボタンの処理
    backToMatchBtn && backToMatchBtn.addEventListener('click', () => {
        showPage('match');
    });



    // --- Player add & validation (6) ---
    addPlayerBtn && addPlayerBtn.addEventListener('click', () => {
      const name = (playerNameInput && playerNameInput.value || '').trim();
      if(!name) return alert('名前を入力してください');
      if(players.includes(name)) return alert('既に存在します');
      players.push(name);
      if(playerNameInput) playerNameInput.value = '';
      savePlayers();
    });

    // --- Navigation & init (7) ---
    navHome?.addEventListener('click', e => { e && e.preventDefault(); showPage('home'); renderHome(); });
    
    
    navPlayers?.addEventListener('click', e => { e && e.preventDefault(); showPage('players'); renderPlayersUI(); });
    
    

    

    
    
    navSettings?.addEventListener('click', e => { e && e.preventDefault(); alert('設定（未実装）'); });
    btnNew?.addEventListener('click', ()=> { showPage('newMatch'); renderPlayersUI(); });
    cancelNew?.addEventListener('click', ()=> showPage('home'));
    if(headerLogo) headerLogo.addEventListener('click', e=>{ e && e.preventDefault(); showPage('home'); renderHome(); });



    // ▼▼▼ [新規追加] ここからグラフ関連の関数 ▼▼▼

    /**
     * 指定されたプレイヤーの累計収支データを計算して返す
     * @param {string} playerName - 収支を計算するプレイヤー名
     * @returns {{labels: string[], number[]}} - チャート用のラベルとデータのオブジェクト
     */
    function calculateCumulativeData(playerName) {
      // 日付の昇順でソート
      const sortedRecords = [...records].sort((a, b) => new Date(a.created) - new Date(b.created));

      const labels = [];
      const data = [];
      let cumulativeTotal = 0;

      for (const record of sortedRecords) {
        const playerInRecord = record.players.find(p => p.name === playerName);
        if (playerInRecord) {
          cumulativeTotal += playerInRecord.finalScore;
          labels.push(new Date(record.created).toLocaleDateString());
          data.push(cumulativeTotal);
        }
      }
      return { labels, data };
    }

    /**
     * 累計収支推移グラフを描画または更新する
     * @param {string} playerName - グラフを描画するプレイヤー名
     */
    function renderCumulativeBalanceChart(playerName) {
      const ctx = document.getElementById('cumulativeBalanceChart');
      if (!ctx) return;
      
      const { labels, data } = calculateCumulativeData(playerName);

      const chartData = {
        labels: labels,
        datasets: [{
          label: `${playerName} の累計収支`,
          data,
          borderColor: 'var(--accent)',
          backgroundColor: 'rgba(47, 166, 74, 0.15)',
          fill: true,
          tension: 0.2,
          pointBackgroundColor: 'var(--accent)',
        }]
      };

      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                return `${context.dataset.label}: ${value >= 0 ? '+' : ''}${value.toFixed(0)}`;
              }
            }
          }
        }
      };

      if (cumulativeChartInstance) {
        cumulativeChartInstance.data = chartData;
        cumulativeChartInstance.options = chartOptions;
        cumulativeChartInstance.update();
      } else {
        cumulativeChartInstance = new Chart(ctx, {
          type: 'line',
          chartData,
          options: chartOptions
        });
      }
    }


    // ===================================================
    // ===== ダッシュボード機能 (プルダウンメニュー版) =====
    // ===================================================
    function initializeDashboard() {
        const container = document.getElementById('player-selector-container');
        if (!container) return;

    
        const playerNames = players; // グローバルスコープのplayers配列を参照

        function updateDashboard(playerName) {
            if (!playerName) return;
            const totalGamesEl = document.getElementById('total-games');
            const avgRankEl = document.getElementById('avg-rank');
            const lastRateEl = document.getElementById('last-rate');
            const totalBalanceEl = document.getElementById('total-balance');

            const playerRecords = (records || []).filter(rec => rec.players && rec.players.some(p => p.name === playerName));
            const totalGames = getPlayerTotalMatches(records, playerName);
            totalGamesEl && (totalGamesEl.textContent = totalGames);

            if (totalGames === 0) {
                avgRankEl && (avgRankEl.textContent = 'N/A');
                lastRateEl && (lastRateEl.textContent = 'N/A');
                totalBalanceEl && (totalBalanceEl.textContent = '0');
                return;
            }

            let totalMatches = 0;    // ← 変数名を変更
            let totalRankSum = 0;
            let lastPlaceCount = 0;
            let totalBalance = 0;

            playerRecords.forEach(rec => {
                if (!rec.players || rec.players.length !== 4) return; // プレイヤーデータがなければスキップ

                const myPlayer = rec.players.find(p => p.name === playerName);
                if (!myPlayer) return; // プレイヤーがその対局にいなければスキップ

                // --- ここからが新しい計算ロジック ---
                totalMatches += 1; // 1レコードを1対局としてカウント

                // 最終スコアでプレイヤーを降順にソートして順位を決定
                const sortedPlayers = [...rec.players].sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
                
                // 自分の順位を見つける
                const myRank = sortedPlayers.findIndex(p => p.name === playerName) + 1;

                if (myRank > 0) {
                    totalRankSum += myRank;
                    if (myRank === 4) {
                        lastPlaceCount += 1;
                    }
                }
                
                // 総合収支を計算
                totalBalance += (myPlayer.finalScore || 0);
            });

            const avgRank = totalMatches > 0 ? (totalRankSum / totalMatches) : NaN;
            avgRankEl && (avgRankEl.textContent = isNaN(avgRank) ? 'N/A' : avgRank.toFixed(1));
            
            const lastAvoidRate = totalMatches > 0 ? (1 - (lastPlaceCount / totalMatches)) * 100 : 0;
            lastRateEl && (lastRateEl.textContent = `${lastAvoidRate.toFixed(1)}%`);
            if (totalBalanceEl) {
                totalBalanceEl.textContent = `${totalBalance >= 0 ? '+' : ''}${totalBalance.toFixed(0)}`;
                totalBalanceEl.className = 'stat-number';
                totalBalanceEl.classList.toggle('is-positive', totalBalance > 0);
                totalBalanceEl.classList.toggle('is-negative', totalBalance < 0);
            }
            renderCumulativeBalanceChart(playerName);
            }
        // --- プルダウンメニューのHTML構造を生成 ---
        container.innerHTML = ''; // まずは中身を空にする

        if (playerNames.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888;">プレイヤーを登録すると成績が表示されます。</p>';
            return;
        }

        // メニュー全体のラッパー
        const selectorDiv = document.createElement('div');
        selectorDiv.className = 'player-selector';

        // 常に表示される部分 (現在選択中のプレイヤー)
        const currentDiv = document.createElement('div');
        currentDiv.className = 'player-selector-current';
        currentDiv.textContent = playerNames[0]; // 初期値は最初のプレイヤー
        
        // プレイヤーリスト
        const listDiv = document.createElement('div');
        listDiv.className = 'player-selector-list';

        playerNames.forEach(name => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'player-selector-item';
            itemDiv.textContent = name;
            itemDiv.dataset.player = name;
            listDiv.appendChild(itemDiv);
        });

        selectorDiv.appendChild(currentDiv);
        selectorDiv.appendChild(listDiv);
        container.appendChild(selectorDiv);

        // --- イベントリスナーを設定 ---

        // 1. 現在のプレイヤー名部分をクリックしたら、リストを開閉する
        currentDiv.addEventListener('click', () => {
            listDiv.classList.toggle('open');
        });

        // 2. リスト内のプレイヤー名をクリックしたら
        listDiv.addEventListener('click', (event) => {
            if (event.target.classList.contains('player-selector-item')) {
                const selectedPlayer = event.target.dataset.player;
                currentDiv.textContent = selectedPlayer; // 表示を更新
                updateDashboard(selectedPlayer);         // ダッシュボードを更新
                listDiv.classList.remove('open');        // リストを閉じる
            }
        });
        
        // 3. メニューの外側をクリックしたら、リストを閉じる (おまけ機能)
        document.addEventListener('click', (event) => {
            if (!selectorDiv.contains(event.target)) {
                listDiv.classList.remove('open');
            }
        });

        // --- 初期表示 ---
        updateDashboard(playerNames[0]);
    }

    // records: 保存されている記録配列（グローバル変数 `records` を使う）
    function getPlayerTotalMatches(recordsArr, playerName) {
    let total = 0;
    (recordsArr || []).forEach(rec => {
        const participated = (rec.players || []).some(p => p && p.name === playerName);
        if (!participated) return;
        if (Array.isArray(rec.rounds)) { total += rec.rounds.length; return; }
        if (rec.meta && Number.isFinite(rec.meta.rounds)) { total += Number(rec.meta.rounds) || 0; return; }
        total += 1;
    });
    return total;
    }



    // initial
    renderPlayersUI();
    renderHome();
    initializeDashboard();
    showPage('home');
  });

   

        // 1) ボタン取得のフォールバックを追加してイベントを確実にバインド
    const btnNew = document.getElementById('btn-new') || document.querySelector('.button-new');
    if(btnNew){
    btnNew.addEventListener('click', ()=> {
        console.log('新規対局ボタン検出（暫定）');
        // もし newMatch セクションが存在しなければ簡易モーダルを作る（テスト用）
        if(!document.getElementById('newMatch')){
        const s = document.createElement('section');
        s.id = 'newMatch';
        s.className = 'page';
        s.innerHTML = `
            <div class="panel">
            <h3>新規対局（暫定モード）</h3>
            <div id="players-choose"></div>
            <button id="start-record">開始</button>
            <button id="cancel-new">キャンセル</button>
            </div>
        `;
        document.querySelector('main')?.appendChild(s);
        window.pages = window.pages || {};
        window.pages.newMatch = s;
        }
        // プレイヤー一覧生成（既存 players 配列を利用できるなら）
        const players = JSON.parse(localStorage.getItem('jan_players_v1')||'[]');
        const wrap = document.getElementById('players-choose');
        if(wrap){
        wrap.innerHTML = '';
        const grid = document.createElement('div'); grid.className='player-checkbox';
        players.forEach(p=>{
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${p}"> ${p}`;
            grid.appendChild(label);
        });
        wrap.appendChild(grid);
        }
    });
    }

   


})();