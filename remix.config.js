/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: [
    /^wagmi.*/,
    /^@wagmi.*/,
    /^@web3modal.*/,
    /^lit.*/,
    /^@lit.*/,
  ],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
}
