#!/usr/bin/env node

// Imports libs
const chalk = require("chalk")
const inquirer = require("inquirer")
const _boxen = require("boxen")

const boxen = (text, color, options) => {
	return _boxen(text, {
		title: "Magic Command",
		padding: 1,
		margin: 1,
		textAlignment: "left",
		borderColor: color,
		borderStyle: "round",
		...options
	})
}

// Function to show help page
function showHelp(){
	return console.log(`
 Usage
   $ magiccommand
   ${chalk.dim("(or \"magic\")")}

 Options
   --version -v     Show installed version
   --help    -h     Show infos on usage
   --verbose -V     Show more details when using commands

 How to config API Key?
   1. Create an account on ${chalk.cyan("https://openrouter.ai")}
   2. Create a new Key from ${chalk.cyan("https://openrouter.ai/settings/keys")}
   3. Add the provided key in your .bashrc/.zshrc file using the
      following environment variable: ${chalk.yellow("MAGICCOMMAND_OPENROUTER_KEY")}

 FAQ:
   Q: How to use "?" as a command?
   A: Add this line to your .bashrc/.zshrc file:
      ${chalk.dim("alias \\?='magiccommand'")}

   Q: How to list all models?
   A: Visit the OpenRouter website to see the list of available models.
      You can also use ${chalk.dim("magiccommand rank")} to rank them by context length.

   Q: How to change the default model?
   A: Use the following environment variable: ${chalk.yellow("MAGICCOMMAND_OPENROUTER_MODEL")}
      You will need to use the ID provided on the OpenRouter page for the model you want to use.
`)
}

// Function to show version
function showVersion(){
	console.log(`Magic Command is using version ${chalk.cyan(require("./package.json").version)}`)
	console.log("────────────────────────────────────────────")
	console.log("Developed by Johan")
	console.log(chalk.cyan("https://johanstick.fr"))
	process.exit()
}

// Check if some arguments are present
const defaultArgs = process.argv.slice(2)
const isVerbose = defaultArgs.includes("--verbose") || defaultArgs.includes("-V")
if(defaultArgs.includes("version") || defaultArgs.includes("v") || defaultArgs.includes("--version") || defaultArgs.includes("-v")) showVersion()
else if(defaultArgs.includes("help") || defaultArgs.includes("h") || defaultArgs.includes("--help") || defaultArgs.includes("-h")) showHelp()
else if(defaultArgs.includes("rank") || defaultArgs.includes("r") || defaultArgs.includes("--rank") || defaultArgs.includes("-r")) rankingModels()
else main()

// Check updates
const updateNotifier = require("update-notifier")
const pkg = require("./package.json")
const notifierUpdate = updateNotifier({ pkg, updateCheckInterval: 10 })
if(notifierUpdate.update && pkg.version != notifierUpdate.update.latest){
	console.log(boxen(`Update available ${chalk.dim(pkg.version)}${chalk.reset(" → ")}${chalk.green(notifierUpdate.update.latest)}\nRun ${chalk.cyan(`npm i -g ${pkg.name}`)} to update`, "yellow",))

	console.log("\u0007")
}

// Convert context length in human readable format
function convertContextLength(contextLength){
	var value
	if(contextLength < 1000) value = `${contextLength}`
	else if(contextLength < 1000000) value = `${(contextLength / 1000).toFixed(2)}K`
	else if(contextLength < 1000000000) value = `${(contextLength / 1000000).toFixed(2)}M`
	else if(contextLength < 1000000000000) value = `${(contextLength / 1000000000).toFixed(2)}B`
	else value = `${(contextLength / 1000000000000).toFixed(2)}T`

	if(isVerbose) console.log(chalk.bgBlackBright.dim.italic(`Context length converted from "${contextLength}" to "${value}"`))
	return value
}

