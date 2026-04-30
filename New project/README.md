# VitalTrack

A static prototype for an all-in-one healthy living tracker covering nutrition, training, wearable biomarkers, and weekly recommendations.

## Run locally

From this folder:

```powershell
python -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Notes

- Entries are stored in `localStorage`, so the prototype keeps demo data between refreshes.
- Apple Health export import is supported by selecting an unzipped `export.xml` file. The file is parsed locally in the browser and is not uploaded by this static app.
- Live wearable sync needs native HealthKit support for Apple Health, Health Connect permissions on Android, and OAuth/API approval plus a backend for providers such as Garmin and Fitbit.
- Nutrition and supplement content is educational and should be reviewed by a qualified clinician or registered dietitian before being used as personalized medical advice.
