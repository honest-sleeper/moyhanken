/* =========================================
   も”ゃんけん
   =========================================

   【画像】

   guu.png    → 紫 → グー
   chyoki.png → 黄色 → チョキ
   pa.png     → 緑 → パー


   【音声】

   bgm        → ゲーム中BGM
   roundWin   → ラウンド勝利SE
   roundLose  → ラウンド敗北SE
   draw       → あいこSE
   finalWin   → 最終結果勝利SE
   finalLose  → 最終結果敗北SE

========================================= */


/* =========================================
   ★ 音声ファイル設定 ★

   音声ファイルを変更するときは
   ここだけ書き換えてください。
========================================= */

const AUDIO_FILES = {

  // ゲーム中に流れるBGM
  bgm: "bgm.mp3",

  // 1ラウンド勝ったとき
  roundWin: "win.mp3",

  // 1ラウンド負けたとき
  roundLose: "lose.mp3",

  // 1ラウンドあいこのとき
  draw: "draw.mp3",

  // 9ラウンド終了後、最終的に勝ったとき
  finalWin: "final-win.mp3",

  // 9ラウンド終了後、最終的に負けたとき
  finalLose: "final-lose.mp3"

};


/* =========================================
   ゲーム設定
========================================= */

const MAX_ROUNDS = 9;

const MAX_HAND_COUNT = 3;


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


/* =========================================
   音声オブジェクト
========================================= */

const sounds = {

  bgm: new Audio(AUDIO_FILES.bgm),

  roundWin:
    new Audio(AUDIO_FILES.roundWin),

  roundLose:
    new Audio(AUDIO_FILES.roundLose),

  draw:
    new Audio(AUDIO_FILES.draw),

  finalWin:
    new Audio(AUDIO_FILES.finalWin),

  finalLose:
    new Audio(AUDIO_FILES.finalLose)

};


/* =========================================
   音声設定
========================================= */

sounds.bgm.loop = true;


/*
   音量設定
*/

sounds.bgm.volume = 0.35;

sounds.roundWin.volume = 0.8;

sounds.roundLose.volume = 0.8;

sounds.draw.volume = 0.8;

sounds.finalWin.volume = 1.0;

sounds.finalLose.volume = 1.0;


/*
   BGMが再生できたかどうか
*/