// Main function
async function main(){
	const os = require("os")
	const ora = require("ora")
	const spinner = ora()

	if(!process.env.MAGICCOMMAND_OPENROUTER_KEY){
		console.log(boxen(`You need to provide an OpenRouter API key using the following\nenvironment variable: ${chalk.yellow("MAGICCOMMAND_OPENROUTER_KEY")}`, "red"))
		process.exit(1)
	}

	var userQuery = process.argv.slice(2).join(" ")
	if(!userQuery){
		var { userQuery } = await inquirer.prompt([{ type: "input", name: "userQuery", message: "Prompt:" }])
	}

	const model = process.env.MAGICCOMMAND_OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free"
	if(isVerbose) console.log(chalk.bgBlackBright.dim.italic(`Using model "${model}"`))

	// System default prompt
	const systemPrompt = `You are a CLI assistant. You need to write the most optimized and complete command possible for the following user-provided query, including all relevant options.
Only output the final command, ready to copy-paste. No explanations, no extra text, no yapping. No markdown is ever allowed. You're forbidden to use any code block, neither code fences.
If there are multiple ways, pick the best one. Ignore any comments or explanations. Only output the final command and nothing else.
Make sure to respect user-configuration provided values as much as possible, when necessary: this means you should NOT use it when there is a better way, BUT, you should use it to open the best editor when you need to open one for example.
If the user is asking you a question, which CAN'T be resolved by only executing a command, you will be authorized to reply to it in a human-readable way, but, always, in a comment.
Reminder: ZERO TEXT ARE ALLOWED, at the exception of the final command and possibly a comment. You need to be absolutely sure that comment IS NECESSARY before adding it. Do not jump double lines, only one if needed.
Reminder: Comments are only allowed when necessary, and need to start by an hashtag (#), if you need to jump lines in your comment, you will use a new line AND an hashtag (#).
Reminder: NO COMMENT ARE ALLOWED, except if it is REALLY NECESSARY, you shouldn't use them in majority of cases.

User-configuration:
- OS: ${process.platform == "win32" ? "Windows" : process.platform == "darwin" ? "macOS" : process.platform} ${process.arch}
- Version: ${os.version()}
- Homedir: ${os.homedir()}
- ${process.env.TERM_PROGRAM ? `Terminal: ${process.env.TERM_PROGRAM}` : ""}
- ${process.env.SHELL ? `Shell: ${process.env.SHELL}` : ""}
- ${process.env.EDITOR ? `Editor: ${process.env.EDITOR}` : ""}
- ${process.env.GUI_EDITOR || process.env.VISUAL ? `Visual editor: ${process.env.GUI_EDITOR || process.env.VISUAL}` : ""}`

	if(isVerbose){
		console.log(chalk.bgBlackBright.dim.italic(`Sending request to OpenRouter API using user query "${userQuery}"`))
		console.log(chalk.bgBlackBright.dim.italic(`System prompt:\n\n${systemPrompt}`))
	} else spinner.start(`Asking AI${chalk.dim.italic(` (using ${model})`)}...`)

	// Get response from API
	var timeNow = Date.now()
	var resJson
	var res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.MAGICCOMMAND_OPENROUTER_KEY}`,
			"X-Title": "Magic Command"
		},
		body: JSON.stringify({
			model,
			messages: [
				{
					role: "system",
					content: systemPrompt
				},
				{
					role: "user",
					content: userQuery
				}
			]
		})
	})

	// Try to parse response (also wait for server to finish processing)
	try {
		if(isVerbose) console.log(chalk.bgBlackBright.dim.italic("Parsing response from API"))
		resJson = await res.json()
	} catch(err) {
		spinner.stop()
		console.error(boxen(`An error occured while parsing the response from the API: ${err}\n\nHTTP Code: ${res?.status} ${res?.statusText}`, "red"))
		console.error(boxen(`Unparsed Response was ${res.text ? (await res.text()) : "unknown"}`, "red"))
		process.exit(1)
	}
	if(isVerbose){
		console.log(chalk.bgBlackBright.dim.italic("Parsed response from API"))
		console.log(boxen(JSON.stringify(resJson, null, 1), "bgBlackBright"))
	}

	var totalTime = Date.now() - timeNow
	spinner.text = "Finalizing..."

	var responseText = resJson?.choices?.[0]?.message?.content
	if(responseText) responseText = responseText.trim()

	// If any error occured, or if no response
	if(resJson?.error || !resJson?.choices || !responseText){
		spinner.stop()
		console.error(boxen(`An error occured while fetching the API: ${resJson?.error?.message || resJson?.error?.code || resJson?.error?.status || JSON.stringify(resJson?.error || resJson)}`, "red"))
		process.exit(1)
	}

	var sources = [...new Set((resJson?.citations || []).map(cite => new URL(cite).hostname.trim().replace("www.")))].join(" ")
	var longestLine = responseText.split("\n").reduce((a, b) => a.length > b.length ? a : b, "")

	// Log response
	spinner.stop()
	console.log(boxen(`${chalk.cyan(responseText)}\n\n${chalk.dim.italic(`Usage: ${resJson?.usage?.total_tokens} tokens, took ${(totalTime / 1000).toFixed(2)} secs${sources.length && longestLine.length > (sources.length + "Usage: xxx tokens, took x.xx secs".length) ? " ― " : sources.length ? "\n" : ""}${sources.length ? `Sources: ${sources}` : ""}`)}`, "green"))
	try { require("clipboardy").writeSync(responseText) } catch(err) { if(isVerbose) console.error(err) }

	process.exit()
}

async function rankingModels(){
	var allModels = await fetch("https://openrouter.ai/api/v1/models").then(res => res.json()).catch(err => {
		console.error(boxen(`An error occured while fetching the API: ${err}`, "red"))
		process.exit(1)
	})
	if(!allModels?.data){
		console.error(boxen(`An error occured while parsing the response from the API: ${allModels?.error?.message || allModels?.error?.code || allModels?.error?.status || JSON.stringify(allModels?.error || allModels)}`, "red"))
		process.exit(1)
	}

	allModels = allModels.data
	allModels = allModels.filter(model => model.architecture.input_modalities.includes("text") && model.architecture.output_modalities.includes("text")) // only allow models with text input/output
	allModels = allModels.filter(model => model.pricing.prompt > -1) // hide negative pricing (openrouter/auto for example)
	allModels = allModels.sort((a, b) => b.context_length - a.context_length) // sort by context length

	function log(title, list){
		console.log(boxen(
			`${title}:\n${list.slice(0, 10).map(model => `  • ${chalk.bold(model?.name)} ${chalk.dim.italic(` (${model?.id})`)}\n    Created on: ${chalk.cyan(new Date(model?.created * 1000 || 0).toLocaleDateString())}\n    Context length: ${chalk.cyan(convertContextLength(model?.context_length))}\n    Pricing (per million tokens):\n      Input: ${chalk.cyan(+Number(model?.pricing?.prompt * 1000000).toPrecision(15))} $\n      Output: ${chalk.cyan(+Number(model?.pricing?.completion * 1000000).toPrecision(15))} $`).join("\n\n")}`,
			"green"
		))
	}

	log("Top 10 sorted by context length", allModels)
	log("Top 10 sorted by context length (free-only)", allModels.filter(model => model.pricing.prompt == 0 && model.pricing.completion == 0))
}