import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AnglesWithThresholds,
  CornerPoint,
  ConsolidatorConfig,
  LidarDeviceConfig,
} from "../types";

export interface StoreState {
  config: ConsolidatorConfig;
}

export const initialState: StoreState = {
  config: {
    devices: [],
  },
};

export const rootSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    loadStore: (state, action: PayloadAction<ConsolidatorConfig>) => {
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
    clearROI: (state, _action: PayloadAction) => {
      const { regionOfInterest, ...others } = state.config;
      state.config = { ...others }; // exclude regionOfInterest
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
    setMinDistance: (
      state,
      action: PayloadAction<{ serial: string; distance: number }>
    ) => {
      const { serial, distance } = action.payload;
      const device = state.config.devices.find((d) => d.serial === serial);
      device.minDistanceThreshold = distance;
    },
    clearMinDistance: (state, action: PayloadAction<{ serial: string }>) => {
      const { serial } = action.payload;
      const device = state.config.devices.find((d) => d.serial === serial);
      device.minDistanceThreshold = undefined; // TODO: this might not work
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
  clearROI,
  setMask,
  clearMask,
  setMinDistance,
  clearMinDistance,
} = rootSlice.actions;

export default rootSlice.reducer;
