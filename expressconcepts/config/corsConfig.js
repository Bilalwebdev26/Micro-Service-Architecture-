import cors from "cors";
export const configureCors = () => {
  return cors({
    origin: (origin, callback) => {
      const allowedOrigns = ["http://localhost:5173"];
      if (!origin || allowedOrigns.indexOf(origin) !== -1) {
        //-1 !== -1 false 1 !== -1 true
        callback(null, true);
      } else {
        callback(new Error("reject by cors"));
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    maxAge: 600, //10min tak request cache rakhe ga
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
};
