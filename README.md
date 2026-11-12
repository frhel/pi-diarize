# Unreleased. There is no runnable code yet.

# pi-diarize
_updated 2026-11-12_

A Pi extension that can turn audio files into a Markdown transcript with speaker turns.
Diarization is the point: the transcript is meant to be read, and you can see who said what. It is
on by default, but can be turned off.

Status: v0.1 — spec agreed, no runnable code yet. The spec is `docs/spec.md`; the code is being
written.

## Limitations

- **Whole files only.** No chunking, for now. 2 GB is the ceiling, and anything past it is refused before
  upload.
- **No streaming.** A file upload is a single call to Deepgram's pre-recorded endpoint.
- **Deepgram only.** One provider, one key. More providers may be added later.
- **Markdown and the raw JSON beside it.** No plain text, no SRT, no VTT.
- **No duration probe.** A long file can pass the size check, upload, and then hit Deepgram's
	ten-minute processing ceiling as a `504`. There is no retry: a `429` or a `5xx` comes back as an
	error, and running it again bills again. Suggest that the user split the file and run it again.
	This is more likely to happen with video files than with audio.

## The output

The format, not a real recording:

```markdown
- **Source:** meeting-2026-03-04.m4a
- **Model:** nova-3
- **Language:** en
- **Duration:** 41m 12s
- **Speakers detected:** 3
- **Run:** 2026-11-06T19:41:02Z
- **Speakers:** Wanda, Vision, Thanos

**Wanda[Speaker 1]:** Thanos is coming, we have to get you out of here.
**Vision[Speaker 2]:** I know, but I can't just leave everyone behind. We have to fight!
**Thanos[Speaker 3]:** Knock, knock.
**Wanda[Speaker 1]:** Who's there?
**Thanos[Speaker 3]:** The end.
**Vision[Speaker 2]:** The end, who?
**Thanos[Speaker 3]:** The end of the world as we know it, and I feel fine.
```

A `transcription-<name>.json` sits beside every transcript: the Deepgram response exactly as it
arrived, so the Markdown can be rebuilt without paying for another call.

## Before you point it at a recording

The audio file is uploaded whole to Deepgram. It leaves your machine, and what happens to it there
is Deepgram's policy, not this tool's.

The key is asked for once:

    /diarize login

It is written to `<agent-dir>/diarize-auth.json`, beside Pi's own `auth.json`, with permissions
`0600`, and it is not read from the repository. Where `DEEPGRAM_API_KEY` is set in the environment
that takes precedence, for CI or a machine whose key already lives there.

No key is ever written into the repository or into a transcript. The other settings — model,
language, and whether speakers are labelled — ship as defaults in `settings.json` inside the
package, and `PI_DIARIZE_MODEL`, `PI_DIARIZE_LANGUAGE` or `PI_DIARIZE_DIARIZE_OUTPUT` override any
of them.

## License

The code is MIT. See `LICENSE`.

The two clips in `test/fixtures/` are CC BY 4.0, taken from the EMRAI synthetic
diarization corpus; the citation they require is in `test/fixtures/README.md`.
