import { createOpencodeClient } from "../src/services/api/opencode/client.js"
import { claudeMessagesToOpenAI, mergeUserMessages } from "../src/services/api/opencode/messages.js"
import { convertTools } from "../src/services/api/opencode/tools.js"

async function main() {
  console.log("=== OpenClaude Adapter Test ===\n")
  
  const apiKey = process.env.OPENCODE_API_KEY || "public"
  const baseURL = process.env.OPEN_CLAUDE_BASE_URL || "https://opencode.ai/zen/v1"
  const model = process.env.OPEN_CLAUDE_MODEL || "deepseek-v4-flash-free"
  
  console.log("1. Test configuration...")
  console.log(`   Base URL: ${baseURL}`)
  console.log(`   Default model: ${model}`)
  console.log(`   API key: ${apiKey ? "configured" : "not set (API calls will fail)"}\n`)
  
  console.log("2. Testing message conversion...")
  const claudeMsgs = [
    { role: "user", content: [{ type: "text", text: "Say hello in French" }] },
  ]
  const { chatMessages, system } = claudeMessagesToOpenAI(claudeMsgs, "You are a helpful assistant.")
  console.log(`   System: ${system}`)
  console.log(`   Messages: ${JSON.stringify(chatMessages, null, 2)}\n`)
  
  console.log("3. Testing tool conversion...")
  const tools = [
    { name: "get_weather", description: "Get weather", input_schema: { type: "object", properties: { location: { type: "string" } } } },
  ]
  const openaiTools = convertTools(tools)
  console.log(`   Tools: ${JSON.stringify(openaiTools, null, 2)}\n`)
  
  console.log("4. Testing model listing...")
  const client = createOpencodeClient({ apiKey, baseURL, model })
  const models = await client.models()
  console.log(`   Free models found: ${models.length}`)
  if (models.length > 0) {
    models.slice(0, 5).forEach(m => console.log(`   - ${m.id} (${m.name}, tools:${m.toolCall}, ctx:${m.context})`))
  } else {
    console.log("   (No free models in catalog)")
  }
  console.log()
  
  console.log("5. Testing streaming chat (free tier, no API key needed)...")
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => { console.log("   ⏱ Request timed out (30s)"); controller.abort() }, 30000)
    
    let chunkCount = 0
    let reasoningText = ""
    let fullText = ""
    
    for await (const chunk of client.streamChat(
      { messages: [{role:'user', content:'Say hi in 3 words'}], maxTokens: 4096 },
      controller.signal,
    )) {
      chunkCount++
      for (const choice of chunk.choices ?? []) {
        if (choice.delta?.reasoning_content) reasoningText += choice.delta.reasoning_content
        if (choice.delta?.content) fullText += choice.delta.content
        if (choice.finish_reason) {
          console.log(`   Finish reason: ${choice.finish_reason}`)
          if (chunk.usage) console.log(`   Usage: ${JSON.stringify(chunk.usage)}`)
        }
      }
    }
    
    clearTimeout(timeout)
    console.log(`   Chunks received: ${chunkCount}`)
    console.log(`   Reasoning length: ${reasoningText.length} chars`)
    console.log(`   Response content: "${fullText}"`)
    console.log(`   ✅ Streaming test PASSED\n`)
  } catch (err) {
    if (err.name === "AbortError") {
      console.log(`   ⏱ Request was aborted (timeout)`)
    } else {
      console.log(`   ❌ Error: ${err.message}`)
    }
  }
  
  console.log("\n=== Test Complete ===")
}

main().catch(console.error)
