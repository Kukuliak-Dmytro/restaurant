import dotenv from "dotenv";
dotenv.config();

import express from "express";  
import cors from "cors";
import validate from "./utils/validate";
import supabase from "./utils/supabase";
import restaurantRoutes from "./routes/restaurant";
import roleRoutes from "./routes/role";
import employeeRoutes from "./routes/employee";
const app = express();

app.use(cors());
app.use(express.json());
validate();

app.use('/api', restaurantRoutes)
app.use('/api', roleRoutes)
app.use('/api', employeeRoutes)

app.listen(process.env.PORT || 3000, () => {

    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});



