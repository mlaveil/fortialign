import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "FortiGate Conversion Engine Backend",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Lazy Gemini AI Client initialization
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // AI Deep Analysis Endpoint for FortiOS Config & Migration Alerts
  app.post("/api/gemini/analyze-config", async (req, res) => {
    try {
      const {
        sourceModel,
        sourceVersion,
        targetModel,
        targetVersion,
        configSnippet,
        alerts,
        customPrompt,
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
          ),
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
${(configSnippet || "").slice(0, 8000)}
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
          systemInstruction:
            "You are an expert Fortinet NSE 8 Senior Network Security Architect. Provide precise, production-ready FortiOS CLI commands, syntax analysis, and migration troubleshooting advice.",
          temperature: 0.2,
        },
      });

      res.json({
        analysis: response.text,
        modelUsed: "gemini-3.7-flash",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({
        error: err.message || "Failed to generate AI analysis",
      });
    }
  });

  // AI Single Alert Explanation and Remediation Endpoint
  app.post("/api/gemini/explain-alert", async (req, res) => {
    try {
      const { alert, sourceModel, targetModel, sourceVersion, targetVersion } = req.body;
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          explanation: `Alert [${alert.category}]: ${alert.description}\nRecommended Action: ${alert.suggestedRemedy || "Verify interface and syntax alignment manually."}`,
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
        contents: prompt,
      });

      res.json({
        explanation: response.text,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to explain alert" });
    }
  });

  // Fallback local analysis generator if API key is not present
  function generateLocalFallbackAnalysis(
    srcModel: string,
    srcVer: string,
    tgtModel: string,
    tgtVer: string,
    alerts: any[]
  ) {
    const criticalCount = alerts.filter((a) => a.severity === "critical").length;
    const warningCount = alerts.filter((a) => a.severity === "warning").length;

    return `
### Automated Migration Audit: FortiGate ${srcModel} (v${srcVer}) ➔ FortiGate ${tgtModel} (v${tgtVer})

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

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FortiGate Conversion Engine Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
