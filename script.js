/* =========================================
   も”ゃんけん
========================================= */


/* =========================================
   ★ 音声ファイル設定 ★

   ファイル名を変更する場合は
   ここだけ変更してください。
========================================= */

const AUDIO_FILES = {

  // ゲーム中BGM
  bgm: "bgm.mp3",

  // ラウンド勝利SE
  roundWin: "win.mp3",

  // ラウンド敗北SE
  roundLose: "lose.mp3",

  // あいこSE
  draw: "draw.mp3",

  // 最終結果：勝利
  finalWin: "final-win.mp3",

  // 最終結果：敗北
  finalLose: "final-lose.mp3"

};


/* =========================================
   ゲーム設定
========================================= */

const MAX_ROUNDS = 9;

const MAX_HAND_COUNT = 3;


/*
   スコアの理論上の最大・最小値

   最大：
   8回あいこ
   ↓
   ×256
   ↓
   最後に勝利
   ↓
   256 × 2 = +512

   最小：
   8回あいこ
   ↓
   ×256
   ↓
   最後に敗北
   ↓
   -256
*/

const MIN_SCORE = -256;

const MAX_SCORE = 512;


/* =========================================
   手の設定
========================================= */

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


/* =========================================
   ゲーム状態
========================================= */

let playerStock;

let cpuStock;

let score;

let multiplier;

let round;

let playerWins;

let cpuWins;

let draws;

let gameOver;


/*
   ★ 高速連打対策

   1ラウンド処理中は true にします。

   true の間は新しい手を選択できません。

   これによりスマホなどで
   高速連打しても、
   1回のクリックにつき
   1ラウンドだけ処理されます。
*/

let isProcessing = false;


/*
   ゲーム終了処理が
   二重に実行されるのを防止
*/

let endGameStarted = false;


/* =========================================
   音声オブジェクト
========================================= */

const sounds = {

  bgm:
    new Audio(
      AUDIO_FILES.bgm
    ),

  roundWin:
    new Audio(
      AUDIO_FILES.roundWin
    ),

  roundLose:
    new Audio(
      AUDIO_FILES.roundLose
    ),

  draw:
    new Audio(
      AUDIO_FILES.draw
    ),

  finalWin:
    new Audio(
      AUDIO_FILES.finalWin
    ),

  finalLose:
    new Audio(
      AUDIO_FILES.finalLose
    )

};


/* =========================================
   音声設定
========================================= */

sounds.bgm.loop = true;


sounds.bgm.volume = 0.35;

sounds.roundWin.volume = 0.8;

sounds.roundLose.volume = 0.8;

sounds.draw.volume = 0.8;

sounds.finalWin.volume = 1.0;

sounds.finalLose.volume = 1.0;


let bgmStarted = false;


/* =========================================
   HTML要素
========================================= */

const scoreElement =
  document.getElementById(
    "score"
  );


const multiplierElement =
  document.getElementById(
    "multiplier"
  );


const roundNumberElement =
  document.getElementById(
    "roundNumber"
  );


const playerHandElement =
  document.getElementById(
    "player-hand"
  );


const cpuHandElement =
  document.getElementById(
    "cpu-hand"
  );


const resultMessageElement =
  document.getElementById(
    "result-message"
  );


const pointsMessageElement =
  document.getElementById(
    "points-message"
  );


const gameOverModal =
  document.getElementById(
    "gameOverModal"
  );


/* =========================================
   ボタン
========================================= */

const rockButton =
  document.getElementById(
    "rockButton"
  );


const scissorsButton =
  document.getElementById(
    "scissorsButton"
  );


const paperButton =
  document.getElementById(
    "paperButton"
  );


const choiceButtons = [
  rockButton,
  scissorsButton,
  paperButton
];


/* =========================================
   BGM開始
========================================= */

function startBGM() {

  if (bgmStarted) {
    return;
  }


  bgmStarted = true;


  sounds.bgm.currentTime = 0;


  const playPromise =
    sounds.bgm.play();


  if (
    playPromise &&
    typeof playPromise.catch === "function"
  ) {

    playPromise.catch(() => {

      bgmStarted = false;

    });

  }

}


