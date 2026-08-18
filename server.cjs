var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "FortiGate Conversion Engine Backend",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  app.post("/api/gemini/analyze-config", async (req, res) => {
    try {
      const {
        sourceModel,
        sourceVersion,
        targetModel,
        targetVersion,
        configSnippet,
        alerts,
        customPrompt
      } = req.body;
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in server environment.",
          fallbackAnalysis: generateLocalFallbackAnalysis(
            sourceModel,
            sourceVersion,
            targetModel,
            targetVersion,
            alerts || []
          )
        });
      }
      const prompt = `
You are a Principal Fortinet Network & Security Systems Architect specializing in FortiGate hardware migrations (E-series, F-series, and G-series) and FortiOS syntax transitions (FortiOS 5.x, 6.x, 7.0, 7.2, 7.4, 7.6).

Source Hardware/Firmware: FortiGate ${sourceModel} (FortiOS ${sourceVersion})
Target Hardware/Firmware: FortiGate ${targetModel} (FortiOS ${targetVersion})

Detected Migration Alerts & Syntax Issues:
${JSON.stringify(alerts, null, 2)}

Configuration Context Snippet (Truncated sample):
\`\`\`
${(configSnippet || "").slice(0, 8e3)}
\`\`\`

User Question / Custom Prompt:
${customPrompt || "Provide an in-depth FortiOS architectural migration audit, detailing hardware ASIC differences (CP/NP/SP chips), breaking syntax modifications, interface remaps, SD-WAN zone best practices, and CLI verification commands after loading the configuration."}

Format your response in structured Markdown with:
1. **Migration Risk Summary & Compatibility Rating** (Low / Moderate / High Risk)
2. **Key Hardware & Architecture Differences** (e.g. NP6 vs NP7 vs SP5, FortiLink interfaces, HA ports)
3. **Syntax & Deprecation Breakdown** (breaking changes between FortiOS ${sourceVersion} and ${targetVersion})
4. **Step-by-step Post-Migration CLI Validation Plan** (actual \`diagnose\`, \`get\`, and \`execute\` commands to verify interfaces, routing, IPsec, and policy hits).
5. **Security & Performance Recommendations**.
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert Fortinet NSE 8 Senior Network Security Architect. Provide precise, production-ready FortiOS CLI commands, syntax analysis, and migration troubleshooting advice.",
          temperature: 0.2
        }
      });
      res.json({
        analysis: response.text,
        modelUsed: "gemini-3.7-flash",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.error("Gemini API Error:", err);
      res.status(500).json({
        error: err.message || "Failed to generate AI analysis"
      });
    }
  });
  app.post("/api/gemini/explain-alert", async (req, res) => {
    try {
      const { alert, sourceModel, targetModel, sourceVersion, targetVersion } = req.body;
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          explanation: `Alert [${alert.category}]: ${alert.description}
Recommended Action: ${alert.suggestedRemedy || "Verify interface and syntax alignment manually."}`
        });
      }
      const prompt = `
Explain this FortiGate migration alert and provide the exact FortiOS CLI remediation fix:
- Alert Title: ${alert.title}
- Severity: ${alert.severity}
- Category: ${alert.category}
- Description: ${alert.description}
- Source Line / Code Context: ${alert.sourceBlock || "N/A"}
- Migration Context: FortiGate ${sourceModel} (v${sourceVersion}) -> FortiGate ${targetModel} (v${targetVersion})

Provide:
1. Root cause why this syntax or hardware parameter fails on target FortiGate ${targetModel} (v${targetVersion}).
2. Exact CLI fix snippet to paste into FortiOS CLI.
3. Verification command (e.g. diagnose or get command).
Keep it concise, accurate, and directly actionable.
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt
      });
      res.json({
        explanation: response.text
      });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to explain alert" });
    }
  });
  function generateLocalFallbackAnalysis(srcModel, srcVer, tgtModel, tgtVer, alerts) {
    const criticalCount = alerts.filter((a) => a.severity === "critical").length;
    const warningCount = alerts.filter((a) => a.severity === "warning").length;
    return `
### Automated Migration Audit: FortiGate ${srcModel} (v${srcVer}) \u2794 FortiGate ${tgtModel} (v${tgtVer})

**Overall Readiness Status**: ${criticalCount === 0 ? "Ready with Warnings" : "Attention Required (Critical Syntax Items)"}

#### 1. Hardware Architecture Insights
- **Hardware Transition**: Migrating from ${srcModel} to ${tgtModel}.
- **ASIC Offload Handling**: Ensure hardware acceleration parameters match the target hardware chipset.
- **Interface Alignment**: All interfaces have been auto-remapped according to the target model port layout.

#### 2. Detected Syntax & Compatibility Highlights
- **Critical Alerts**: ${criticalCount} items detected.
- **Warnings / Remediations**: ${warningCount} items flagged.

#### 3. Recommended CLI Validation Sequence
\`\`\`bash
# 1. Verify interface link status and IP bindings
get system interface physical
get router info routing-table all

# 2. Check SD-WAN health checks & member status
diagnose sys sdwan health-check status
diagnose sys sdwan member

# 3. Check IPsec tunnel negotiations
get vpn ipsec tunnel summary
diagnose vpn ike gateway list

# 4. Review policy hit counts and logs
diagnose firewall iprope list
\`\`\`
`;
  }
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FortiGate Conversion Engine Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
