const agentsDefaults = {
  agentType: "lidar-consolidation-agent",
  loglevel: "info",
  userPlugs: [
    // in-flowing plugs are created based on the numLidars config
    {
      name: "Points",
      flow: "out",
      plugType: "stream",
      schemaPath: "Tracking.proto:tether.tracking.TrackedPoints2D"
    }
  ]
};

export default agentsDefaults;
