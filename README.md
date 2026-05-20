# Frontend - EventFlow

## Requirements:

- Runtime: `Bun` or Node. Compatible with Node 22+. Tested and built in Bun.
- React 19 with HMR as the default setup. TailwindCSS and ShadCN for UI elements. Default setup with bun's frontend templating setup.
- code-review-graph: If using AI agent to commit code, please ensure you have `code-review-graph` installed via `uv` (requires Python, can use MacOS or Linux' built in Python runtime). Refer to `code-review-graph` for how-to.


## Installation

1. Clone the repo and go to the code folder
2. Install dependencies with `bun install`.
3. Copy .env.example to .env with `cp .env.example .env` and replace the URL for API.
4. Run `bun run dev` to start the application.
