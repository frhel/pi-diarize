# Unreleased. There is no runnable code yet.

# pi-diarize

A Pi extension that can turn audio files into a Markdown transcript with speaker turns.
Diarization is the point: the transcript is meant to be read, and you can see who said what. It is
on by default, but can be turned off.

Status: v0.1 — spec agreed, no runnable code yet. The spec is `docs/spec.md`; the code is being
written.

## What it does not do

- **Whole files only.** No chunking. 2 GB is the ceiling, and anything past it is refused before
  upload.
- **No streaming.** A file on disk, start to finish.
- **Deepgram only.** One provider, one key.
- **Markdown and the raw JSON beside it.** No plain text, no SRT, no VTT.

Two failures cost money rather than time, so they are worth knowing before the first upload. There
is no duration probe: a long file can pass the size check, upload, and then hit Deepgram's
ten-minute processing ceiling as a `504`. There is no retry: a `429` or a `5xx` comes back as an
error, and running it again bills again.

## The output

The format, not a real recording:

```markdown
- **Source:** meeting-2026-03-04.m4a
- **Model:** nova-3
- **Language:** en
- **Duration:** 41m 12s
- **Speakers detected:** 3
- **Run:** 2026-11-06T19:41:02Z

**Speaker 1:** We should start with the numbers from last quarter.
**Speaker 2:** They're in the shared drive, but they're a week old.
**Speaker 1:** Then they're the wrong numbers. Send me the live ones.
```

A `transcription-<name>.json` sits beside every transcript: the Deepgram response exactly as it
arrived, so the Markdown can be rebuilt without paying for another call.

## Before you point it at a recording

The audio file is uploaded whole to Deepgram. It leaves your machine, and what happens to it there
is Deepgram's policy, not this tool's. The API key is read from `.env` in the working directory;
no key is ever written into the repository or into a transcript.

    cp .env.example .env

The example explains each variable.

## Security

Private reporting through GitHub, or `security@o1.is` if you would rather not use GitHub. See
`SECURITY.md`.

## License

MIT. See `LICENSE`.
