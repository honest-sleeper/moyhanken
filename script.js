/* =========================================================
   も"ゃんけん
   script.js
========================================================= */


/* =========================================================
   音声ファイル設定
========================================================= */

const AUDIO_FILES = {
  bgm: "bgm.mp3",
  roundWin: "win.mp3",
  roundLose: "lose.mp3",
  draw: "draw.mp3",
  finalWin: "final-win.mp3",
  finalLose: "final-lose.mp3"
};


/* =========================================================
   ゲーム設定
========================================================= */

const MAX_ROUNDS = 9;
const MAX_HAND_COUNT = 3;

const MIN_SCORE = -256;
const MAX_SCORE = 512;


/* =========================================================
   ダも"ルアップ設定
========================================================= */

/*
 * ダも"ルアップは最大5回。
 *
 * 1回成功  → ×2
 * 2回成功  → ×4
 * 3回成功  → ×8
 * 4回成功  → ×16
 * 5回成功  → ×32
 */
const MAX_DOUBLE_UP_ROUNDS = 5;


/* =========================================================
   手の設定
========================================================= */

const HANDS = {

  rock: {
    name: "グー",
    image: "guu.png"
  },

  scissors: {
    name: "チョキ",
    image: "chyoki.png"
  },

  paper: {
    name: "パー",
    image: "pa.png"
  }

};


/* =========================================================
   ゲーム状態
========================================================= */

let playerStock = {
  rock: 3,
  scissors: 3,
  paper: 3
};

let cpuStock = {
  rock: 3,
  scissors: 3,
  paper: 3
};

let score = 0;

let multiplier = 1;

let round = 1;

let playerWins = 0;

let cpuWins = 0;

let draws = 0;

let gameOver = false;


/*
 * スマホで高速タップされた際に
 * 同じラウンドが複数回処理されるのを防ぐ。
 */
let isProcessing = false;


/*
 * endGameが複数回呼ばれるのを防ぐ。
 */
let endGameStarted = false;


/* =========================================================
   ダも"ルアップ状態
========================================================= */

let doubleUpActive = false;


/*
 * 現在何回目のチャンスか。
 *
 * 1～5
 */
let doubleUpRound = 0;


/*
 * ダも"ルアップ成功回数
 */
let doubleUpSuccesses = 0;


/*
 * 現在表示されているカード
 */
let currentCardValue = null;


/*
 * ダも"ルアップ中の処理ロック
 */
let doubleUpProcessing = false;


/* =========================================================
   オーディオ
========================================================= */

const bgm =
  new Audio(AUDIO_FILES.bgm);

const roundWinSE =
  new Audio(AUDIO_FILES.roundWin);

const roundLoseSE =
  new Audio(AUDIO_FILES.roundLose);

const drawSE =
  new Audio(AUDIO_FILES.draw);

const finalWinSE =
  new Audio(AUDIO_FILES.finalWin);

const finalLoseSE =
  new Audio(AUDIO_FILES.finalLose);


bgm.loop = true;

bgm.volume = 0.35;

roundWinSE.volume = 0.7;

roundLoseSE.volume = 0.7;

drawSE.volume = 0.7;

finalWinSE.volume = 0.8;

finalLoseSE.volume = 0.8;


/* =========================================================
   オーディオ関数
========================================================= */

function startBGM() {

  bgm.play().catch(() => {

    /*
     * ブラウザの自動再生制限による
     * エラーは無視。
     */

  });

}


function stopBGM() {

  bgm.pause();

  bgm.currentTime = 0;

}


function playSE(audio) {

  audio.currentTime = 0;

  audio.play().catch(() => {

    /*
     * 再生できなくても
     * ゲーム進行は止めない。
     */

  });

}


/* =========================================================
   DOM
========================================================= */

const roundElement =
  document.getElementById("round");

const scoreElement =
  document.getElementById("score");

const multiplierElement =
  document.getElementById("multiplier");

const multiplierCard =
  document.getElementById("multiplierCard");


const playerRockStockElement =
  document.getElementById(
    "playerRockStock"
  );

const playerScissorsStockElement =
  document.getElementById(
    "playerScissorsStock"
  );

const playerPaperStockElement =
  document.getElementById(
    "playerPaperStock"
  );


const cpuRockStockElement =
  document.getElementById(
    "cpuRockStock"
  );

const cpuScissorsStockElement =
  document.getElementById(
    "cpuScissorsStock"
  );

