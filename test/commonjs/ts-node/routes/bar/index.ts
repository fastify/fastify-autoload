module.exports.default = async (fastify: any) => {
  fastify.get("/", function () {
    return { bar: "bar" };
  })
};
