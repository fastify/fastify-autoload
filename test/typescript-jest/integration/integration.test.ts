import { spawn } from "child_process";

describe("integration test", function () {
  test("ts-node", async function () {
    await new Promise(function (resolve) {
      const child = spawn("ts-node", [
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
  });

  test("ts-node-dev", async function () {
    await new Promise(function (resolve) {
      const child = spawn("ts-node-dev", [
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
  });
});
