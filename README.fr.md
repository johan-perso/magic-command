###### English version [here](https://github.com/johan-perso/magic-command/blob/main/README.md).

# Magic Command

Obtenez une commande générée par IA en un instant depuis votre terminal. Utilisez n'importe quel modèle disponible sur [OpenRouter](https://openrouter.ai), **vous aurez besoin de votre propre clé d'API**.

https://github.com/user-attachments/assets/5f0e0a14-6a9e-4e96-b46a-2c3fcdb4cd52

## Installation

> Magic Command ne supporte que les versions récentes de NodeJS (v20+).

```bash
# Avec npm
npm i -g magic-command

# Ou avec pnpm
pnpm i -g magic-command
```

```bash
$ magiccommand --version
$ magiccommand --help
```

```bash
$ magiccommand "Initialise une app Vite"

#   ╭ Magic Command ────────────────────────╮
#   │                                       │
#   │   npm init vite@latest                │
#   │                                       │
#   │   Usage: 417 tokens, took 1.10 secs   │
#   │                                       │
#   ╰───────────────────────────────────────╯
```


## Configuration

Vous aurez besoin d'ajouter votre clé d'API [OpenRouter](https://openrouter.ai) dans vos variables d'environnement, cela se fait généralement via le fichier `.bashrc` ou `.zshrc` sur macOS et Linux.

```env
# Authentification, requise
MAGICCOMMAND_OPENROUTER_KEY=sk-or-...

# Personnalisation, facultatif
MAGICCOMMAND_OPENROUTER_MODEL=openai/gpt-4o-mini
```


## Licence

MIT © [Johan](https://johanstick.fr). [Soutenez ce projet](https://johanstick.fr/#donate) si vous souhaitez m'aider 💙