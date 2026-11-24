import { createWorker } from "./src/server/worker-handler";

// OpenNext generates this module during build:worker. Load it only for app requests.
export default createWorker(() => import("./.open-next/worker.js"));
