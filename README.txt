INTERNATIONAL PRIVATE SECURITY - SITE V5

STRUCTURA:
/
├── index.html                         Homepage
├── styles.css                         Stiluri comune
├── script.js                          Navigatie, mega-menu, animatii
├── assets/
│   └── ips-logo.png
│
├── solutii/
│   ├── supraveghere-video/
│   ├── alarma-efractie/
│   ├── avertizare-incendiu/
│   ├── control-acces/
│   └── automatizari-porti/
│
├── monitorizare/
│   └── index.html
│
└── interventie/
    └── index.html

NOUTATI V3:
- Homepage-ul V2 este pastrat ca prima pagina.
- Meniu SOLUTII transformat in mega-menu desktop.
- Pe mobil, SOLUTII devine accordion.
- 5 pagini dedicate pentru sistemele electronice.
- 2 pagini dedicate pentru serviciile operationale.
- Cardurile din homepage duc acum la paginile serviciilor.
- Monitorizare si Interventie au link-uri directe.
- Toate paginile folosesc acelasi stil IPS negru + auriu.
- Fiecare pagina are hero, text comercial, module, flux, aplicatii, integrare si CTA.
- Structura folderelor este pregatita pentru URL-uri curate pe viitor.

CUM TESTEZI:
1. Dezarhiveaza.
2. Poti deschide index.html direct.
3. Recomandat pentru testare:
   python -m http.server 8000
   apoi: http://localhost:8000

DE COMPLETAT ULTERIOR:
- Fotografii reale
- Video promo
- Telefon / email
- Numar obiective monitorizate
- Texte finale aprobate juridic/comercial
- Formular functional
- Politica de confidentialitate / cookies
- Domeniu si hosting


NOUTATI V4:
- Pagina Supraveghere video pune accent pe paza perimetrala video.
- Flux CCTV: detectie -> analiza -> alerta -> dispecerat -> verificare video -> interventie.
- Sectiune dedicata pentru paza perimetrala cu vizual de zona protejata / limita virtuala.
- Fara referinte la branduri sau tehnologii comerciale specifice.
- Pagina Avertizare incendiu pune accent pe integrarea cu dispeceratul IPS 24/7/365.
- Flux incendiu: detectie -> centrala -> dispecerat -> procedura -> pompieri / responsabil obiectiv.
- Sectiune dedicata pentru monitorizarea alarmelor de incendiu.


NOUTATI V5:
- Meniul mobil este acum un overlay opac real, separat de continutul paginii.
- Scroll-ul continutului din spatele meniului ramane blocat.
- CTA-ul "Descopera solutia" are spatiere mai mare fata de descriere pe mobil.
- Tranzitia dintre Acoperire si Despre noi a fost optimizata pentru mobil.
- Pe mobil, textul Despre noi apare inaintea siglei, iar sigla este redimensionata.
- Telefon oficial: +40 729 995 979.
- Email oficial: office@ipsecurity.ro.
- Telefonul si emailul sunt linkuri functionale tel:/mailto:.
- Au fost adaugate butoane rapide de contact pe mobil.

V5.2:
- Eliminat complet numarul echipajelor de interventie din statisticile publice.


V5.3:
- Integrate fotografiile furnizate pentru cele 5 categorii de solutii.
- Supraveghere video -> assets/supraveghere-video.png
- Efractie -> assets/alarma-efractie.png
- Avertizare incendiu -> assets/avertizare-incendiu.png
- Control acces -> assets/control-acces.png
- Automatizari porti -> assets/automatizari-porti.png
- Imaginile apar in hero-ul paginii dedicate, cu crop responsive si caption discret.
- Pe mobil imaginile sunt afisate sub textul principal al paginii.


V5.4:
- Adaugat favicon IPS pe toate paginile.
- Favicon-ul foloseste sigla completa, fara fundal.
- Incluse variante 16x16, 32x32, ICO, Apple Touch Icon si iconuri pentru telefon.


V5.5:
- Pagina Supraveghere video mentioneaza explicit atat sistemele CCTV clasice, cat si sistemele cu analiza video bazata pe AI.
- Adaugate exemple de functii AI: detectare persoane, vehicule, patrundere in zone protejate si traversarea limitelor virtuale.
- Pastrata integrarea cu dispeceratul IPS si interventia pentru paza perimetrala.


V5.6:
- Integrata a doua varianta Calm Night Patrol ca fundal audio ambiental.
- La prima vizita apare un dialog pentru pornirea muzicii sau continuarea fara sunet.
- Adaugat buton flotant pentru pornire/oprire pe toate paginile.
- Volum redus, loop continuu si fade-in/fade-out.
- Preferinta vizitatorului este memorata; pozitia piesei este pastrata intre paginile aceleiasi sesiuni.
- Nota: autoplay cu sunet este blocat de majoritatea browserelor pana la o interactiune a utilizatorului.


V5.7:
- Eliminata complet fereastra initiala pentru pornirea/oprirea muzicii.
- Adaugat buton PLAY mare, auriu si foarte vizibil, fix in coltul dreapta-jos.
- Cand muzica ruleaza, butonul devine PAUSE.
- Volumul fundalului a fost marit de la 14% la aproximativ 32%.
- Pozitia melodiei este pastrata in sesiune, iar site-ul incearca sa continue redarea dupa navigarea intre pagini.
- Site-ul nu opreste intentionat muzica atunci cand tab-ul browserului devine inactiv.


V5.8:
- Muzica este setata ON implicit si site-ul incearca sa o porneasca imediat la deschidere.
- Daca browserul blocheaza autoplay-ul cu sunet, muzica porneste la prima interactiune a vizitatorului, fara popup.
- Restaurat designul butonului audio din V5.6 (egalizator + MUZICA / PORNITA-OPRITA).
- Navigarea intre paginile interne este acum facuta fara reload complet al documentului.
- Acelasi element audio ramane activ cand se trece intre Supraveghere video, Efractie, Incendiu, Control acces, Automatizari, Monitorizare, Interventie si homepage.
- Astfel este eliminata pauza de aproximativ o secunda produsa anterior de reincarcarea fiecarei pagini.
- Sunt preincarcate in fundal paginile principale pentru navigare mai rapida.


V5.9:
- Corectie pentru intreruperea audio de ~1 secunda la schimbarea paginilor de servicii.
- Navigarea interna este interceptata acum in faza capture si foloseste o lista explicita a rutelor IPS.
- Browserul nu mai trebuie sa incarce un document HTML nou cand se trece intre serviciile site-ului; se inlocuieste doar continutul <main>.
- Elementul audio si playerul raman montate permanent, deci muzica trebuie sa continue fara pauza.
- Adaugat cache-busting ?v=5.9 pentru styles.css si script.js ca GitHub Pages / browserul sa nu mai foloseasca JavaScript-ul vechi din cache.
