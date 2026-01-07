const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ThreatIntel = require("../models/ThreatIntel.model");
const ActivityLog = require("../models/ActivityLog.model");

dotenv.config();

const generateReport = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const threatCount = await ThreatIntel.countDocuments();
    const criticalThreats = await ThreatIntel.countDocuments({
      severity: "critical",
    });
    const recentLogs = await ActivityLog.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalThreatsDetected: threatCount,
        criticalIntrusions: criticalThreats,
        activitiesLast24h: recentLogs,
      },
      status: criticalThreats > 0 ? "ACTION_REQUIRED" : "SECURE",
    };

    process.stdout.write(JSON.stringify(report, null, 2));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

generateReport();
