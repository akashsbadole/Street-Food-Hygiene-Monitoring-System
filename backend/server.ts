import { createExpress } from "express"; // Use createExpress for express@5.x.x
import bodyParser from "body-parser";
import cors from "cors";
import saveHygieneDataRouter from "./api/saveHygieneData";

const app = createExpress(); // Use createExpress instead of express()
const PORT = 8081;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use("/api", saveHygieneDataRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
