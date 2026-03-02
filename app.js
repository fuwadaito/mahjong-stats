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

        // 1. サマリー部分を生成 (最終スコアとチップ枚数)
        const summaryHtml = (record.players || [])
            .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
            .map(p => {
                const score = (p.finalScore || 0).toFixed(2);
                const scoreClass = p.finalScore > 0 ? 'score-positive' : (p.finalScore < 0 ? 'score-negative' : '');
                const chipCount = p.chipCount || 0;
                return `
                    <div class="summary-player-row">
                        <span class="player-name">${escapeHtml(p.name)}</span>
                        <div class="player-scores">
                            <span class="final-score ${scoreClass}">${score}</span>
                            <span class="chip-count">チップ: ${chipCount}枚</span>
                        </div>
                    </div>
                `;
            })
            .join('');
        recordDetailSummary.innerHTML = summaryHtml;

        // 2. ラウンド毎の結果テーブルを生成
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
        (record.rounds || []).forEach((round, index) => {
            roundsTableHtml += `<tr><td>${index + 1}</td>`;
            (round.points || [0,0,0,0]).forEach(point => {
                const displayPoint = (point / 1000).toFixed(2);
                const className = displayPoint > 0 ? 'positive' : (displayPoint < 0 ? 'negative' : '');
                roundsTableHtml += `<td class="${className}">${displayPoint}</td>`;
            });
            roundsTableHtml += `</tr>`;
        });
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
            created: new Date().toISOString(),
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

    // initial
    renderPlayersUI();
    renderHome();
    showPage('home');
  });
    
  // app.js に以下の関数を追加

   

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