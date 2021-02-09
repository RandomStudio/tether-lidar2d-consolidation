import express from "express";
import store from "../redux";
import { setLidarRotation, setLidarTranslation, setLidarColor } from "../redux/actions";

export const router = express.Router();

// const getTimeStamp = () => `[${new Date().toLocaleString()}]`;

router.get("/api/config", (req, res) => {
  const { host, httpPort, wsPort} = store.getState();
  res.json({ host, httpPort, wsPort });
});

router.get("/api/lidars/all", (req, res) => {
  // return data for all light fixtures
  res.json(store.getState().lidars);
});

router.put("/api/lidar/rotation", (req, res) => {
  const { serial, rotation } = req.body;
  const lidar = store.getState().lidars.find(l => l.serial === serial);
  if (lidar) {
    store.dispatch(setLidarRotation(serial, rotation));
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

router.put("/api/lidar/translation", (req, res) => {
  const { serial, translation: { x, y } } = req.body;
  const lidar = store.getState().lidars.find(l => l.serial === serial);
  if (lidar) {
    store.dispatch(setLidarTranslation(serial, x, y));
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

router.put("/api/lidar/color", (req, res) => {
  const { serial, color: [r, g, b] } = req.body;
  const lidar = store.getState().lidars.find(l => l.serial === serial);
  if (lidar) {
    store.dispatch(setLidarColor(serial, r, g, b));
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});
