import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "clear-old-streams",
  {
    dayOfWeek: "sunday",
    hourUTC: 0,
    minuteUTC: 0,
  },
  internal.streams.clearOldStreams,
);

export default crons;
