window.addEventListener("DOMContentLoaded", () => {
  const soundRoulette = document.getElementById("sound-roulette");
  const soundDecision = document.getElementById("sound-decision");

  // ルーレット開始音
  window.playRouletteSound = () => {
    soundRoulette.currentTime = 0;
    soundRoulette.play();
  };

  // 決定音
  window.playDecisionSound = () => {
    soundDecision.currentTime = 0;
    soundDecision.play();
  };
});
