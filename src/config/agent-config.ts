const agentsDefaults = {
  agentType: "lidar-consolidation-agent",
  loglevel: "info",
  userPlugs: [
    {
      name: "Scan",
      flow: "in",
      plugType: "stream",
      schemaPath: "RPLidar.proto:rplidar.Scan"
    },
    {
      name: "Points",
      flow: "out",
      plugType: "stream",
      schemaPath: "Tracking.proto:tether.tracking.TrackedPoints2D"
    }
  ]
};

export default agentsDefaults;