/* =========================================
   BGM停止
========================================= */

function stopBGM() {

  sounds.bgm.pause();

  sounds.bgm.currentTime = 0;

  bgmStarted = false;

}


/* =========================================
   SE再生
========================================= */

function playSE(soundName) {

  const sound =
    sounds[soundName];


  if (!sound) {
    return;
  }


  sound.currentTime = 0;


  const playPromise =
    sound.play();


  if (
    playPromise &&
    typeof playPromise.catch === "function"
  ) {

    playPromise.catch(() => {

      /*
        音声が再生できなくても
        ゲーム本体は停止しません。
      */

    });

  }

}


/* =========================================
   ゲーム初期化
========================================= */

function initializeGame() {

  playerStock = {

    rock:
      MAX_HAND_COUNT,

    scissors:
      MAX_HAND_COUNT,

    paper:
      MAX_HAND_COUNT

  };


  cpuStock = {

    rock:
      MAX_HAND_COUNT,

    scissors:
      MAX_HAND_COUNT,

    paper:
      MAX_HAND_COUNT

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


  stopBGM();


  gameOverModal.classList.add(
    "hidden"
  );


  resetBattleDisplay();


  updateDisplay();

}


/* =========================================
   画面更新
========================================= */

function updateDisplay() {

  scoreElement.textContent =
    score;


  multiplierElement.textContent =
    `×${multiplier}`;


  roundNumberElement.textContent =
    round;


  /* -------------------------
     貴様
  ------------------------- */

  document.getElementById(
    "player-rock-count"
  ).textContent =
    playerStock.rock;


  document.getElementById(
    "player-scissors-count"
  ).textContent =
    playerStock.scissors;


  document.getElementById(
    "player-paper-count"
  ).textContent =
    playerStock.paper;


  /* -------------------------
     フレネミー
  ------------------------- */

  document.getElementById(
    "cpu-rock-count"
  ).textContent =
    cpuStock.rock;


  document.getElementById(
    "cpu-scissors-count"
  ).textContent =
    cpuStock.scissors;


  document.getElementById(
    "cpu-paper-count"
  ).textContent =
    cpuStock.paper;


  /* -------------------------
     選択ボタン
  ------------------------- */

  rockButton.disabled =
    playerStock.rock <= 0 ||
    gameOver ||
    isProcessing;


  scissorsButton.disabled =
    playerStock.scissors <= 0 ||
    gameOver ||
    isProcessing;


  paperButton.disabled =
    playerStock.paper <= 0 ||
    gameOver ||
    isProcessing;


  /* -------------------------
     処理中クラス
  ------------------------- */

  choiceButtons.forEach(
    button => {

      button.classList.toggle(
        "processing",
        isProcessing
      );

    }
  );


  /* -------------------------
     ボタン内残数
  ------------------------- */

  document.getElementById(
    "button-rock-count"
  ).textContent =
    playerStock.rock;


  document.getElementById(
    "button-scissors-count"
  ).textContent =
    playerStock.scissors;


  document.getElementById(
    "button-paper-count"
  ).textContent =
    playerStock.paper;

}


/* =========================================
   フレネミーの手を決定
========================================= */

function getCpuHand() {

  const availableHands =
    Object.keys(cpuStock)
      .filter(
        hand =>
          cpuStock[hand] > 0
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


/* =========================================
   勝敗判定
========================================= */

function judge(
  player,
  cpu
) {

  /*
     あいこ
  */

  if (
    player === cpu
  ) {

    return "draw";

  }


  /*
     貴様の勝ち
  */

  if (

    (
      player === "rock" &&
      cpu === "scissors"
    )

    ||

    (
      player === "scissors" &&
      cpu === "paper"
    )

    ||

    (
      player === "paper" &&
      cpu === "rock"
    )

  ) {

    return "win";

  }


  /*
     貴様の負け
  */

  return "lose";

}


/* =========================================
   手を表示
========================================= */

function showHand(
  element,
  hand
) {

  if (
    !hand ||
    !HANDS[hand]
  ) {

    element.textContent =
      "?";

    return;

  }


  element.innerHTML =
    "";


  const image =
    document.createElement(
      "img"
    );


  image.src =
    HANDS[hand].image;


  image.alt =
    HANDS[hand].name;


  element.appendChild(
    image
  );

}


/* =========================================
   バトル画面リセット
========================================= */

function resetBattleDisplay() {

  playerHandElement.textContent =
    "?";


  cpuHandElement.textContent =
    "?";


  resultMessageElement.textContent =
    "おい、選べる";


  resultMessageElement.className =
    "result-message";


  pointsMessageElement.textContent =
    "現在の倍率 ×1";

}


/* =========================================
   結果表示
========================================= */

function showResult(
  result,
  points
) {

  resultMessageElement.className =
    "result-message";


  /* -------------------------
     勝ち
  ------------------------- */

  if (
    result === "win"
  ) {

    resultMessageElement.textContent =
      "🎉 貴様の勝ち！";


    resultMessageElement.classList.add(
      "result-win"
    );


    pointsMessageElement.textContent =
      `+${points} ポイント！`;

  }


  /* -------------------------
     負け
  ------------------------- */

  else if (
    result === "lose"
  ) {

    resultMessageElement.textContent =
      "💥 貴様の負け…";


    resultMessageElement.classList.add(
      "result-lose"
    );


    pointsMessageElement.textContent =
      `-${points} ポイント…`;

  }


  /* -------------------------
     あいこ
  ------------------------- */

  else {

    resultMessageElement.textContent =
      "🤝 あいこ！";


    resultMessageElement.classList.add(
      "result-draw"
    );


    pointsMessageElement.textContent =
      `次の倍率が ×${multiplier} になります！`;

  }

}


/* =========================================
   ★ スコアから称号を取得
========================================= */

function getTitleByScore(
  currentScore
) {

  /*
     -256 ～ +512 を
     8段階に分けます。

     境界：

     -256 ～ -161
     -160 ～ -65
     -64 ～ 31
      32 ～ 127
     128 ～ 223
     224 ～ 319
     320 ～ 415
     416 ～ 512
  */

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


/* =========================================
   ★ 1ラウンド実行
========================================= */

function playRound(
  playerHand
) {

  /*
     ====================================
     高速連打対策

     すでに処理中なら何もしない。

     これが今回の重要な修正点です。
     ====================================
  */

  if (
    isProcessing ||
    gameOver
  ) {

    return;

  }


  /*
     選択した手が残っているか確認
  */

  if (
    !playerStock[playerHand] ||
    playerStock[playerHand] <= 0
  ) {

    return;

  }


  /*
     フレネミーの手を取得
  */

  const cpuHand =
    getCpuHand();


  if (!cpuHand) {

    return;

  }


  /*
     ====================================
     ここからラウンド処理開始

     この瞬間から次の入力を
     受け付けないようにします。
     ====================================
  */

  isProcessing = true;


  updateDisplay();


  /*
     BGM開始
  */

  startBGM();


  /* -------------------------
     使用回数を減らす
  ------------------------- */

  playerStock[playerHand]--;

  cpuStock[cpuHand]--;


  /* -------------------------
     手を表示
  ------------------------- */

  showHand(
    playerHandElement,
    playerHand
  );


  showHand(
    cpuHandElement,
    cpuHand
  );


  /* -------------------------
     勝敗判定
  ------------------------- */

  const result =
    judge(
      playerHand,
      cpuHand
    );


  let points = 0;


  /* =================================
     勝ち

     ★ 勝利点は倍率 × 2
  ================================= */

  if (
    result === "win"
  ) {

    points =
      multiplier * 2;


    score += points;


    playerWins++;


    playSE(
      "roundWin"
    );


    showResult(
      "win",
      points
    );


    /*
       勝負がついたので
       倍率を1へ戻す
    */

    multiplier = 1;

  }


  /* =================================
     負け

     倍率 × 1点を失う
  ================================= */

  else if (
    result === "lose"
  ) {

    points =
      multiplier;


    score -= points;


    cpuWins++;


    playSE(
      "roundLose"
    );


    showResult(
      "lose",
      points
    );


    /*
       勝負がついたので
       倍率を1へ戻す
    */

    multiplier = 1;

  }


  /* =================================
     あいこ
  ================================= */

  else {

    draws++;


    multiplier *= 2;


    playSE(
      "draw"
    );


    showResult(
      "draw",
      0
    );

  }


  /* -------------------------
     倍率アニメーション
  ------------------------- */

  if (
    result === "draw"
  ) {

    multiplierElement.classList.remove(
      "multiplier-active"
    );


    void multiplierElement.offsetWidth;


    multiplierElement.classList.add(
      "multiplier-active"
    );

  }


  /* -------------------------
     画面更新
  ------------------------- */

  updateDisplay();


  /* =================================
     9ラウンド目
  ================================= */

  if (
    round >= MAX_ROUNDS
  ) {

    /*
       これ以上の入力を
       完全に受け付けない。
    */

    gameOver = true;


    updateDisplay();


    /*
       ここでは round++ しません。

       9 / 9 の状態を維持したまま
       結果発表へ進みます。
    */

    setTimeout(
      () => {

        endGame();

      },
      900
    );


    return;

  }


  /* =================================
     次のラウンド
  ================================= */

  setTimeout(
    () => {

      round++;


      /*
         次のラウンドに進むまで
         入力ロックを解除しない。

         これによって、
         高速連打でも
         ラウンドが飛びません。
      */

      isProcessing = false;


      updateDisplay();

    },
    650
  );

}


/* =========================================
   ゲーム終了
========================================= */

function endGame() {

  /*
     二重実行防止
  */

  if (
    endGameStarted
  ) {

    return;

  }


  endGameStarted = true;


  gameOver = true;

  isProcessing = true;


  let finalResult = "";


  /* -------------------------
     最終結果
  ------------------------- */

  if (
    score > 0
  ) {

    finalResult =
      "🏆 貴様の勝利！";


    playSE(
      "finalWin"
    );

  }


  else if (
    score < 0
  ) {

    finalResult =
      "💀 フレネミーの勝利…";


    playSE(
      "finalLose"
    );

  }


  else {

    finalResult =
      "🤝 引き分け！";

  }


  /* -------------------------
     BGM停止
  ------------------------- */

  stopBGM();


  /* -------------------------
     称号取得
  ------------------------- */

  const finalTitle =
    getTitleByScore(
      score
    );


  /* -------------------------
     最終結果表示
  ------------------------- */

  document.getElementById(
    "final-result"
  ).textContent =
    finalResult;


  document.getElementById(
    "final-title"
  ).textContent =
    finalTitle;


  document.getElementById(
    "final-score"
  ).textContent =
    score;


  document.getElementById(
    "final-player-wins"
  ).textContent =
    playerWins;


  document.getElementById(
    "final-cpu-wins"
  ).textContent =
    cpuWins;


  document.getElementById(
    "final-draws"
  ).textContent =
    draws;


  /* -------------------------
     モーダル表示
  ------------------------- */

  gameOverModal.classList.remove(
    "hidden"
  );


  updateDisplay();

}


/* =========================================
   ボタンイベント
========================================= */

rockButton.addEventListener(
  "click",
  () => {

    playRound(
      "rock"
    );

  }
);


scissorsButton.addEventListener(
  "click",
  () => {

    playRound(
      "scissors"
    );

  }
);


paperButton.addEventListener(
  "click",
  () => {

    playRound(
      "paper"
    );

  }
);


/* =========================================
   リスタート
========================================= */

document
  .getElementById(
    "restartButton"
  )
  .addEventListener(
    "click",
    () => {

      initializeGame();

    }
  );


/* =========================================
   ゲーム開始
========================================= */

initializeGame();