# TwiMedia Wizard

Twitter media donwloader.

You need [Deno](https://deno.land/manual@v1.29.1/getting_started/installation) to use.

## Deno installation

- macOS or Linux

```bash
curl -fsSL https://deno.land/x/install/install.sh | sh
```

- Windows
```
scoop install deno
```

# Usage

Clone repository

```bash
git clone https://github.com/p1atdev/twimedia-wizard.git
cd twimedia-wizard
```

## Basic usage

```bash
deno task start TWITTER_USER_ID
```

## Help

```bash
deno task start --help
```
`--help` or `-h`

## Max count

```bash
deno task start TWITTER_USER_ID --max 50
```

`--max` or `-m`

## Output dir

```bash
deno task start TWITTER_USER_ID --output ./output
```

`--output` or `-o`