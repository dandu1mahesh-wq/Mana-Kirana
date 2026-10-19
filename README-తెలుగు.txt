MANA KIRANA - ANDROID APK BUILD (తెలుగు)

ఈ ZIP లో React యాప్ సోర్స్ కోడ్ మరియు క్లౌడ్‌లో APK తయారు చేయడానికి GitHub Actions workflow ఉన్నాయి.
ఇది ఇప్పటికే తయారైన APK ఫైల్ కాదు. APK కోసం GitHub ద్వారా ఒకసారి cloud build చేయాలి.

Android ఫోన్‌లో చేయాల్సినవి:
1. GitHub.com లో ఖాతా సృష్టించండి / లాగిన్ అవ్వండి.
2. కొత్త repository సృష్టించండి. ఉదా: mana-kirana-android
3. ఈ ZIP ను extract చేసి అందులోని ఫైళ్లన్నింటినీ repository యొక్క main branch లో upload చేయండి.
   ముఖ్యంగా .github/workflows/build-apk.yml ഫയల్ upload అయిందని ഉറപ്പാക്കండి.
4. Repository → Actions → “Build Mana Kirana Android APK” workflow తెరవండి.
5. “Run workflow” నొక్కండి. లేదా main branch కు files push చేసినప్పుడు ఆటోమేటిక్‌గా run అవుతుంది.
6. Workflow పూర్తయ్యాక దాని run page లో Artifacts కింద “Mana-Kirana-debug-APK” download చేయండి.
7. ZIP artifact ను extract చేసి app-debug.apk ఫైల్‌ను Android ఫోన్‌లో తెరిచి install చేయండి.
   Android అడిగితే ఈ మూలం నుంచి app install చేయడానికి అనుమతి ఇవ్వాలి.

ముఖ్యమైన పరిమితులు:
- ఇది DEBUG APK; Play Store release కోసం signed release build వేరుగా చేయాలి.
- ప్రస్తుత డెమోలో data అదే browser/app storage లో ఉంటుంది. వేర్వేరు ఫోన్ల మధ్య order sync లేదు.
- UPI QR/UPI ID చూపడం చెల్లింపు ధృవీకరణ కాదు. డబ్బు వచ్చిందో మీ UPI/bank app లో స్వయంగా ధృవీకరించండి.
- Customer / owner / delivery role buttons నిజమైన login/security కావు. నిజమైన customers కు విడుదల చేసే ముందు backend, authentication, database rules, privacy notice మరియు payment verification జోడించాలి.
- మొదట test orders తో పరీక్షించండి; నిజమైన customer personal data ఉపయోగించవద్దు.
