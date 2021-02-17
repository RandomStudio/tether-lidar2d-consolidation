import { LidarConfig, StoreState } from "./types";

export const ActionType = Object.freeze({
  INIT_STORE: "init_store",
  ADD_LIDAR: "add_lidar",
  SET_LIDAR_NAME: "set_lidar_name",
  SET_LIDAR_ROTATION: "set_lidar_rotation",
  SET_LIDAR_TRANSLATION: "set_lidar_translation",
  SET_LIDAR_COLOR: "set_lidar_color"
});

export const initStore = (config: StoreState) => ({
  type: ActionType.INIT_STORE,
  config
});

export const addLidar = (config: LidarConfig) => ({
  type: ActionType.ADD_LIDAR,
  config
});

export const setLidarName = (serial: string, name: String) => ({
  type: ActionType.SET_LIDAR_NAME,
  serial,
  name
});

export const setLidarRotation = (serial: string, rotation: number) => ({
  type: ActionType.SET_LIDAR_ROTATION,
  serial,
  rotation
});

export const setLidarTranslation = (serial: string, x: number, y: number) => ({
  type: ActionType.SET_LIDAR_TRANSLATION,
  serial,
  x,
  y
});

export const setLidarColor = (serial: string, r: number, g: number, b: number) => ({
  type: ActionType.SET_LIDAR_COLOR,
  serial,
  r,
  g,
  b
});
