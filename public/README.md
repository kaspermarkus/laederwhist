## Læderwhist ##

Program til at holde styr på din whist klubs spil.. Hold styr på jeres spil, tast jeres spil ind i Læderwhist og lad den holde regnskab og vise statestik.

## Instruktioner ##

Kræver PHP 5.0 og ellers en hvilken som helst webserver.

1. Peg din webserver så den har root på `/public` folderen (da brugere ikke skal have adgang til `/data` folderen).
2. Kopier eller omdøb `/data/clubs_template.json` til `/data/clubs.json` og ret indholdet til
3. Kopier `data/myclubname_template.json` til at have det samme navn som du har skrevet i key under `clubs.json` - i template eksemplet er der to klubber - navnligt `myclubname` og `otherclubname`. I så fald ville du skulle lave to kopier af `data/myclubname_template.json` ved navn: `data/myclubname.json` og `data/otherclubname.json`.
4. Start din server og brug programmet

