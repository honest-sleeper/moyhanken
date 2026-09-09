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
 * ダも"ルアップの何回目か
 *
 * 0 = まだ開始前
 * 1 = 1回目
 * 2 = 2回目
 * 3 = 3回目
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

const bgm = new Audio(AUDIO_FILES.bgm);

const roundWinSE = new Audio(AUDIO_FILES.roundWin);
const roundLoseSE = new Audio(AUDIO_FILES.roundLose);
const drawSE = new Audio(AUDIO_FILES.draw);

const finalWinSE = new Audio(AUDIO_FILES.finalWin);
const finalLoseSE = new Audio(AUDIO_FILES.finalLose);

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
     * ブラウザの自動再生制限によるエラーは無視。
     * プレイヤーのボタン操作後なら再生できる。
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
     * 再生できない場合はゲーム進行を止めない。
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
  document.getElementById("playerRockStock");

const playerScissorsStockElement =
  document.getElementById("playerScissorsStock");

const playerPaperStockElement =
  document.getElementById("playerPaperStock");


const cpuRockStockElement =
  document.getElementById("cpuRockStock");

const cpuScissorsStockElement =
  document.getElementById("cpuScissorsStock");

const cpuPaperStockElement =
  document.getElementById("cpuPaperStock");


const playerHandElement =
  document.getElementById("playerHand");

const cpuHandElement =
  document.getElementById("cpuHand");


const resultMessageElement =
  document.getElementById("resultMessage");

const pointsMessageElement =
  document.getElementById("pointsMessage");


const choiceButtons =
  document.querySelectorAll(".choice-button");


/* =========================================================
   ダも"ルアップ DOM
========================================================= */

const doubleUpModal =
  document.getElementById("doubleUpModal");

const doubleUpScoreElement =
  document.getElementById("doubleUpScore");

const doubleUpProgressElement =
  document.getElementById("doubleUpProgress");

const currentCardElement =
  document.getElementById("currentCard");

const currentCardRankTopElement =
  document.getElementById("currentCardRankTop");

const currentCardSuitTopElement =
  document.getElementById("currentCardSuitTop");

const currentCardCenterElement =
  document.getElementById("currentCardCenter");

const currentCardRankBottomElement =
  document.getElementById("currentCardRankBottom");

const currentCardSuitBottomElement =
  document.getElementById("currentCardSuitBottom");

const highButton =
  document.getElementById("highButton");

const lowButton =
  document.getElementById("lowButton");

const highLowMessageElement =
  document.getElementById("highLowMessage");


/* =========================================================
   最終結果 DOM
========================================================= */

const resultModal =
  document.getElementById("resultModal");

const finalResultMessageElement =
  document.getElementById("finalResultMessage");

const finalTitleElement =
  document.getElementById("finalTitle");

const finalScoreElement =
  document.getElementById("finalScore");

const finalWinsElement =
  document.getElementById("finalWins");

const finalLossesElement =
  document.getElementById("finalLosses");

const finalDrawsElement =
  document.getElementById("finalDraws");

const doubleUpResultElement =
  document.getElementById("doubleUpResult");

const restartButton =
  document.getElementById("restartButton");


/* =========================================================
   表示更新
========================================================= */

function updateDisplay() {

  roundElement.textContent = round;

  scoreElement.textContent = score;

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
   選択ボタンの使用可能状態
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

  if (availableHands.length === 0) {
    return null;
  }

  const randomIndex =
    Math.floor(
      Math.random() * availableHands.length
    );

  return availableHands[randomIndex];
}


/* =========================================================
   じゃんけん判定
========================================================= */

function judge(playerChoice, cpuChoice) {

  if (playerChoice === cpuChoice) {
    return "draw";
  }


  if (
    (playerChoice === "rock" &&
      cpuChoice === "scissors") ||

    (playerChoice === "scissors" &&
      cpuChoice === "paper") ||

    (playerChoice === "paper" &&
      cpuChoice === "rock")
  ) {
    return "win";
  }


  return "lose";
}


/* =========================================================
   手の画像表示
========================================================= */

