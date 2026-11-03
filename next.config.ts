import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O contêiner Docker usa a saída standalone
  output: "standalone",
  // Impede que o Next infira a raiz do workspace a partir de lockfiles perdidos
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
