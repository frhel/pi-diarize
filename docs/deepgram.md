# Deepgram — pre-recorded audio, feature reference

Copied 2026-11-09 from Deepgram's pre-recorded audio feature documentation and its speaker
diarization page, so the options and their defaults can be read without a network round-trip. Each
section names the page it came from where it is not the feature reference. Which of these options
this project sends is a decision recorded in `decision_log.md`, not a fact about the service.

Transcription features work with audio input. Selection varies between pre-recorded and live audio
requests.

## Transcription

### Smart Format

`smart_format=true`

Smart Format improves readability by applying additional formatting. When enabled, punctuation and
paragraph breaks will be applied as well as formatting of other entities, such as dates, times, and
numbers.

### Keyterm Prompting

`keyterm=TERM_OR_PHRASE`

Boosts recognition of important words or phrases, like names, product terms, or jargon. The model
pays extra attention to these; you can include up to 100 keyterms per request.

### Diarization

`diarize_model=latest`

Indicates whether to recognize speaker changes.

Source: <https://developers.deepgram.com/docs/diarization>

#### Diarization models

Deepgram offers versioned diarization models. Use the `diarize_model` parameter to select a
specific version:

| Value    | Batch                                                   | Streaming                                                   |
| -------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| `latest` | Resolves to the latest GA batch diarizer (currently v2) | Resolves to the latest GA streaming diarizer (currently v1) |
| `v2`     | Pins to the v2 diarizer                                 | Not supported — returns a validation error                  |
| `v1`     | Pins to the v1 diarizer                                 | Pins to the v1 streaming diarizer                           |

Specifying `diarize_model` both enables diarization **and** selects the model version. You do not
need to also set `diarize=true`.

#### Choosing a model

- **New integrations**: use `diarize_model=latest` to always get the newest available diarizer.
- **Pin a specific version**: use `diarize_model=v1` or `diarize_model=v2` (batch only).
- **Streaming**: use `diarize_model=latest` or `diarize_model=v1`. The v2 diarizer is not available
  for streaming and returns a validation error.

#### Enable feature

Using `diarize_model` (recommended):

```bash
curl \
  --request POST \
  --header 'Authorization: Token YOUR_DEEPGRAM_API_KEY' \
  --header 'Content-Type: audio/wav' \
  --data-binary @youraudio.wav \
  --url 'https://api.deepgram.com/v1/listen?diarize_model=latest'
```

The boolean `diarize` parameter is deprecated. It continues to work and always routes to the v1
diarizer; use `diarize_model` instead for both batch and streaming requests.

Self-hosted deployments: `diarize=true` is pinned to the v1 batch diarizer. Deployments
provisioned at the May 2026 release (`release-260514`) or later receive only the v2 batch diarizer
model by default, so `diarize=true` on those returns a successful response **without** `speaker`
labels. To produce diarized output there, specify `diarize_model=v2` or `diarize_model=latest`.

#### Versioning behavior

Don't set both `diarize` and `diarize_model` — requests that set both are rejected.

#### Model compatibility

Diarization is compatible with all Nova batch models (Nova-1, Nova-2, Nova-3) as well as enhanced
and base. Whisper is not supported.

#### Response: pre-recorded

Both `speaker` and `speaker_confidence` values are returned on every word:

```json
"alternatives": [
  {
    "words": [
      {
        "word": "hello",
        "start": 15.259043,
        "end": 15.338787,
        "confidence": 0.9721591,
        "speaker": 0,
        "speaker_confidence": 0.5853265
      }
    ]
  }
]
```

Live streaming returns `speaker` only, without `speaker_confidence`.

#### Diarizer model metadata

When a diarizer runs, the response `metadata` includes a `diarize_info` object identifying the
diarizer build that produced the labels, alongside `model_info`:

```json
"metadata": {
  "models": ["30089e05-99d1-4376-b32e-c263170674af"],
  "model_info": {
    "30089e05-99d1-4376-b32e-c263170674af": {
      "name": "2-general-nova",
      "version": "2024-01-09.29447",
      "arch": "nova-2"
    }
  },
  "diarize_info": {
    "model_uuid": "9a1c8b3e-2f44-4c8a-b1d0-example0000",
    "arch": "v2"
  }
}
```

- `model_uuid` — the UUID of the diarizer build that ran.
- `arch` — the diarizer architecture family (`v1` or `v2`) that `diarize_model` resolved to, which
  makes the `latest` resolution visible. Legacy `diarize=true` requests report `v1`.

