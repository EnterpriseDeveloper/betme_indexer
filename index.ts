import express from "express";

const app = express();

app.get("/ping", (req, res) => {
  res.send({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
