# Security

## Reporting a vulnerability

Use GitHub's private reporting form: **Security** tab, then **Report a vulnerability**. It reaches
the maintainer and nobody else. `security@o1.is` works too, if you would rather not use GitHub.

Please do not open a public issue for a vulnerability, and do not send a pull request that spells
out the hole before a fix exists. Either one publishes the problem before there is anything to do
about it.

Say what you did, what happened, and what you expected instead — a short reproduction beats a long
explanation. If you are reporting a leaked credential, say where you saw it and not the value
itself.

There is no bug bounty. You will get an answer as fast as one person can manage, and credit in the
fix commit if you want it.

## Scope

The code and the information in this repository. Not Deepgram's service, not Pi itself, not your
local configuration, and not a transcript that ended up somewhere public.

## What is in this repository

No credentials, and none in its history. Transcripts and audio are gitignored. The only credential
the extension reads is `<agent-dir>/diarize-auth.json`, outside this repository and mode `0600`,
written by `/diarize login`; `DEEPGRAM_API_KEY` in the environment wins where it is set. The key is
never written into a transcript, a log, or an error message, and no project-local file is read for
it.
