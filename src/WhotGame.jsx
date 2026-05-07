import { useEffect, useRef, useState } from "react";
import {
  databases,
  DATABASE_ID,
  WALLET_COLLECTION,
  CASINO_COLLECTION,
  account,
  ID,
  Query
} from "../lib/appwrite";

const ADMIN_WALLET_ID = "69f2482600125d496354";

export default function CrashGame() {

  const [wallet, setWallet] = useState(null);
  const [stake, setStake] = useState("");
  const [multiplier, setMultiplier] = useState(1);
  const [running, setRunning] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [cashout, setCashout] = useState(false);
  const [result, setResult] = useState("");
  const [profit, setProfit] = useState(0);

  const intervalRef = useRef(null);
  const crashPointRef = useRef(0);
  const betRef = useRef(0);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      const u = await account.get();

      const res = await databases.listDocuments(
        DATABASE_ID,
        WALLET_COLLECTION,
        [Query.equal("userId", u.$id)]
      );

      if (res.documents.length) {
        setWallet(res.documents[0]);
      }
    } catch (err) {
      console.log("wallet load failed (test mode safe)");
    }
  }

  function crashPoint() {
    return (Math.random() * 15 + 1.2).toFixed(2);
  }

  const startGame = async () => {

    const bet = Number(stake);

    if (running || !bet || bet < 50) return;

    // TEST MODE: fallback wallet
    const safeWallet = wallet || { balance: 1000 };

    if (bet > safeWallet.balance) return;

    setRunning(true);
    setCrashed(false);
    setCashout(false);
    setMultiplier(1);
    setResult("");

    betRef.current = bet;
    crashPointRef.current = parseFloat(crashPoint());

    // simulate deduction (NO HARD FAIL)
    if (wallet) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          WALLET_COLLECTION,
          wallet.$id,
          {
            balance: wallet.balance - bet
          }
        );

        setWallet(prev => ({
          ...prev,
          balance: prev.balance - bet
        }));

      } catch {}
    }

    intervalRef.current = setInterval(() => {

      setMultiplier(prev => {
        const next = +(prev + 0.05).toFixed(2);

        if (next >= crashPointRef.current) {
          crashGame();
        }

        return next;
      });

    }, 100);
  };

  const crashGame = () => {

    clearInterval(intervalRef.current);

    setRunning(false);
    setCrashed(true);

    if (!cashout) {
      setResult("💥 CRASHED - LOST");
      return;
    }
  };

  const handleCashout = async () => {

    if (!running || cashout) return;

    setCashout(true);

    const bet = betRef.current;
    const win = Math.floor(bet * multiplier);

    setProfit(win);
    setResult(`🎉 CASHOUT ₦${win}`);

    // update wallet only if exists
    if (wallet) {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          WALLET_COLLECTION,
          wallet.$id,
          {
            balance: wallet.balance + win
          }
        );

        setWallet(prev => ({
          ...prev,
          balance: prev.balance + win
        }));

      } catch {}
    }

    // optional history (won’t break game)
    try {
      await databases.createDocument(
        DATABASE_ID,
        CASINO_COLLECTION,
        ID.unique(),
        {
          userId: wallet?.userId || "test-user",
          stake: bet,
          win,
          type: "crash-test",
          createdAt: new Date().toISOString()
        }
      );
    } catch {}
  };

  return (
    <div style={{ textAlign: "center", paddingTop: 100 }}>

      <h2>💥 CRASH GAME (TEST MODE)</h2>

      <h1 style={{ fontSize: 50 }}>
        x{multiplier.toFixed(2)}
      </h1>

      {crashed && !cashout && (
        <h2 style={{ color: "red" }}>💥 CRASHED</h2>
      )}

      <h3>💰 ₦{wallet?.balance ?? 1000}</h3>

      <input
        type="number"
        placeholder="Stake"
        value={stake}
        onChange={e => setStake(e.target.value)}
      />

      <br /><br />

      {!running ? (
        <button onClick={startGame}>START</button>
      ) : (
        <button onClick={handleCashout}>CASH OUT</button>
      )}

      <h3>{result}</h3>

      {profit > 0 && (
        <h2>+₦{profit}</h2>
      )}

    </div>
  );
}