import path from "path";
import { ActionType } from './actions';
import { StoreState } from './types';

export const defaultState: StoreState = {
  host: "127.0.0.1",
  httpPort: 3000,
  wsPort: 3001,
  lidarConfigPath: path.resolve(__dirname, "..", "..", "dist", "lidars.json"),
  lidars: []
};

export const rootReducer = (
  state = defaultState,
  action
) => {
  switch (action.type) {
    case ActionType.INIT_STORE: {
      const { config } = action;
      return {
        ...defaultState,
        ...config
      };
    }
    case ActionType.ADD_LIDAR: {
      const { config } = action;
      return {
        ...state,
        lidars: [
          ...state.lidars,
          {
            ...config
          }
        ]
      };
    }
    case ActionType.SET_LIDAR_NAME: {
      const { serial, name } = action;
      return {
        ...state,
        lidars: state.lidars.map(l => ({
          ...l,
          name: l.serial === serial
            ? name
            : l.name
        }))
      };
    }
    case ActionType.SET_LIDAR_ROTATION: {
      const { serial, rotation } = action;
      return {
        ...state,
        lidars: state.lidars.map(l => ({
          ...l,
          rotation: l.serial === serial
            ? rotation
            : l.rotation
        }))
      };
    }
    case ActionType.SET_LIDAR_TRANSLATION: {
      const { serial, x, y } = action;
      return {
        ...state,
        lidars: state.lidars.map(l => ({
          ...l,
          x: l.serial === serial ? x : l.x,
          y: l.serial === serial ? y : l.y,
        }))
      };
    }
    case ActionType.SET_LIDAR_COLOR: {
      const { serial, r, g, b } = action;
      return {
        ...state,
        lidars: state.lidars.map(l => ({
          ...l,
          color: l.serial === serial ? [r, g, b] : l.color,
        }))
      };
    }
    default:
      return {
        ...state
      };
  }
};
