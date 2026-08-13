import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./src/db/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import { simulatePrices } from "./src/controllers/share.controller.js";
import { simulateIPOPrices } from "./src/controllers/ipo.controllers.js";
import nodemailer from "nodemailer";
import { leaderBoardData } from "./src/controllers/trading.controllers.js";
import { pushAllOnlinePL } from "./src/utils/plCache.js";
import {
  loadShareCache,
  getShareEntries,
  getShareCache,
} from "./src/utils/shareCache.js";
import { SIM_CONFIG } from "./src/config/simulation.config.js";
import { breakState } from "./src/utils/breakState.js";

//import models

// import { News } from "./src/models/News.models.js";
import { marketTrend } from "./src/utils/marketState.js";

//import routes
import { userRouter } from "./src/routes/user.router.js";
import { shareRouter } from "./src/routes/share.router.js";
import { tradingRouter } from "./src/routes/trading.router.js";
// import { newsRouter } from "./src/routes/news.router.js";
import { google } from "googleapis";
import { ipoRouter } from "./src/routes/ipo.router.js";
import { trendState } from "./src/utils/trendState.js";
import trendRouter from "./src/routes/trend.router.js";
import { simulateSectorTrend } from "./src/utils/simulateSectorTrend.js";
import { emitLatestNews } from "./src/controllers/trading.controllers.js";
import { sessionConfig } from "./src/config/session.js";
import passport from "./src/config/passport-config.js";

const app = express();
dotenv.config({});
const port = process.env.PORT || 4000;
const server = createServer(app);

// cron function change price in every 5 second

//instance of socket

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigin = process.env.CORS_ORIGIN;
      const isDevelopment = process.env.NODE_ENV;

      if (!origin || origin === allowedOrigin || isDevelopment) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORs Policy."));
      }
    },
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
// cors options
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigin = process.env.CORS_ORIGIN;
    const isDevelopment = process.env.NODE_ENV;

    if (!origin || origin === allowedOrigin || isDevelopment) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORs Policy."));
    }
  },
  credentials: true,
  methods: "GET, POST, DELETE, PATCH, HEAD, PUT, OPTIONS",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Credentials",
    "cache-control",
    "svix-id",
    "svix-timestamp",
    "svix-signature",
  ],
  exposedHeaders: ["Authorization"],
};

// default middelwares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.static("/tmp", { index: false }));
// make io available on req in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({ msg: "backend is running" });
});

// Keep track of which sockets subscribed to which shares
const subscriptions = new Map(); // socket.id -> shareId

// Keep track of which userIds currently have at least one live socket, so
// the 1s P/L heartbeat only does work for users who are actually connected
// (registerUser -> socket.join(userId) already puts them in a room; this
// Map<userId, socketCount> is what lets us iterate that set directly instead
// of re-deriving it from Mongo on every tick).
const onlineUsers = new Map(); // userId -> number of active sockets
const socketUserMap = new Map(); // socket.id -> userId (for disconnect cleanup)

// Break/pause flag now lives in the shared breakState module (see import
// above) so both the socket "toggle_break" event AND an admin REST endpoint
// (POST /trend/break) can read/mutate the same value.

