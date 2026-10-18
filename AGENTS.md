# Architecture rules

- Daily educational generation uses the existing authenticated cron callback and persisted per-article/per-batch checkpoints; preserve its unmanaged caller authentication because this project lacks managed HTTP scheduling support.
- Daily question batches and complete practice simulations are committed together by a service-role-only database function, with stable generation keys preventing duplicate inserts after interrupted requests.
- Public tutorial pages expose generated articles with leaf metadata and crawlable links; content must not present generated chapter references as verified official curricula.
- The simulations parent renders its listing only at its exact URL and an Outlet for child simulations, so deep links render the actual practice session.