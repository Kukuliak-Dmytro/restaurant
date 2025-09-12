import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("profile", "routes/profile.tsx"),
    route("schedule", "routes/schedule.tsx"),
    index("routes/home.tsx")

] satisfies RouteConfig;