const cpuPaperStockElement =
  document.getElementById(
    "cpuPaperStock"
  );


const playerHandElement =
  document.getElementById(
    "playerHand"
  );

const cpuHandElement =
  document.getElementById(
    "cpuHand"
  );


const resultMessageElement =
  document.getElementById(
    "resultMessage"
  );

const pointsMessageElement =
  document.getElementById(
    "pointsMessage"
  );


const choiceButtons =
  document.querySelectorAll(
    ".choice-button"
  );


/* =========================================================
   ダも"ルアップ DOM
========================================================= */

const doubleUpModal =
  document.getElementById(
    "doubleUpModal"
  );

const doubleUpScoreElement =
  document.getElementById(
    "doubleUpScore"
  );

const doubleUpProgressElement =
  document.getElementById(
    "doubleUpProgress"
  );

const currentCardElement =
  document.getElementById(
    "currentCard"
  );

const currentCardRankTopElement =
  document.getElementById(
    "currentCardRankTop"
  );

const currentCardSuitTopElement =
  document.getElementById(
    "currentCardSuitTop"
  );

const currentCardCenterElement =
  document.getElementById(
    "currentCardCenter"
  );

const currentCardRankBottomElement =
  document.getElementById(
    "currentCardRankBottom"
  );

const currentCardSuitBottomElement =
  document.getElementById(
    "currentCardSuitBottom"
  );

const highButton =
  document.getElementById(
    "highButton"
  );

const lowButton =
  document.getElementById(
    "lowButton"
  );

const highLowMessageElement =
  document.getElementById(
    "highLowMessage"
  );


/* =========================================================
   最終結果 DOM
========================================================= */

const resultModal =
  document.getElementById(
    "resultModal"
  );

const finalResultMessageElement =
  document.getElementById(
    "finalResultMessage"
  );

const finalTitleElement =
  document.getElementById(
    "finalTitle"
  );

const finalScoreElement =
  document.getElementById(
    "finalScore"
  );

const finalWinsElement =
  document.getElementById(
    "finalWins"
  );

const finalLossesElement =
  document.getElementById(
    "finalLosses"
  );

const finalDrawsElement =
  document.getElementById(
    "finalDraws"
  );

const doubleUpResultElement =
  document.getElementById(
    "doubleUpResult"
  );

const restartButton =
  document.getElementById(
    "restartButton"
  );


/* =========================================================
   表示更新
========================================================= */

function updateDisplay() {

  roundElement.textContent =
    round;

  scoreElement.textContent =
    score;

  multiplierElement.textContent =
    `×${multiplier}`;


  playerRockStockElement.textContent =
    playerStock.rock;

  playerScissorsStockElement.textContent =
    playerStock.scissors;

  playerPaperStockElement.textContent =
    playerStock.paper;


  cpuRockStockElement.textContent =
    cpuStock.rock;

  cpuScissorsStockElement.textContent =
    cpuStock.scissors;

  cpuPaperStockElement.textContent =
    cpuStock.paper;


  updateChoiceButtons();

}


/* =========================================================
   選択ボタン状態
========================================================= */

function updateChoiceButtons() {

  choiceButtons.forEach(button => {

    const hand =
      button.dataset.hand;

    button.disabled =
      playerStock[hand] <= 0 ||
      isProcessing ||
      gameOver ||
      doubleUpActive;

  });

}


/* =========================================================
   CPUの手をランダム選択
========================================================= */

function getCpuChoice() {

  const availableHands =
    Object.keys(cpuStock).filter(
      hand => cpuStock[hand] > 0
    );


  if (
    availableHands.length === 0
  ) {
    return null;
  }


  const randomIndex =
    Math.floor(
      Math.random() *
      availableHands.length
    );


  return availableHands[
    randomIndex
  ];

}


/* =========================================================
   じゃんけん判定
========================================================= */

function judge(
  playerChoice,
  cpuChoice
) {

  if (
    playerChoice === cpuChoice
  ) {
    return "draw";
  }


  if (
    (
      playerChoice === "rock" &&
      cpuChoice === "scissors"
    ) ||

    (
      playerChoice === "scissors" &&
      cpuChoice === "paper"
    ) ||

    (
      playerChoice === "paper" &&
      cpuChoice === "rock"
    )
  ) {

    return "win";

  }


  return "lose";

}


/* =========================================================
   手の画像表示
========================================================= */

