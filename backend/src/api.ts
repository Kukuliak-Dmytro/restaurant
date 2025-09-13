import dotenv from "dotenv";
dotenv.config();

import express from "express";  
import cors from "cors";
import LoadEnvs from "./utils/validate";
import supabase from "./utils/supabase";
import restaurantRoutes from "./routes/restaurant";
import roleRoutes from "./routes/role";
import employeeRoutes from "./routes/employee";
import scheduleRoutes from "./routes/schedule";
import shiftRoutes from "./routes/shift";
import ingredientRoutes from "./routes/ingredients";
import dishRoutes from "./routes/dishes";
const app = express();

app.use(cors());
app.use(express.json());
LoadEnvs();

app.use('/api', restaurantRoutes)
app.use('/api', roleRoutes)
app.use('/api', employeeRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/shifts', shiftRoutes)
app.use('/api', ingredientRoutes)
app.use('/api', dishRoutes)

app.listen(process.env.PORT || 3000, () => {

    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});



