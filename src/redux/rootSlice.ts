import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AnglesWithThresholds,
  CornerPoint,
  LidarConsolidatedConfig,
  LidarDeviceConfig,
} from "../consolidator/types";
import { StoreState } from "./types";

export const initialState: StoreState = {
  config: {
    devices: [],
  },
};

export const rootSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    loadStore: (state, action: PayloadAction<LidarConsolidatedConfig>) => {
      state.config = action.payload;
    },
    addDevice: (state, action: PayloadAction<LidarDeviceConfig>) => {
      state.config.devices.push(action.payload);
    },
    setName: (
      state,
      action: PayloadAction<{ serial: string; name: string }>
    ) => {
      const { serial, name } = action.payload;
      const device = state.config.devices.find((d) => d.serial === serial);
      device.name = name;
    },
    setRotation: (
      state,
      action: PayloadAction<{ serial: string; rotation: number }>
    ) => {
      const { serial, rotation } = action.payload;
      const device = state.config.devices.find((d) => d.serial === serial);
      device.rotation = rotation;
    },
    setTranslation: (
      state,
      action: PayloadAction<{ serial: string; x: number; y: number }>
    ) => {
      const { serial, x, y } = action.payload;
      const device = state.config.devices.find((d) => d.serial === serial);
      device.x = x;
      device.y = y;
    },
    setColor: (
      state,
      action: PayloadAction<{ serial: string; color: string }>
    ) => {
      const { serial, color } = action.payload;
      const device = state.config.devices.find((d) => d.serial === serial);
      device.color = color;
    },
    setROI: (state, action: PayloadAction<CornerPoint[]>) => {
      state.config.regionOfInterest = action.payload;
    },
    setMask: (
      state,
      action: PayloadAction<{
        serial: string;
        anglesWithThresholds: AnglesWithThresholds;
      }>
    ) => {
      const { serial, anglesWithThresholds } = action.payload;
      const device = state.config.devices.find((d) => d.serial === serial);
      device.scanMaskThresholds = anglesWithThresholds;
    },
    clearMask: (state, action: PayloadAction<{ serial: string }>) => {
      const { serial } = action.payload;
      const device = state.config.devices.find((d) => d.serial === serial);
      device.scanMaskThresholds = undefined;
    },
  },
});

export const {
  addDevice,
  setName,
  setRotation,
  setTranslation,
  setColor,
  loadStore,
  setROI,
  setMask,
  clearMask,
} = rootSlice.actions;

export default rootSlice.reducer;