function showHand(
  element,
  hand
) {

  if (
    !hand ||
    !HANDS[hand]
  ) {

    element.innerHTML =
      `<span class="question-mark">?</span>`;

    return;
  }


  element.innerHTML = `
    <img
      src="${HANDS[hand].image}"
      alt="${HANDS[hand].name}"
    >
  `;

}


/* =========================================================
   結果表示
========================================================= */

function showResult(
  result,
  points
) {

  resultMessageElement.className =
    "result-message";

  pointsMessageElement.textContent =
    "";


  if (
    result === "win"
  ) {

    resultMessageElement.textContent =
      "貴様の勝ち";

    resultMessageElement.classList.add(
      "result-win"
    );

    pointsMessageElement.textContent =
      `+${points} 点`;

  }


  else if (
    result === "lose"
  ) {

    resultMessageElement.textContent =
      "貴様の負け";

    resultMessageElement.classList.add(
      "result-lose"
    );

    pointsMessageElement.textContent =
      `${points} 点`;

  }


  else {

    resultMessageElement.textContent =
      "あいこ";

    resultMessageElement.classList.add(
      "result-draw"
    );

    pointsMessageElement.textContent =
      `倍率が ×${multiplier} に上昇`;

  }

}


/* =========================================================
   称号判定
========================================================= */

/*
 * ここは今回変更していません。
 *
 * 以前と同じ8段階。
 *
 * スコアが
 *  -256以下 → 最低称号
 *  512以上  → 最高称号
 *
 * となる。
 */
function getTitleByScore(
  currentScore
) {

  if (
    currentScore <= -161
  ) {

    return "カニの食べられないところ";

  }


  if (
    currentScore <= -65
  ) {

    return "壊れたブンブンチョッパー";

  }


  if (
    currentScore <= 31
  ) {

    return "インド象を見てるガキ";

  }


  if (
    currentScore <= 127
  ) {

    return "インディーズバンドドラム担当";

  }


  if (
    currentScore <= 223
  ) {

    return "勝ち気で陽気なホームレス";

  }


  if (
    currentScore <= 319
  ) {

    return "BOOKOFFせどりのプロ";

  }


  if (
    currentScore <= 415
  ) {

    return "激エロのモロホスト";

  }


  return "も";

}


/* =========================================================
   じゃんけん1ラウンド
========================================================= */

function playRound(
  playerChoice
) {

  /*
   * 高速タップ対策
   */
  if (
    isProcessing ||
    gameOver ||
    doubleUpActive
  ) {

    return;

  }


  /*
   * 所持数チェック
   */
  if (
    !playerStock[playerChoice] ||
    playerStock[playerChoice] <= 0
  ) {

    return;

  }


  /*
   * 処理開始ロック
   */
  isProcessing = true;


  choiceButtons.forEach(button => {

    button.classList.add(
      "processing"
    );

  });


  /*
   * 最初のユーザー操作でBGM開始
   */
  startBGM();


  /*
   * CPUの手
   */
  const cpuChoice =
    getCpuChoice();


  if (!cpuChoice) {

    isProcessing = false;

    return;

  }


  /*
   * 使用回数を減らす
   */
  playerStock[playerChoice]--;

  cpuStock[cpuChoice]--;


  /*
   * 手を表示
   */
  showHand(
    playerHandElement,
    playerChoice
  );

  showHand(
    cpuHandElement,
    cpuChoice
  );


  /*
   * 勝敗判定
   */
  const result =
    judge(
      playerChoice,
      cpuChoice
    );


  /*
   * 勝利
   */
  if (
    result === "win"
  ) {

    playerWins++;


    const points =
      2 * multiplier;


    score += points;


    playSE(
      roundWinSE
    );


    showResult(
      "win",
      points
    );


    /*
     * 勝利後は倍率リセット
     */
    multiplier = 1;


    multiplierCard.classList.remove(
      "multiplier-active"
    );

    void multiplierCard.offsetWidth;

    multiplierCard.classList.add(
      "multiplier-active"
    );

  }


  /*
   * 敗北
   */
  else if (
    result === "lose"
  ) {

    cpuWins++;


    const points =
      -1 * multiplier;


    score += points;


    playSE(
      roundLoseSE
    );


    showResult(
      "lose",
      points
    );


    /*
     * 敗北後は倍率リセット
     */
    multiplier = 1;


    multiplierCard.classList.remove(
      "multiplier-active"
    );

    void multiplierCard.offsetWidth;

    multiplierCard.classList.add(
      "multiplier-active"
    );

  }


  /*
   * あいこ
   */
  else {

    draws++;


    playSE(
      drawSE
    );


    /*
     * あいこなら倍率2倍
     */
    multiplier *= 2;


    showResult(
      "draw",
      0
    );


    multiplierCard.classList.remove(
      "multiplier-active"
    );

    void multiplierCard.offsetWidth;

    multiplierCard.classList.add(
      "multiplier-active"
    );

  }


  updateDisplay();


  /*
   * 最終ラウンド
   */
  if (
    round >= MAX_ROUNDS
  ) {

    gameOver = true;


    updateChoiceButtons();


    setTimeout(() => {

      isProcessing = false;


      choiceButtons.forEach(button => {

        button.classList.remove(
          "processing"
        );

      });


      /*
       * 今回の変更点。
       *
       * 勝ち数・負け数に関係なく
       * 必ずダも"ルアップへ。
       */
      startDoubleUpChance();


    }, 900);


    return;
  }


  /*
   * 通常ラウンド終了
   */
  setTimeout(() => {

    round++;


    isProcessing = false;


    choiceButtons.forEach(button => {

      button.classList.remove(
        "processing"
      );

    });


    /*
     * 次ラウンドの表示を初期化
     */
    playerHandElement.innerHTML =
      `<span class="question-mark">?</span>`;

    cpuHandElement.innerHTML =
      `<span class="question-mark">?</span>`;


    resultMessageElement.className =
      "result-message";


    resultMessageElement.textContent =
      "おい、選べる";


    pointsMessageElement.textContent =
      "";


    updateDisplay();


  }, 650);

}


