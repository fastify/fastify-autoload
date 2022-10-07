module.exports = async (fastify) => {
  fastify.get("/", function () {
    return { foo: "bar" };
  })
};
