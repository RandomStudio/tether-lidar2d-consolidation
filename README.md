# Lidar Consolidation Agent
This is a generic Tether agent for consolidation of scan data from multiple lidar sensors.  
It expects to receive `RPLidar.proto:rplidar.Scan` messages from one or more lidar sensors, and will apply DBSCAN clustering to find groups of points that belong to distinct elements.  
## Plugs
The following plugs are available on this agent:
```
name: Lidar{num}
flow: in
plugType: stream
schemaPath: RPLidar.proto:rplidar.Scan
```
This plug is generated dynamically based on the `numLidars` configuration (see below). For each expected lidar, this plug type if instantiated, where `{num}` is replaced with a 1-based index. I.e. with `numLidars` set to `2`, in-flowing plugs will be created with names `Lidar1` and `Lidar2`.  
Route the output from RPLidar agents (`Scan` or `FilteredScan` plugs) to these.
```
name: Points
flow: out
plugType: stream
schemaPath: Tracking.proto:tether.tracking.TrackedPoints2D  
```
This plug will emit the results from clustering analysis on the received lidar scan data.
## Calibration
A web interface is available for visualization of scan data and clustering results, as well as updating lidar configuration data, such as rotation and translation.  
To calibrate these configuration settings, route from the lidar agents' `Scan` (rather than `FilteredScan`) plugs to the consolidation agent's `Scan` plug. This will show all of the lidar's scan points, disregarding its background subtraction, which will help with calibration.   
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
After building, you can run the agent with the following command line arguments:  
- `loglevel`: the global log level, defaults to `info`.
- `numLidars`: the number of lidars that are expected (and allowed) to send data to this agent. Defaults to `1`.
- `lidarConfigPath`: path to the JSON file that contains lidar configuration information. A file will be automatically generated if none is found on the provided location. Configuration settings can be updated via the web interface available via port `3000` (unless otherwise specified in the `httpPort` argument). Defaults to `dist/lidars.json`.
- `host`: address of the host on which this agent runs. Used by the web interface to connect to the WebSocket server. Defaults to `127.0.0.1`.
- `httpPort`: the network port on which the HTTP server is made available. Access the web interface via `http://{host}:{httpPort}`. Defaults to `3000`.
- `wsPort`: the network port on which a WebSocket server is started for communication with the web interface. Defaults to `3001`.
- `maxNeighbourDistance`: the maximum allowed distance (in mm) between scan points for them to be grouped into a cluster. Defaults to `250`.
- `minNeighbours`: the minimum number of neighbouring scan points required to form a cluster. Defaults to `3`.