/* =========================================================
   ダも"ルアップ開始
========================================================= */

function startDoubleUpChance() {

  /*
   * ダも"ルアップを有効化
   */
  doubleUpActive = true;

  doubleUpProcessing = false;


  /*
   * 1回目からスタート
   */
  doubleUpRound = 1;

  doubleUpSuccesses = 0;


  /*
   * 最初のカード
   */
  currentCardValue =
    drawCardValue();


  /*
   * 表示
   */
  updateDoubleUpScore();

  updateDoubleUpProgress();


  displayCard(
    currentCardValue,
    false
  );


  highLowMessageElement.textContent =
    "運命を選べ。";


  highLowMessageElement.className =
    "high-low-message";


  /*
   * ボタンを有効化
   */
  highButton.disabled = false;

  lowButton.disabled = false;


  /*
   * モーダル表示
   */
  doubleUpModal.classList.add(
    "active"
  );


  /*
   * 背景スクロール停止
   */
  document.body.style.overflow =
    "hidden";


  /*
   * 通常ゲームのボタンを無効化
   */
  updateChoiceButtons();

}


/* =========================================================
   ダも"ルアップ スコア表示
========================================================= */

function updateDoubleUpScore() {

  doubleUpScoreElement.textContent =
    score;

}


/* =========================================================
   ダも"ルアップ進行表示
========================================================= */

function updateDoubleUpProgress() {

  doubleUpProgressElement.textContent =
    `CHANCE ${doubleUpRound} / ${MAX_DOUBLE_UP_ROUNDS}`;

}


/* =========================================================
   トランプを引く
========================================================= */

function drawCardValue() {

  /*
   * 1～13
   *
   * A = 1
   * J = 11
   * Q = 12
   * K = 13
   */
  return Math.floor(
    Math.random() * 13
  ) + 1;

}


/* =========================================================
   カードのランク
========================================================= */

function getCardRank(
  value
) {

  if (
    value === 1
  ) {

    return "A";

  }


  if (
    value === 11
  ) {

    return "J";

  }


  if (
    value === 12
  ) {

    return "Q";

  }


  if (
    value === 13
  ) {

    return "K";

  }


  return String(value);

}


/* =========================================================
   カードのスート
========================================================= */

function getCardSuit() {

  return "♠";

}


/* =========================================================
   カード表示
========================================================= */

