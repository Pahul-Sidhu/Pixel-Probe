import { MCPServer } from "@modelcontextprotocol/server";
import screenshotTool from "../tools/screenshot.js";
import analyzeImageTool from "../tools/analyze-image.js";
import extractDomTool from "../tools/extract-dom.js";

const server = new MCPServer({
  name: "uxlens-mcp",
  version: "1.0.0",
});

// Register tools
server.tool("take_screenshot", screenshotTool);
server.tool("analyze_image", analyzeImageTool);
server.tool("extract_dom", extractDomTool);

// start server
server.listen();
console.log("🔥 MCP UXLens Server running...");