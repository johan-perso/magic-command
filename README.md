###### Version française [ici](https://github.com/johan-perso/magic-command/blob/main/README.fr.md).

# Magic Command

Get an AI-generated command instantly from your terminal. Use any model available on [OpenRouter](https://openrouter.ai), **you'll need your own API key**.

https://github.com/user-attachments/assets/5f0e0a14-6a9e-4e96-b46a-2c3fcdb4cd52

## Installation

> Magic Command only supports recent versions of NodeJS (v20+).

```bash
# With npm
npm i -g magic-command

# Or with pnpm
pnpm i -g magic-command
```

```bash
$ magiccommand --version
$ magiccommand --help
```

```bash
$ magiccommand "Init Vite App"

#   ╭ Magic Command ────────────────────────╮
#   │                                       │
#   │   npm init vite@latest                │
#   │                                       │
#   │   Usage: 417 tokens, took 1.10 secs   │
#   │                                       │
#   ╰───────────────────────────────────────╯
```


## Configuration

You will need to add your [OpenRouter](https://openrouter.ai) API key to your environment variables, this is usually done through the `.bashrc` or `.zshrc` file on macOS and Linux.

```env
# Authentication, required
MAGICCOMMAND_OPENROUTER_KEY=sk-or-...

# Customization, optional
MAGICCOMMAND_OPENROUTER_MODEL=openai/gpt-4o-mini
```


## License

MIT © [Johan](https://johanstick.fr/). [Support this project](https://johanstick.fr/#donate) if you want to help me 💙