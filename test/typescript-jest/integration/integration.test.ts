import { spawn } from "child_process";

describe("integration test", function () {
  test.concurrent.each(["ts-node", "ts-node-dev"])(
    "integration with %s",
    async function (instance) {
      await new Promise(function (resolve) {
        const child = spawn(instance, [
          `${process.cwd()}/test/typescript-jest/integration/instance.ts`,
        ]);
        child.stderr.once("data", function () {
          expect(false).toBeTruthy();
        });
        child.stdout.once("data", function () {
          expect(true).toBeTruthy();
        });
        child.once("close", function () {
          resolve("");
        });
      });
    }
  );
});