let bgmStarted = false;


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


  /*
    ブラウザによっては
    play() がPromiseを返します。
  */

  if (
    playPromise &&
    typeof playPromise.catch === "function"
  ) {

    playPromise.catch(() => {

      /*
        ブラウザの自動再生制限などで
        再生できない場合は何もしません。
      */

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

  const sound = sounds[soundName];


  if (!sound) {
    return;
  }


  /*
    同じSEを連続再生できるように
    毎回先頭へ戻します。
  */

  sound.currentTime = 0;


  const playPromise =
    sound.play();


  if (
    playPromise &&
    typeof playPromise.catch === "function"
  ) {

    playPromise.catch(() => {

      /*
        音声ファイルがない場合や
        ブラウザ側で再生できない場合でも
        ゲーム自体は止めません。
      */

    });

  }

}


/* =========================================
   HTML要素
========================================= */

const scoreElement =
  document.getElementById("score");

const multiplierElement =
  document.getElementById("multiplier");

const roundNumberElement =
  document.getElementById("roundNumber");

const playerHandElement =
  document.getElementById("player-hand");

const cpuHandElement =
  document.getElementById("cpu-hand");

const resultMessageElement =
  document.getElementById("result-message");

const pointsMessageElement =
  document.getElementById("points-message");

const gameOverModal =
  document.getElementById("gameOverModal");


/* =========================================
   ゲーム初期化
========================================= */

function initializeGame() {

  playerStock = {

    rock: MAX_HAND_COUNT,

    scissors: MAX_HAND_COUNT,

    paper: MAX_HAND_COUNT

  };


  cpuStock = {

    rock: MAX_HAND_COUNT,

    scissors: MAX_HAND_COUNT,

    paper: MAX_HAND_COUNT

  };


  score = 0;

  multiplier = 1;

  round = 1;

  playerWins = 0;

  cpuWins = 0;

  draws = 0;

  gameOver = false;


  /*
    前回のゲーム終了時に
    BGMを止めます。
  */

  stopBGM();


  /*
    終了画面を隠す
  */

  gameOverModal.classList.add(
    "hidden"
  );


  /*
    対戦画面を初期状態へ
  */

  resetBattleDisplay();


  /*
    画面更新
  */

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
     貴様の残り回数
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
     フレネミーの残り回数
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


  rockButton.disabled =
    playerStock.rock <= 0 ||
    gameOver;


  scissorsButton.disabled =
    playerStock.scissors <= 0 ||
    gameOver;


  paperButton.disabled =
    playerStock.paper <= 0 ||
    gameOver;


  /* -------------------------
     ボタン内の回数
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


/* =========================================
   勝敗判定
========================================= */

function judge(player, cpu) {

  /*
    あいこ
  */

  if (player === cpu) {

    return "draw";

  }


  /*
    貴様の勝ち
  */

  if (

    (player === "rock" &&
      cpu === "scissors")

    ||

    (player === "scissors" &&
      cpu === "paper")

    ||

    (player === "paper" &&
      cpu === "rock")

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

    element.textContent = "?";

    return;

  }


  element.innerHTML = "";


  const image =
    document.createElement("img");


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
    "手を選んでください";


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

  if (result === "win") {

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

  else if (result === "lose") {

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
   1ラウンド実行
========================================= */

function playRound(
  playerHand
) {

  if (gameOver) {
    return;
  }


  /*
    最初のユーザー操作で
    BGMを開始します。

    ブラウザの自動再生制限対策です。
  */

  startBGM();


  /* -------------------------
     使用できる回数を確認
  ------------------------- */

  if (
    playerStock[playerHand] <= 0
  ) {

    return;

  }


  /* -------------------------
     フレネミーの手を決定
  ------------------------- */

  const cpuHand =
    getCpuHand();


  if (!cpuHand) {

    return;

  }


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
     
     ★ 変更点
     勝利ポイントを +1 から +2 に変更
  ================================= */

  if (result === "win") {

    points = multiplier * 2;


    score += points;


    playerWins++;


    /*
      勝利SE
    */

    playSE("roundWin");


    showResult(
      "win",
      points
    );


    /*
      勝負がついたら
      倍率を1倍へ戻す
    */

    multiplier = 1;

  }


  /* =================================
     負け

     敗北は今まで通り
     倍率 × -1
  ================================= */

  else if (result === "lose") {

    points = multiplier;


    score -= points;


    cpuWins++;


    /*
      敗北SE
    */

    playSE("roundLose");


    showResult(
      "lose",
      points
    );


    /*
      勝負がついたら
      倍率を1倍へ戻す
    */

    multiplier = 1;

  }


  /* =================================
     あいこ
  ================================= */

  else {

    draws++;


    /*
      倍率2倍
    */

    multiplier *= 2;


    /*
      あいこSE
    */

    playSE("draw");


    showResult(
      "draw",
      0
    );

  }


  /* -------------------------
     倍率アニメーション
  ------------------------- */

  if (result === "draw") {

    multiplierElement.classList.remove(
      "multiplier-active"
    );


    /*
      CSSアニメーションを
      再スタートさせる
    */

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
     9ラウンド終了
  ================================= */

  if (
    round >= MAX_ROUNDS
  ) {

    gameOver = true;


    updateDisplay();


    /*
      少し間を置いて
      最終結果を表示
    */

    setTimeout(() => {

      endGame();

    }, 1100);


    return;

  }


  /* =================================
     次のラウンド
  ================================= */

  setTimeout(() => {

    round++;

    updateDisplay();

  }, 650);

}


/* =========================================
   ゲーム終了
========================================= */

function endGame() {

  gameOver = true;


  let finalResult = "";


  /* -------------------------
     最終結果判定
  ------------------------- */

  if (score > 0) {

    finalResult =
      "🏆 貴様の勝利！";


    /*
      最終勝利SE
    */

    playSE("finalWin");

  }


  else if (score < 0) {

    finalResult =
      "💀 フレネミーの勝利…";


    /*
      最終敗北SE
    */

    playSE("finalLose");

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
     最終結果表示
  ------------------------- */

  document.getElementById(
    "final-result"
  ).textContent =
    finalResult;


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

document
  .getElementById("rockButton")
  .addEventListener(
    "click",
    () => {

      playRound("rock");

    }
  );


document
  .getElementById("scissorsButton")
  .addEventListener(
    "click",
    () => {

      playRound("scissors");

    }
  );


document
  .getElementById("paperButton")
  .addEventListener(
    "click",
    () => {

      playRound("paper");

    }
  );


/* =========================================
   リスタート
========================================= */

document
  .getElementById("restartButton")
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