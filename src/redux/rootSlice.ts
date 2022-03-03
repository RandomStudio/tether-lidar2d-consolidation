import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
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
      action: PayloadAction<{ serial: string; r: number; g: number; b: number }>
    ) => {
      const { serial, r, g, b } = action.payload;
      const device = state.config.devices.find((d) => d.serial === serial);
      device.color = [r, g, b];
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
} = rootSlice.actions;

export default rootSlice.reducer;

//  (state = defaultState, action): StoreState => {
//   switch (action.type) {
//     case ActionType.INIT_STORE: {
//       const { config } = action;
//       return {
//         ...defaultState,
//         ...config,
//       };
//     }
//     case ActionType.ADD_LIDAR: {
//       const { config } = action;
//       return {
//         ...state,
//         config: {
//           ...config,
//           devices: [...state.config.devices],
//         },
//       };
//     }
//     case ActionType.SET_LIDAR_NAME: {
//       const { serial, name } = action;
//       return {
//         ...state,
//         config: {
//           ...state.config,
//           devices: state.config.devices.map((l) => ({
//             ...l,
//             name: l.serial === serial ? name : l.name,
//           })),
//         },
//       };
//     }
//     case ActionType.SET_LIDAR_ROTATION: {
//       const { serial, rotation } = action;
//       return {
//         ...state,
//         config: {
//           ...state.config,
//           devices: state.config.devices.map((l) => ({
//             ...l,
//             rotation: l.serial === serial ? rotation : l.rotation,
//           })),
//         },
//       };
//     }
//     case ActionType.SET_LIDAR_TRANSLATION: {
//       const { serial, x, y } = action;
//       return {
//         ...state,
//         config: {
//           ...state.config,
//           devices: state.config.devices.map((l) => ({
//             ...l,
//             x: l.serial === serial ? x : l.x,
//             y: l.serial === serial ? y : l.y,
//           })),
//         },
//       };
//     }
//     case ActionType.SET_LIDAR_COLOR: {
//       const { serial, r, g, b } = action;
//       return {
//         ...state,
//         config: {
//           ...state.config,
//           devices: state.config.devices.map((l) => ({
//             ...l,
//             color: l.serial === serial ? [r, g, b] : l.color,
//           })),
//         },
//       };
//     }
//     default:
//       return {
//         ...state,
//       };
//   }
// };
