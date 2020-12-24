import { spawnSync } from "child_process";

describe("integration test", function () {
  test("ts-node", async function () {
    const child = spawnSync("ts-node", [
      `${process.cwd()}/test/typescript-jest/integration/instance.ts`,
    ]);
    expect(child.stderr.length).toStrictEqual(0);
    expect(child.stdout.length).toBeGreaterThan(1);
  });

  test("ts-node-dev", async function () {
    const child = spawnSync("ts-node-dev", [
      `${process.cwd()}/test/typescript-jest/integration/instance.ts`,
    ]);
    expect(child.stderr.length).toStrictEqual(0);
    expect(child.stdout.length).toBeGreaterThan(1);
  });
});
