import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  databases,
  DATABASE_ID,
  account,
  Query
} from "./lib/appwrite";

const GAME_COLLECTION = "games";
const MATCH_COLLECTION = "matches";
const WALLET_COLLECTION = "wallets";

// =========================
// CARD HELPERS
// =========================
function decodeCard(str) {
  if (!str) return null;
  const map = { c: "circle", t: "triangle", s: "square", r: "star", x: "cross" };
  return { shape: map[str[0]], number: Number(str.slice(1)) };
}

function encodeCard(c) {
  const map = { circle: "c", triangle: "t", square: "s", star: "r", cross: "x" };
  return map[c.shape] + c.number;
}

function isValidMove(card, top) {
  if (!top) return true;
  return (
    card.number === top.number ||
    card.shape === top.shape ||
    card.number === 14
  );
}

// =========================
// CARD DRAW (YOUR STYLE)
// =========================
const cache = new Map();

function drawCard(card) {
  const key = `${card.shape}_${card.number}`;
  if (cache.has(key)) return cache.get(key);

  const c = document.createElement("canvas");
  c.width = 90;
  c.height = 130;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 90, 130);

  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, 86, 126);

  ctx.fillStyle = "#e11d48";
  ctx.font = "bold 14px Arial";
  ctx.fillText(card.number, 8, 18);

  const cx = 45, cy = 65;

  if (card.shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  if (card.shape === "square") ctx.fillRect(cx - 14, cy - 14, 28, 28);

  if (card.shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx - 16, cy + 16);
    ctx.lineTo(cx + 16, cy + 16);
    ctx.fill();
  }

  if (card.shape === "star") ctx.fillText("★", cx - 8, cy + 6);

  if (card.shape === "cross") {
    ctx.fillRect(cx - 3, cy - 16, 6, 32);
    ctx.fillRect(cx - 16, cy - 3, 32, 6);
  }

  const img = c.toDataURL();
  cache.set(key, img);
  return img;
}

// =========================
// PARSE / ENCODE
// =========================
function parseGame(g) {
  return {
    ...g,
    players: g.players.split(","),
    hands: g.hands.split("|").map(p => p.split(",").filter(Boolean)),
    deck: g.deck.split(",").filter(Boolean),
    discard: g.discard,
    turn: g.turn,
    pendingPick: Number(g.pendingPick || 0),
    payoutDone: g.payoutDone === true
  };
}

function encodeGame(g) {
  return {
    hands: g.hands.map(p => p.join(",")).join("|"),
    deck: g.deck.join(","),
    discard: g.discard,
    turn: g.turn,
    pendingPick: String(g.pendingPick)
  };
}

