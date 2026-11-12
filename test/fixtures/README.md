# Test fixtures

Two clips of the same three-person conversation, 15 s and 60 s, mono 16 kHz
16-bit WAV. They exist so the transcription path can be exercised against audio
whose speakers are known in advance.

## Provenance

Cut from one recording in the EMRAI synthetic diarization corpus:

- Source: `librispeech3/dev_clean/wavs/5338-24640.1993-147965.2086-149214.wav`
  — <https://github.com/EMRAI/emrai-synthetic-diarization-corpus>
- Ground truth: `librispeech3/dev_clean/rttm/5338-24640.1993-147965.2086-149214.rttm`
  (same corpus, standard RTTM speaker turns)
- `three-speakers-60s.wav` — source seconds 65.31–125.31
- `three-speakers-15s.wav` — source seconds 96.87–111.87, a window *inside* the
  60 s clip, so its expected transcript is a slice of the longer one's.

Speech per speaker, per the RTTM, inside each committed clip:

| clip | speaker 1 | speaker 2 | speaker 3 |
| --- | --- | --- | --- |
| `three-speakers-15s.wav` | 3.2 s | 7.1 s | 3.3 s |
| `three-speakers-60s.wav` | 15.8 s | 15.8 s | 20.7 s |

Windows were chosen to start on a turn boundary, and the 15 s one to be the
window inside the 60 s clip where its least-talkative speaker gets the most
speech.

## Licence

The corpus is CC BY 4.0 and requires this reference:

> Edwards, E., Brenndoerfer, M., Robinson, A., Sadoughi, N., Finley, G. P.,
> Korenevsky, M., Axtmann, N. & Suendermann-Oeft, D. (2018, September). A Free
> Synthetic Corpus for Speaker Diarization Research. In International Conference
> on Speech and Computer (pp. 113-122). Springer, Cham.

## What these clips do not test

The corpus is LibriSpeech readers spliced together, so the turns never overlap:
no crosstalk, no interruptions, no noisy room. A diarizer that fails here fails
badly; one that passes here is not thereby proven on a real meeting.
