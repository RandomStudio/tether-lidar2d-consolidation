# Lidar2D Consolidation Agent

This is a generic Tether agent for consolidation of scan data from multiple lidar sensors.  
It expects to receive "scan" messages from one or more lidar sensors, and will apply DBSCAN clustering to find groups of points that belong to distinct elements.

## Configuration

JSDoc annotations for the main Config object can be found in [Config type def](./src/config/types.ts)

## Plugs

See [AsyncAPI YAML](./tether.yml)

## Calibration

Use https://github.com/RandomStudio/tether-tracking-viz to view and save configuration/calibration for your setup.

## Setup

Install dependencies with:

```
npm install
```

Build the agent with:

```
npm run build
```

## Command line arguments

After building, you can override the agent default config via the usual methods provided by [rc](https://www.npmjs.com/package/rc)

This includes command-line parameters, so for example...

```
node dist/index.js --loglevel=debug --clustering.minNeighbours=10
```

... will launch with loglevel `"debug"` and clustering minNeighbours set to `10`

The full configuration options are documented at [./src/config/types.ts](./src/config/types.ts)

## TODOS

- [x] "Region of interest" using `saveCornerPoints` message could be useful; then send normalised coordinates from this agent
- [x] "Background" removal
- [ ] Some proper unit tests for reducer, etc.
