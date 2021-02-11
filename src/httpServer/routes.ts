import express from "express";
import { getLogger } from "log4js";
import FileIO from "../file-io";
import store from "../redux";
import { setLidarRotation, setLidarTranslation, setLidarColor } from "../redux/actions";

const logger = getLogger("lidar-consolidation-agent");

export const router = express.Router();

router.get("/api/config", (req, res) => {
  const { host, httpPort, wsPort } = store.getState();
  res.json({ host, httpPort, wsPort });
});

router.get("/api/lidars/all", (req, res) => {
  // return data for all light fixtures
  res.json(store.getState().lidars);
});

router.post("/api/lidar", async (req, res) => {
  const { serial, rotation, x, y, color } = req.body;
  logger.info(`PUT /api/lidar`, serial, rotation, x, y, color);
  const lidar = store.getState().lidars.find(l => l.serial === serial);
  if (lidar) {
    store.dispatch(setLidarRotation(serial, rotation));
    store.dispatch(setLidarTranslation(serial, x, y));
    const [ r, g, b ] = color;
    store.dispatch(setLidarColor(serial, r, g, b));
    const { lidars } = store.getState();
    await FileIO.save(lidars, store.getState().lidarConfigPath);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

router.put("/api/lidar/rotation", async (req, res) => {
  const { serial, rotation } = req.body;
  const lidar = store.getState().lidars.find(l => l.serial === serial);
  if (lidar) {
    store.dispatch(setLidarRotation(serial, rotation));
    const { lidars } = store.getState();
    await FileIO.save(lidars, store.getState().lidarConfigPath);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

router.put("/api/lidar/translation", async (req, res) => {
  const { serial, x, y } = req.body;
  const lidar = store.getState().lidars.find(l => l.serial === serial);
  if (lidar) {
    store.dispatch(setLidarTranslation(serial, x, y));
    const { lidars } = store.getState();
    await FileIO.save(lidars, store.getState().lidarConfigPath);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

router.put("/api/lidar/color", async (req, res) => {
  const { serial, color: [r, g, b] } = req.body;
  const lidar = store.getState().lidars.find(l => l.serial === serial);
  if (lidar) {
    store.dispatch(setLidarColor(serial, r, g, b));
    const { lidars } = store.getState();
    await FileIO.save(lidars, store.getState().lidarConfigPath);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});
