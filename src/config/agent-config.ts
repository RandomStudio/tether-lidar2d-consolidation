const agentsDefaults = {
  agentType: "lidar-consolidation-agent",
  loglevel: "info",
  userPlugs: [
    // in-flowing plugs are dynamically generated based on the `numLidars` config  value
    {
      name: "Points",
      flow: "out",
      plugType: "stream",
      schemaPath: "Tracking.proto:tether.tracking.TrackedPoints2D"
    }
  ]
};

export default agentsDefaults;
