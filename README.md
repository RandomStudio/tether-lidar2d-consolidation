# Tether agent TypeScript / NodeJS template

This is a TypeScript template for Tether Agents.

[Degit](https://github.com/Rich-Harris/degit) could be useful for copying this template, but since it cannot work with private repositories yet (https://github.com/Rich-Harris/degit#not-supported), you might just want to copy this folder somewhere for now, e.g. from the monorepo root:

```
cp -r templates/nodejs_typescript ~/repos
```

Recommended next steps:

- rename the directory you created, if necessary
- `cd` into the directory and run `git init` to make a new git repo for your project
- `npm i --registry https://registry.tether-io.dev` (assumes you have logged in to the private registry)

Test with:

```
npm run dev
```

You will need a RabbitMQ server and a Director running for things to work 100%.

See more information on developing Agents at [Developing your own Agent](../../README.md#developing-your-own-agent)