`diarize_info` is present only when a diarizer actually ran:

| Request                                                                      | `diarize_info`                            |
| ---------------------------------------------------------------------------- | ----------------------------------------- |
| `diarize_model=v1`, `v2` (batch only), or `latest`                           | Present; `arch` shows the resolved family |
| `diarize=true` (deprecated)                                                  | Present; `arch: "v1"`                     |
| No diarization requested                                                     | Absent                                    |
| Requested but no diarizer model available (e.g. self-hosted v2-only, `diarize=true`) | Absent                             |

`diarize_info` is either present with both fields or absent entirely — never `null` or `{}`. An
absent block on a request that asked for diarization means the diarizer did not run, which is how
to distinguish a missing diarizer from single-speaker audio.

#### Formatting a diarized transcript

Turning on `punctuate` and `utterances` and reading the utterance list gives one line per turn:

```bash
curl \
  --request POST \
  --url 'https://api.deepgram.com/v1/listen?diarize_model=latest&punctuate=true&utterances=true' \
  --header 'Authorization: Token YOUR_DEEPGRAM_API_KEY' \
  --header 'content-type: audio/mp3' \
  --data-binary @Premier_broken-phone_numbers.mp3 \
  | jq -r ".results.utterances[] | \"[Speaker:\(.speaker)] \(.transcript)\""
```

```text
[Speaker:0] Hello, and thank you for calling premier phone service. Please be aware that this call may be recorded for quality and training purposes.
[Speaker:0] My name is Beth, and I will be assisting you today. How are you doing?
[Speaker:1] Not too bad. How are you today?
[Speaker:0] I'm doing well. Thank you. May I please have your name?
[Speaker:1] My name is Blake...
```

See also: [When to Use the Multichannel and Diarization Features](https://developers.deepgram.com/docs/multichannel-vs-diarization).

### Punctuation

`punctuate=false`

Indicates whether to add punctuation and capitalization to the transcript.

### Paragraphs

`paragraphs=false`

Indicates whether Deepgram will split audio into paragraphs to improve transcript readability. When
paragraphs is set to `true`, punctuate will also be set to `true`.

### Utterances

`utterances=false`

Segments speech into meaningful semantic units. By default, when utterances is enabled, it starts a
new utterance after 0.8s of silence. You can customize the length of time used to determine where
to split utterances with the `utt_split` parameter.

### Profanity Filter

`profanity_filter=false`

Indicates whether to remove profanity from the transcript.

### Redaction

`redact=OPTION`

Indicates whether to redact sensitive information, replacing redacted content with entity tags.

### Find and Replace

`replace=FIND%3AREPLACE`

Terms or phrases to search for in the submitted audio and replace. The Find value must be lowercase
and will match words from the word field. The Replace value can be any case.

### Search

`search=TERM_OR_PHRASE`

Terms or phrases to search for in the submitted audio. Deepgram searches for acoustic patterns in
audio rather than text patterns in transcripts because we have noticed that acoustic pattern
matching is more performant.

### Keywords

`keywords=KEYWORD%3AINTENSIFIER`

Keywords to which the model should pay particular attention to boosting or suppressing to help it
understand context. Intensifier indicates how much you want to boost it. The default Intensifier is
one (1). An Intensifier of two (2) equates to two boosts multiplied in a row, whereas zero (0) is
equivalent to not specifying a keywords parameter at all.

This feature is not available for the model Nova 3.

### Filler Words

`filler_words=false`

Indicates whether Deepgram will transcribe disfluencies in your audio, like "uh" and "um".

### Numerals

`numerals=false`

Converts numbers from written format to numerical format (e.g., "nine hundred" becomes "900").

## Audio Intelligence

Audio Intelligence features are powered by task-specific language models. When an Audio
Intelligence feature is enabled, Punctuation will also be enabled by default.

### Summarization

`summarize=false`

Indicates whether Deepgram will provide summaries for sections of content.

### Topic Detection

`topics=false`

Indicates whether Deepgram will identify and extract key topics for sections of content.

### Intent Recognition

`intents=false`

Indicates whether Deepgram will recognize intents.

### Entity Detection

`detect_entities=false`

Indicates whether Deepgram will identify and extract key entities for sections of content.

### Sentiment

`sentiment=false`

Identifies sentiment of positive, neutral, or negative, in addition to a sentiment score. Provides
sentiment on the word level, as well as for sentences, paragraphs and segments.
