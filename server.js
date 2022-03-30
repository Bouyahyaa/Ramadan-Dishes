import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dishRoutes from "./routes/dish.js";

mongoose.Promise = global.Promise;

const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/" , dishRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server Running on Port: http://localhost:${PORT}`);
});


app.get('/', (req, res) => {
  res.send('Ramadan-Dishes')
})

const CONNECTION_URL = "mongodb+srv://bilelJs:Bilelbilel200@cluster0.0dt5b.mongodb.net/RamadanDB?retryWrites=true&w=majority";

mongoose.connect(CONNECTION_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  });