function displayCard(
  value,
  animate = true
) {

  if (animate) {

    currentCardElement.classList.remove(
      "card-flip"
    );


    void currentCardElement.offsetWidth;


    currentCardElement.classList.add(
      "card-flip"
    );

  }


  const rank =
    getCardRank(value);


  const suit =
    getCardSuit();


  currentCardRankTopElement.textContent =
    rank;

  currentCardSuitTopElement.textContent =
    suit;


  currentCardCenterElement.textContent =
    suit;


  currentCardRankBottomElement.textContent =
    rank;

  currentCardSuitBottomElement.textContent =
    suit;

}


/* =========================================================
   HIGH / LOW判定
========================================================= */

function judgeHighLow(
  previousValue,
  nextValue,
  prediction
) {

  /*
   * 同じ数字は失敗扱い。
   */
  if (
    previousValue === nextValue
  ) {

    return false;

  }


  /*
   * HIGH
   */
  if (
    prediction === "high" &&
    nextValue > previousValue
  ) {

    return true;

  }


  /*
   * LOW
   */
  if (
    prediction === "low" &&
    nextValue < previousValue
  ) {

    return true;

  }


  return false;

}


/* =========================================================
   ダも"ルアップ挑戦
========================================================= */

function playHighLow(
  prediction
) {

  /*
   * 連打対策
   */
  if (
    !doubleUpActive ||
    doubleUpProcessing ||
    doubleUpRound > MAX_DOUBLE_UP_ROUNDS
  ) {

    return;

  }


  doubleUpProcessing = true;


  /*
   * ボタン一時無効化
   */
  highButton.disabled = true;

  lowButton.disabled = true;


  /*
   * 次のカード
   */
  const nextCardValue =
    drawCardValue();


  /*
   * 判定
   */
  const correct =
    judgeHighLow(
      currentCardValue,
      nextCardValue,
      prediction
    );


  /*
   * 新しいカード表示
   */
  displayCard(
    nextCardValue,
    true
  );


  /* =======================================================
     的中
  ======================================================== */

  if (correct) {

    doubleUpSuccesses++;


    /*
     * 現在の持ち点を2倍
     */
    score *= 2;


    updateDoubleUpScore();


    highLowMessageElement.textContent =
      `的中！！ 持ち点が ${score} 点になった！`;


    highLowMessageElement.className =
      "high-low-message success";


    /*
     * スコア爆発演出
     */
    doubleUpScoreElement.classList.remove(
      "score-doubled"
    );


    void doubleUpScoreElement.offsetWidth;


    doubleUpScoreElement.classList.add(
      "score-doubled"
    );


    /*
     * 5回すべて成功
     */
    if (
      doubleUpSuccesses >=
      MAX_DOUBLE_UP_ROUNDS
    ) {

      doubleUpRound =
        MAX_DOUBLE_UP_ROUNDS;


      updateDoubleUpProgress();


      setTimeout(() => {

        highLowMessageElement.textContent =
          "5連続的中！！ ここで終了だ。";


        setTimeout(() => {

          finishDoubleUp(
            "success"
          );

        }, 900);

      }, 500);


      return;
    }


    /*
     * 次のチャンスへ
     */
    doubleUpRound++;


    currentCardValue =
      nextCardValue;


    setTimeout(() => {

      updateDoubleUpProgress();


      highLowMessageElement.textContent =
        "まだいける。次を選べ。";


      highLowMessageElement.className =
        "high-low-message";


      highButton.disabled = false;

      lowButton.disabled = false;


      doubleUpProcessing = false;

    }, 750);


    return;

  }


  /* =======================================================
     ハズレ
  ======================================================== */

  highLowMessageElement.textContent =
    'ハズレ！！ ダも"ルアップ終了。';


  highLowMessageElement.className =
    "high-low-message failure";


  /*
   * ハズレた時点で終了。
   */
  setTimeout(() => {

    finishDoubleUp(
      "failure"
    );

  }, 1000);

}


/* =========================================================
   ダも"ルアップ終了
========================================================= */

function finishDoubleUp(
  reason
) {

  if (
    !doubleUpActive
  ) {

    return;

  }


  doubleUpActive = false;

  doubleUpProcessing = false;


  highButton.disabled = true;

  lowButton.disabled = true;


  /*
   * 最後の演出
   */
  if (
    reason === "success"
  ) {

    highLowMessageElement.textContent =
      "限界突破。最終結果へ。";

  } else {

    highLowMessageElement.textContent =
      "運命はここまでだ。";

  }


  /*
   * モーダルを閉じる
   */
  setTimeout(() => {

    doubleUpModal.classList.remove(
      "active"
    );


    document.body.style.overflow =
      "";


    /*
     * 最終結果へ
     */
    endGame();


  }, 700);

}