io.on("connection", async (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // connection for all breake and start game
  socket.emit("break_state", { isBreak: breakState.isBreak });

  // Served straight from the in-memory cache — no DB round trip on connect.
  socket.emit("shareliveprice", getShareEntries());

  socket.on("toggle_break", () => {
    breakState.isBreak = !breakState.isBreak;
    io.emit("break_state", { isBreak: breakState.isBreak }); // ✅ broadcast to everyone
    console.log(`Break mode: ${breakState.isBreak}`);
  });

  socket.on("registerUser", (userId) => {
    if (!userId) return;
    socket.join(userId); // 🔑 Now this socket is in the userId room
    socketUserMap.set(socket.id, userId);
    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
    console.log(`📌 ${socket.id} joined room for user ${userId}`);

    // Push realized/unrealized P/L immediately on registration instead of
    // making the client wait for the REST call or the next 1s heartbeat —
    // this is the fix for "realized P/L is taking time for loading".
    pushAllOnlinePL(io, new Set([userId]));
  });

  // Legacy client-driven path — no longer required (the server now pushes
  // P/L on its own 1s heartbeat + right after every trade), kept only for
  // any older client build still emitting it.
  socket.on("market_prices", async ({ userId } = {}) => {
    if (!userId) return;
    await pushAllOnlinePL(io, new Set([userId]));
  });

  // User subscribes to a specific share
  socket.on("subscribeShareHistory", (shareId) => {
    subscriptions.set(socket.id, shareId);
    console.log(`📌 ${socket.id} subscribed to ${shareId}`);
  });

  // User unsubscribes
  socket.on("unsubscribeShareHistory", () => {
    subscriptions.delete(socket.id);
    console.log(`❌ ${socket.id} unsubscribed`);
  });

  socket.on("disconnect", () => {
    subscriptions.delete(socket.id);

    const userId = socketUserMap.get(socket.id);
    if (userId) {
      socketUserMap.delete(socket.id);
      const remaining = (onlineUsers.get(userId) || 1) - 1;
      if (remaining <= 0) onlineUsers.delete(userId);
      else onlineUsers.set(userId, remaining);
    }

    console.log(`❌ User disconnected: ${socket.id}`);
  });

  await leaderBoardData(io);

  // Listen for client requests
  socket.on("request-top-users", async () => {
    await leaderBoardData(io);
  });

  await emitLatestNews(io);
});

// Realized + unrealized P/L heartbeat: pushes "pl_update" to every online
// user's room every PL_PUSH_INTERVAL_MS (1s by default). Uses the in-memory
// share price cache, so it never waits on the price-simulation cron tick or
// a DB read — this is what makes P/L feel instant instead of "loading".
setInterval(() => {
  if (!onlineUsers.size) return;
  pushAllOnlinePL(io, new Set(onlineUsers.keys()));
}, SIM_CONFIG.PL_PUSH_INTERVAL_MS);

// Global cron job to update candles + send history
//
// Interval dropped from 8s -> SIM_CONFIG.CRON_INTERVAL_SEC (2s by default).
// Everything that used to be hardcoded around "5s"/"8s" (candle window,
// trend candle-period math) now derives from SIM_CONFIG, so this is the only
// place you need to touch to retime the whole simulation.
cron.schedule(SIM_CONFIG.CRON_EXPRESSION, async () => {
  if (breakState.isBreak) {
    console.log("⏸ Break active, skipping price simulation...");
    return;
  }

  // await simulateIPOPrices(io);

  if (trendState.active) {
    await simulateSectorTrend(io);
  } else {
    await simulatePrices(io);
  }

  // Per-share subscribers: served from the cache that simulatePrices /
  // simulateSectorTrend just updated, instead of a fresh Mongo read per
  // subscriber per tick.
  const cache = getShareCache();
  for (const [socketId, shareId] of subscriptions.entries()) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) continue;

    const share = cache.get(String(shareId));
    if (share) {
      socket.emit("shareHistoryData", {
        shareId,
        sharename: share.shareName,
        history: share.lastHistory ? [share.lastHistory] : [],
        mode: trendState.active ? "trend" : marketTrend.mode,
      });
    }
  }
});

app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/ipo", ipoRouter);
app.use("/api/share", shareRouter);
app.use("/api/trade", tradingRouter);
app.use("/api/user", userRouter);
app.use("/trend", trendRouter);

connectToDatabase().then(async () => {
  // Populate the in-memory share cache once at boot; every simulation tick
  // and every socket connection reads/writes this instead of Mongo.
  await loadShareCache();
  console.log(`💾 Share cache loaded (${getShareEntries().length} shares)`);

  server.listen(port, () => {
    console.log(
      `app is running on port : ${port} | sim tick: ${SIM_CONFIG.CRON_INTERVAL_SEC}s | pl push: ${SIM_CONFIG.PL_PUSH_INTERVAL_MS}ms`
    );
  });
});
