import fastify from "fastify";
import basicApp from "../../typescript/basic/app";

const app = fastify();
app.register(basicApp);

app.listen(Math.floor(Math.random() * 3000 + 3000), function (err) {
  if (err) console.error("failed");
  console.log("success");
  app.close();
});
