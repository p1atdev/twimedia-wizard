# TwiMedia Wizard

[![Deno Testing](https://github.com/p1atdev/twimedia-wizard/actions/workflows/testing.yaml/badge.svg)](https://github.com/p1atdev/twimedia-wizard/actions/workflows/testing.yaml)
![deno compatibility](https://shield.deno.dev/deno/^1.29)
[![codecov](https://codecov.io/gh/p1atdev/twimedia-wizard/branch/main/graph/badge.svg?token=o5kZFwUUCM)](https://codecov.io/gh/p1atdev/twimedia-wizard)


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

Clone repository and build

```bash
git clone https://github.com/p1atdev/twimedia-wizard.git
cd twimedia-wizard
deno task build
```

then `twimedia.exe` (or `twimedia`) will be generated to project root.

## Help

```bash
twimedia --help
```
`--help` or `-h`

## User

Specifying user to download.

```bash
twimedia user TWITTER_USER_ID --max 50
```

- -h, --help              - Show this help.
- -o, --output  <path>    - Output path.
- -m, --max     <number>  - Maximum number of media to download. Default is 5000

## Search

Specifying search query to search and download.

```bash
twimedia search SEARCH_QUERY
```

- -h, --help              - Show this help.
- -o, --output  <path>    - Output path.
- -m, --max     <number>  - Maximum number of media to download. Default is 5000
- -l, --latest            - Download media from Latest tweets. If not specified, it will download media from Top tweets.

# TODO

- [ ] Filtering with likes 