# Misinformation Detection

## Information Disorder Taxonomy (Wardle & Derakhshan, 2017)

Three categories replace the inadequate term "fake news":
- **Misinformation** — false information shared without intent to harm (e.g., relative resharing an outdated photo without realizing it)
- **Disinformation** — false information deliberately created to cause harm (e.g., state-sponsored influence campaigns, fabricated news sites)
- **Malinformation** — genuine information shared with intent to harm (e.g., leaked private emails, doxxing)

## Seven Types of Information Disorder

Ordered from low to high harmful intent:

1. **Satire/parody** — no harmful intent, but fools people when shared without context
2. **False connection** — clickbait where headlines don't match content
3. **Misleading content** — selective framing: cropped photos, cherry-picked statistics, data without context
4. **False context** — genuine content in misleading new setting (e.g., 2015 photo repackaged as 2018 event)
5. **Imposter content** — replicates logos and formatting of credible outlets (e.g., fake BBC-branded videos)
6. **Manipulated content** — genuine material altered through editing, slowing, Photoshopping
7. **Fabricated content** — entirely invented, including deepfakes and professional-looking fake news sites

## Detecting Manipulated Media

### Visual Red Flags for Deepfakes/Doctored Images
- Inconsistent lighting and shadows
- Blurry or warped facial features (especially eyes, lips, hairlines)
- Unnatural skin texture
- Lip movements not matching audio
- Glare anomalies on glasses

### Verification Tools
- **Reverse image search** (Google Images, TinEye, Yandex) — reveals where an image appeared before and in what original context
- **InVID/WeVerify Verification Plugin** (AFP Medialab) — fragments videos into keyframes for reverse search, applies forensic filters for tampering detection, includes experimental deepfake detection (~70–90% accuracy)

## Recognizing Astroturfing & Coordinated Inauthentic Behavior

Astroturfing creates false impression of grassroots support via paid advocates, bot networks, and persona management software.

**Red flags:**
- Identical or near-identical comments across platforms
- Sudden synchronized activity spikes
- Newly created accounts with no organic history
- Activity concentrated during "office hours"

**Scale:** Schoch et al. (2022, *Scientific Reports*) found 74% of accounts in known astroturfing campaigns engaged in coordinated co-tweeting/co-retweeting. EPFL reported 20% of global Twitter trends in 2019 were fake.

**Detection tools:** Botometer (Indiana University) for bot-like behavior analysis; Gephi and NodeXL for network/cluster mapping.

## Unreliable Source Indicators

Increase scrutiny immediately if a source exhibits:
- No byline or author information
- No "About Us" page
- Domain spoofing (`.com.co`, misspelled legitimate domains)
- Excessive emotional language and capitalization
- No citations or source links
- No publication date
- Headline doesn't match article content
- No corrections policy
- Single-perspective presentation with no acknowledgment of alternatives

## Fact-Checking Organizations

| Organization | Focus | Note |
|---|---|---|
| **Snopes** (1994) | General debunking | One of the oldest fact-checking sites |
| **PolitiFact** | Political claims | Pulitzer Prize-winning, six-point Truth-O-Meter |
| **FactCheck.org** | Political claims | Annenberg Public Policy Center (UPenn) |
| **Science Feedback** | Scientific claims | Fact-checkers hold PhDs, publish in peer-reviewed journals |

Harvard Kennedy School analysis of 22,000+ fact-checking articles: when Snopes and PolitiFact checked the same claim, they produced **only one conflicting verdict**.
