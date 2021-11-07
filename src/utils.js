export const getCloudEval = async (fen) => {
  let apiResult = await fetch(
    "https://lichess.org/api/cloud-eval?" + new URLSearchParams({ fen })
  );
  if (apiResult.status >= 404) {
    const splitFen = fen.split(" ");
    const newFen = splitFen
      .slice(0, 3)
      .concat("-")
      .concat(splitFen.slice(3))
      .join(" ");
    apiResult = await fetch(
      "https://lichess.org/api/cloud-eval?" +
        new URLSearchParams({ fen: newFen })
    );
  }
  const apiJson = (await apiResult.json()).pvs[0];
  return apiJson.mate === undefined ? apiJson.cp / 100 : apiJson.mate * 1000;
};

export const getRandomOpeningMove = async (fen, config) => {
  const apiResult = await fetch(
    "https://explorer.lichess.ovh/lichess?" +
      new URLSearchParams({
        ...config,
        fen,
        variant: "standard",
        topGames: 0,
        recentGames: 0,
      })
  );
  const apiJson = await apiResult.json();

  const moves = apiJson.moves.map((m) => [m.san, m.white + m.draws + m.black]);
  const totalMoves = moves.reduce(
    (accum, [_san, moveCount]) => accum + moveCount,
    0
  );

  let randomResult = Math.random() * totalMoves;
  for (const [san, moveCount] of moves) {
    randomResult -= moveCount;
    if (randomResult <= 0) {
      return { san, moveCount, probability: moveCount / totalMoves };
    }
  }
};