function showHand(element, hand) {

  if (!hand || !HANDS[hand]) {
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

function showResult(result, points) {

  resultMessageElement.className =
    "result-message";

  pointsMessageElement.textContent = "";


  if (result === "win") {

    resultMessageElement.textContent =
      "貴様の勝ち";

    resultMessageElement.classList.add(
      "result-win"
    );

    pointsMessageElement.textContent =
      `+${points} 点`;

  } else if (result === "lose") {

    resultMessageElement.textContent =
      "貴様の負け";

    resultMessageElement.classList.add(
      "result-lose"
    );

    pointsMessageElement.textContent =
      `${points} 点`;

  } else {

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

function getTitleByScore(currentScore) {

  if (currentScore <= -161) {
    return "カニの食べられないところ";
  }

  if (currentScore <= -65) {
    return "壊れたブンブンチョッパー";
  }

  if (currentScore <= 31) {
    return "インド象を見てるガキ";
  }

  if (currentScore <= 127) {
    return "インディーズバンドドラム担当";
  }

  if (currentScore <= 223) {
    return "勝ち気で陽気なホームレス";
  }

  if (currentScore <= 319) {
    return "BOOKOFFせどりのプロ";
  }

  if (currentScore <= 415) {
    return "激エロのモロホスト";
  }

  return "も";
}


/* =========================================================
   じゃんけん1ラウンド
========================================================= */

function playRound(playerChoice) {

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
    button.classList.add("processing");
  });


  /*
   * BGMは最初のユーザー操作で開始。
   */
  startBGM();


  /*
   * CPUの手を決定
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
  if (result === "win") {

    playerWins++;

    const points =
      2 * multiplier;

    score += points;

    playSE(roundWinSE);

    showResult(
      "win",
      points
    );


    /*
     * 勝利した場合は倍率をリセット
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
  else if (result === "lose") {

    cpuWins++;

    const points =
      -1 * multiplier;

    score += points;

    playSE(roundLoseSE);

    showResult(
      "lose",
      points
    );


    /*
     * 敗北した場合は倍率をリセット
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

    playSE(drawSE);


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
  if (round >= MAX_ROUNDS) {

    gameOver = true;

    updateChoiceButtons();


    /*
     * 少し結果を見せてから
     * 次の処理へ。
     */
    setTimeout(() => {

      isProcessing = false;

      choiceButtons.forEach(button => {
        button.classList.remove("processing");
      });


      /*
       * ここが今回の追加部分。
       *
       * 貴様の勝ち数が
       * フレネミーより多かった場合、
       * 最終結果を出す前に
       * ダも"ルアップへ。
       */
      if (playerWins > cpuWins) {

        startDoubleUpChance();

      } else {

        endGame();

      }

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
      button.classList.remove("processing");
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
   * ゲーム状態
   */
  doubleUpActive = true;

  doubleUpProcessing = false;

  doubleUpRound = 1;

  doubleUpSuccesses = 0;


  /*
   * 最初のカードを引く。
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
   * スクロールを止める
   */
  document.body.style.overflow =
    "hidden";


  /*
   * 既存のゲームUIを操作不能にする。
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
   ダも"ルアップ 進行表示
========================================================= */

function updateDoubleUpProgress() {

  doubleUpProgressElement.textContent =
    `CHANCE ${doubleUpRound} / 3`;

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
   カード情報
========================================================= */

function getCardRank(value) {

  if (value === 1) {
    return "A";
  }

  if (value === 11) {
    return "J";
  }

  if (value === 12) {
    return "Q";
  }

  if (value === 13) {
    return "K";
  }

  return String(value);

}


/*
 * 今回は見た目重視で
 * カード中央に♠を表示。
 *
 * HIGH / LOWの判定自体は
 * 数字だけで行う。
 */
function getCardSuit() {

  return "♠";

}


/* =========================================================
   カード表示
========================================================= */

function displayCard(value, animate = true) {

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
  if (previousValue === nextValue) {
    return false;
  }


  if (
    prediction === "high" &&
    nextValue > previousValue
  ) {
    return true;
  }


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

function playHighLow(prediction) {

  /*
   * 連打対策
   */
  if (
    !doubleUpActive ||
    doubleUpProcessing ||
    doubleUpRound > 3
  ) {
    return;
  }


  doubleUpProcessing = true;


  /*
   * ボタンを一時的に無効化
   */
  highButton.disabled = true;
  lowButton.disabled = true;


  /*
   * 次のカードを引く。
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
   * カードを表示。
   */
  displayCard(
    nextCardValue,
    true
  );


  /*
   * 的中
   */
  if (correct) {

    doubleUpSuccesses++;

    /*
     * 現在の持ち点を2倍。
     */
    score *= 2;


    updateDoubleUpScore();


    highLowMessageElement.textContent =
      `的中！！ 持ち点が ${score} 点になった！`;

    highLowMessageElement.className =
      "high-low-message success";


    /*
     * スコアの大爆発演出
     */
    doubleUpScoreElement.classList.remove(
      "score-doubled"
    );

    void doubleUpScoreElement.offsetWidth;

    doubleUpScoreElement.classList.add(
      "score-doubled"
    );


    /*
     * 3回すべて成功
     */
    if (doubleUpSuccesses >= 3) {

      doubleUpRound = 3;

      updateDoubleUpProgress();


      setTimeout(() => {

        highLowMessageElement.textContent =
          "3連続的中！！ ここで終了だ。";

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


  /*
   * ハズレ
   */
  highLowMessageElement.textContent =
    "ハズレ！！ ダも" +
    '"ルアップ終了。';

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

function finishDoubleUp(reason) {

  if (!doubleUpActive) {
    return;
  }


  doubleUpActive = false;

  doubleUpProcessing = false;


  highButton.disabled = true;
  lowButton.disabled = true;


  /*
   * 結果メッセージを少し表示。
   */
  if (reason === "success") {

    highLowMessageElement.textContent =
      "限界突破。最終結果へ。";

  } else {

    highLowMessageElement.textContent =
      "運命はここまでだ。";

  }


  /*
   * モーダルを閉じる。
   */
  setTimeout(() => {

    doubleUpModal.classList.remove(
      "active"
    );


    document.body.style.overflow =
      "";


    /*
     * 最終結果へ。
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
  if (endGameStarted) {
    return;
  }

  endGameStarted = true;

  gameOver = true;

  doubleUpActive = false;

  stopBGM();


  /*
   * 最終結果の勝敗。
   *
   * じゃんけんの勝ち数そのものを
   * 基準にする。
   */
  if (playerWins > cpuWins) {

    finalResultMessageElement.textContent =
      "貴様の勝利";

    playSE(finalWinSE);

  } else if (playerWins < cpuWins) {

    finalResultMessageElement.textContent =
      "貴様の敗北";

    playSE(finalLoseSE);

  } else {

    finalResultMessageElement.textContent =
      "引き分け";

  }


  /*
   * 最終称号。
   *
   * ダも"ルアップを行った場合も
   * その後の最終スコアで判定。
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
   * ダも"ルアップ結果表示
   */
  if (doubleUpSuccesses > 0) {

    const multiplierText =
      Math.pow(
        2,
        doubleUpSuccesses
      );

    doubleUpResultElement.textContent =
      `ダも"ルアップ成功 ${doubleUpSuccesses}回！ 持ち点 ×${multiplierText}`;

  } else {

    doubleUpResultElement.textContent =
      "";

  }


  /*
   * 結果モーダル表示
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
   * ダも"ルアップ状態もリセット
   */
  doubleUpActive = false;

  doubleUpRound = 0;

  doubleUpSuccesses = 0;

  currentCardValue = null;

  doubleUpProcessing = false;


  /*
   * UI初期化
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
   * ダも"ルアップ表示を初期化
   */
  highLowMessageElement.textContent =
    "運命を選べ。";

  highLowMessageElement.className =
    "high-low-message";


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

choiceButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const hand =
        button.dataset.hand;

      playRound(hand);

    }
  );

});


/* =========================================================
   HIGH / LOWボタン
========================================================= */

highButton.addEventListener(
  "click",
  () => {

    playHighLow("high");

  }
);


lowButton.addEventListener(
  "click",
  () => {

    playHighLow("low");

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