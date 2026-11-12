# pi-diarize — spec

Status: v0.1, drafted 2026-11-06. Amended 2026-11-07: the build order is now a list of
capabilities, not files; diarization is optional and on by default; the environment variables are
provider-agnostic (see `decision_log.md`, which holds the decisions as they stand, not their
history). The fence and the two limits lists still wait for the post-measurement pass.

Project name is **pi-diarize**. The directory it lives in is still `pi-audio-trans/` and will be
renamed later; nothing in the code depends on the directory name.

## What this is

A Pi extension that turns one audio file into a Markdown transcript with speaker turns using a user-supplied API. At the moment, DeepGram is the only option. Diarization is on by default and can be turned off (`DIARIZE_OUTPUT`, amended 2026-11-07); with it off the turns are still there, unattributed.

Four pieces:

- **`transcribe_audio`** (tool) — takes a path and an optional `language` override, uploads the
  whole file to Deepgram's pre-recorded endpoint, receives JSON, assembles Markdown, places it at
  the output path. The override is for one call only; it never writes back to `settings.json`.
- **`rename_speakers`** (tool) — takes a transcript path and a list of names, deterministically rewrites speaker labels to a given list of names.
- **`transcribe-audio`** (skill) — the agent-facing instructions: when to use the tool, what to ask
  the user, what the two hard limits are, and the two-phase review flow.
- **`/diarize login`** (command) — asks for the API key with the input hidden and writes it to
  `<agent-dir>/diarize-auth.json` beside `auth.json`. It stores that one key and nothing else.

### The flow

1. The user names an audio file. The skill confirms it exists, is audio, and is under 2 GB.
2. `transcribe_audio` uploads it whole. Diarization is on by default (`diarize_model=latest`),
   along with `utterances=true` and `smart_format=true`, model `nova-3` by default. With
   `DIARIZE_OUTPUT=false` the `diarize_model` parameter is omitted — there is no `diarize=false` to
   send — and `utterances` still supplies the turns, unchecked.
3. The raw response is written verbatim to `<output>.json` — by default
   `./transcriptions/transcription-<name>.json` — and it stays there.
4. The Markdown is assembled from that saved file, staged inside
   `.scratch/<name>-<timestamp>/`, then moved to `<output>.md`.
5. The scratch directory is removed once the Markdown is in place. A formatting failure leaves the
   JSON untouched and the error names it — the API call already finished and is never repeated.
6. The user reads the file. If it is diarized, the skill then asks who Speaker 1, Speaker 2, …
   actually are.
7. `rename_speakers` rewrites the labels in place and the agent reports the new path. Without
   diarization there is nothing to rewrite, and the tool says so.

### The transcript

Markdown, for both humans and agents. A short metadata block as a plain list — source file, model, language, duration, speakers detected, diarizer version, run timestamp — followed by turns. The speaker count and the diarizer version appear only when diarization is on; with it off the metadata block says so rather than reporting a count of nobody.

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

No YAML frontmatter: this file is read by people and by `grep`, not parsed. Beside it in the output
directory, same basename, sits `transcription-<name>.json`: the Deepgram response exactly as received,never re-serialised, so the Markdown can be rebuilt from it without another API call.

## The fence

In Scope:

- one audio file on local disk, ≤ 2 GB, passed as a path;
- Diarized transcription via Deepgram, model `nova-3` by default, language `en` by default and
  overridable per call;
- Markdown output, default directory `./transcriptions/`;
- the raw JSON kept beside every transcript, same basename;
- speaker names applied after review;
- defaults for every tool option bundled in `settings.json`, overridden by `PI_DIARIZE_*`
  environment variables;
- an API key stored in `<agent-dir>/diarize-auth.json`, written by `/diarize login`, with
  `DEEPGRAM_API_KEY` in the environment taking precedence where it is set.

Out of Scope:

- streaming and realtime audio;
- any provider other than Deepgram;
- URLs, remote paths, directories, and batches of files;
- subtitle formats (SRT, VTT), translations, summaries, sentiment;

Planned:

- CI, and dependency scanning beyond npm.
- chunking, splitting, silence detection;
- `ffmpeg` and `ffprobe`, in any form;


## Build order

What gets built, in dependency order. Not a layout: this is a prototype until there is a reason
for it to stop being one, and naming modules before they exist turns a guess into a requirement.

1. Configuration — the API key from `<agent-dir>/diarize-auth.json`, written by `/diarize login`,
   or from `DEEPGRAM_API_KEY` where that is set, and the three options with their defaults from the
   bundled `settings.json`.
2. The Deepgram request — whole-file upload, the fixed parameter set, and types for the response.
3. The Markdown renderer — utterances and metadata to a document, from a saved JSON response.
4. The label rewriter — `Speaker N` prefixes in place, prefix-safe, no network.
5. The extension entry — both tools registered, and the `session_start` check that disables them
   when the key is missing.
6. The skill — when to use the tool, what to ask the user, the two-phase review flow.
7. The public shell — `docs/`, `AGENTS.md`, `GLOSSARY.md`, `SECURITY.md`, `LICENSE`, `README.md`.

One step per instruction. No scaffold and no file is created without an explicit instruction naming
the file and what goes in it; the agent writes what it was given, shows the diff, and stops.

## Done when

- One real three-speaker recording produces a Markdown file at the default path, with every turn
  attributed and readable.
- The same recording, with names supplied after review, ends up with the names in place and no
  `Speaker N` labels left.
- `.scratch/` is empty after a successful run, and after any failed run in which Deepgram returned
  nothing.
- Every run that reached the API leaves two files at the output path: the `.md` and the `.json` it
  was rendered from.
- A missing key produces a tool error the agent can read and act on, not a stack trace.
- No key ever appears in tool output, `details`, logs, or the transcript.
- A file over 2 GB, and a non-audio file, are both refused before any upload.

## Knowingly broken

- **No duration probe.** Without `ffprobe` we cannot know how long a file is before uploading, so
  the 2 GB ceiling is the only pre-flight limit. A 1.9 GB, 14-hour recording passes our check and
  then hits Deepgram's 10-minute processing ceiling as a `504`. The error says so.
- **No retry policy.** A `429` or `5xx` surfaces as an error with Deepgram's message; the user
  decides whether to run it again, paying twice.
- **No plain text and no subtitles.** Markdown plus the verbatim JSON, nothing else. Timestamps live
  in the body only as the metadata block's duration, even though every word in the JSON carries them.

## Deferred, with the reason

- **Chunking.** Needs `ffmpeg` and `ffprobe` as local dependencies, and the story for scanning
  non-npm, vendored artifacts does not exist yet. Until it does, the file-size ceiling is the
  honest answer.
- **Dependency scanning that covers non-npm artifacts.** `npm sbom` and `npm audit` see npm packages
  only. Named here so the gap is on the record, not wired up.
- **Multiple providers.** One service means one function. A call-preparation layer for several
  services would be speculation until a second one exists.
- **Subtitles, translations, summaries.** All of them are a second product with the transcript as
  input, and all of them need decisions about accuracy that we have not made.
- **CI.** Nothing to run until there is something to check; the dependency story above is the
  blocker.