// =========================
// COMPONENT
// =========================
export default function WhotGame({ gameId, goHome }) {
  const [game, setGame] = useState(null);
  const [userId, setUserId] = useState(null);

  const actionLock = useRef(false);
  const payoutRef = useRef(false);

  const navigate = useNavigate();

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    account.get().then(u => setUserId(u.$id));
  }, []);

  // =========================
  // LOAD GAME + SUBSCRIBE
  // =========================
  useEffect(() => {
    if (!gameId || !userId) return;

    const load = async () => {
      const g = await databases.getDocument(
        DATABASE_ID,
        GAME_COLLECTION,
        gameId
      );
      setGame(parseGame(g));
    };

    load();

    const unsub = databases.client.subscribe(
      `databases.${DATABASE_ID}.collections.${GAME_COLLECTION}.documents.${gameId}`,
      async (res) => {
        const parsed = parseGame(res.payload);
        setGame(parsed);

        // 💰 PAYOUT
        if (
          parsed.status === "finished" &&
          parsed.winnerId === userId
        ) {
          if (payoutRef.current) return;
          payoutRef.current = true;

          await handlePayout(parsed);
        }
      }
    );

    return () => unsub();
  }, [gameId, userId]);

  // =========================
  // PAYOUT (FINAL SAFE)
  // =========================
  async function handlePayout(g) {
    try {
      const fresh = await databases.getDocument(
        DATABASE_ID,
        GAME_COLLECTION,
        gameId
      );

      if (fresh.payoutDone) return;

      const pot = Number(fresh.pot || 0);
      if (pot <= 0) return;

      const match = await databases.getDocument(
        DATABASE_ID,
        MATCH_COLLECTION,
        fresh.matchId
      );

      const stake = Number(match.stake || 0);

      // 🔒 LOCK FIRST
      await databases.updateDocument(
        DATABASE_ID,
        GAME_COLLECTION,
        gameId,
        { payoutDone: true, pot: 0 }
      );

      // 💰 CREDIT
      const wallets = await databases.listDocuments(
        DATABASE_ID,
        WALLET_COLLECTION,
        [Query.equal("userId", fresh.winnerId)]
      );

      if (wallets.documents.length) {
        const w = wallets.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          WALLET_COLLECTION,
          w.$id,
          { balance: Number(w.balance || 0) + pot }
        );
      }

      // 🔓 UNLOCK BOTH
      for (let pid of fresh.players.split(",")) {
        const ws = await databases.listDocuments(
          DATABASE_ID,
          WALLET_COLLECTION,
          [Query.equal("userId", pid)]
        );

        if (ws.documents.length) {
          const w = ws.documents[0];
          await databases.updateDocument(
            DATABASE_ID,
            WALLET_COLLECTION,
            w.$id,
            {
              locked: Math.max(
                0,
                Number(w.locked || 0) - stake
              )
            }
          );
        }
      }

      await databases.updateDocument(
        DATABASE_ID,
        MATCH_COLLECTION,
        fresh.matchId,
        { status: "finished" }
      );

    } catch (e) {
      console.error("PAYOUT ERROR:", e);
    }
  }

  if (!game || !userId) return <div>Loading...</div>;

  const myIdx = game.players.indexOf(userId);
  const oppIdx = myIdx === 0 ? 1 : 0;

  const hand = game.hands[myIdx].map(decodeCard);
  const top = decodeCard(game.discard);

  // =========================
  // PLAY
  // =========================
  async function playCard(i) {
    if (actionLock.current) return;
    if (game.turn !== userId) return;

    const card = hand[i];

    if (
      game.pendingPick > 0 &&
      ![2, 14].includes(card.number)
    ) return;

    if (!isValidMove(card, top)) return;

    actionLock.current = true;

    const g = JSON.parse(JSON.stringify(game));

    g.hands[myIdx].splice(i, 1);
    g.discard = encodeCard(card);

    let nextTurn = g.players[oppIdx];

    if (card.number === 2) g.pendingPick += 2;
    if (card.number === 14) g.pendingPick += 1;
    if (card.number === 8 || card.number === 1)
      nextTurn = userId;

    if (g.hands[myIdx].length === 0) {
      await databases.updateDocument(
        DATABASE_ID,
        GAME_COLLECTION,
        gameId,
        {
          ...encodeGame(g),
          status: "finished",
          winnerId: userId
        }
      );
      actionLock.current = false;
      return;
    }

    g.turn = nextTurn;

    await databases.updateDocument(
      DATABASE_ID,
      GAME_COLLECTION,
      gameId,
      encodeGame(g)
    );

    actionLock.current = false;
  }

  // =========================
  // DRAW
  // =========================
  async function drawMarket() {
    if (actionLock.current) return;
    if (game.turn !== userId) return;

    actionLock.current = true;

    const g = JSON.parse(JSON.stringify(game));
    let count = g.pendingPick > 0 ? g.pendingPick : 1;

    for (let i = 0; i < count; i++) {
      if (g.deck.length) g.hands[myIdx].push(g.deck.pop());
    }

    g.pendingPick = 0;
    g.turn = g.players[oppIdx];

    await databases.updateDocument(
      DATABASE_ID,
      GAME_COLLECTION,
      gameId,
      encodeGame(g)
    );

    actionLock.current = false;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>WHOT GAME</h2>

      {top && <img src={drawCard(top)} width={70} />}

      <div>
        {hand.map((c, i) => (
          <img
            key={i}
            src={drawCard(c)}
            width={60}
            onClick={() => playCard(i)}
          />
        ))}
      </div>

      <button onClick={drawMarket}>🃏 Draw</button>

      <br /><br />

      {/* 💬 CHAT BUTTON */}
      <button
        onClick={() => navigate(`/messages/${gameId}`)}
        style={{
          padding: 10,
          background: "gold",
          border: "none",
          borderRadius: 8
        }}
      >
        💬 Chat
      </button>

      <br /><br />

      <button onClick={goHome}>Exit</button>
    </div>
  );
}