/* =========================================================
   最終結果
========================================================= */

function endGame() {

  /*
   * 二重実行防止
   */
  if (
    endGameStarted
  ) {

    return;

  }


  endGameStarted = true;

  gameOver = true;

  doubleUpActive = false;


  /*
   * BGM停止
   */
  stopBGM();


  /*
   * じゃんけんの勝敗表示
   */
  if (
    playerWins > cpuWins
  ) {

    finalResultMessageElement.textContent =
      "貴様の勝利";


    playSE(
      finalWinSE
    );

  }


  else if (
    playerWins < cpuWins
  ) {

    finalResultMessageElement.textContent =
      "貴様の敗北";


    playSE(
      finalLoseSE
    );

  }


  else {

    finalResultMessageElement.textContent =
      "引き分け";

  }


  /*
   * 最終称号
   *
   * ダも"ルアップで
   * スコアが大幅に増減した場合も
   * その最終スコアで判定する。
   */
  const finalTitle =
    getTitleByScore(score);


  finalTitleElement.textContent =
    finalTitle;


  finalScoreElement.textContent =
    score;


  finalWinsElement.textContent =
    playerWins;

  finalLossesElement.textContent =
    cpuWins;

  finalDrawsElement.textContent =
    draws;


  /*
   * ダも"ルアップ結果
   */
  if (
    doubleUpSuccesses > 0
  ) {

    const doubleMultiplier =
      Math.pow(
        2,
        doubleUpSuccesses
      );


    doubleUpResultElement.textContent =
      `ダも"ルアップ成功 ${doubleUpSuccesses}回！ 持ち点 ×${doubleMultiplier}`;

  }


  else {

    doubleUpResultElement.textContent =
      "";

  }


  /*
   * 結果モーダル
   */
  resultModal.classList.add(
    "active"
  );


  document.body.style.overflow =
    "hidden";


  updateChoiceButtons();

}


/* =========================================================
   ゲーム初期化
========================================================= */

function initializeGame() {

  playerStock = {
    rock: 3,
    scissors: 3,
    paper: 3
  };


  cpuStock = {
    rock: 3,
    scissors: 3,
    paper: 3
  };


  score = 0;

  multiplier = 1;

  round = 1;

  playerWins = 0;

  cpuWins = 0;

  draws = 0;

  gameOver = false;

  isProcessing = false;

  endGameStarted = false;


  /*
   * ダも"ルアップリセット
   */
  doubleUpActive = false;

  doubleUpRound = 0;

  doubleUpSuccesses = 0;

  currentCardValue = null;

  doubleUpProcessing = false;


  /*
   * 通常UI
   */
  resultMessageElement.className =
    "result-message";


  resultMessageElement.textContent =
    "おい、選べる";


  pointsMessageElement.textContent =
    "";


  playerHandElement.innerHTML =
    `<span class="question-mark">?</span>`;


  cpuHandElement.innerHTML =
    `<span class="question-mark">?</span>`;


  /*
   * モーダルを閉じる
   */
  doubleUpModal.classList.remove(
    "active"
  );


  resultModal.classList.remove(
    "active"
  );


  document.body.style.overflow =
    "";


  /*
   * ダも"ルアップUI初期化
   */
  highLowMessageElement.textContent =
    "運命を選べ。";


  highLowMessageElement.className =
    "high-low-message";


  highButton.disabled = true;

  lowButton.disabled = true;


  updateDoubleUpScore();

  updateDoubleUpProgress();


  /*
   * BGM停止
   */
  stopBGM();


  /*
   * 表示更新
   */
  updateDisplay();

}


/* =========================================================
   じゃんけんボタン
========================================================= */

choiceButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const hand =
          button.dataset.hand;


        playRound(hand);

      }
    );

  }
);


/* =========================================================
   HIGHボタン
========================================================= */

highButton.addEventListener(
  "click",
  () => {

    playHighLow(
      "high"
    );

  }
);


/* =========================================================
   LOWボタン
========================================================= */

lowButton.addEventListener(
  "click",
  () => {

    playHighLow(
      "low"
    );

  }
);


/* =========================================================
   リスタート
========================================================= */

restartButton.addEventListener(
  "click",
  () => {

    initializeGame();

  }
);


/* =========================================================
   初期化
========================================================= */

initializeGame();