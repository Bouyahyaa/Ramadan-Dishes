import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import { createRequire } from "module";
const require = createRequire(import.meta.url);


mongoose.Promise = global.Promise;

const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = process.env.PORT || 3000;

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