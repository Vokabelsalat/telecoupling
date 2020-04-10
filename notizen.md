#Datenbeschaffung (dies könnte man auch im Paper beschreiben, inklusive der Interdisziplinären Zusammenarbeit)
- Instrumente werden geworgen -> ganze Instrumente -> Varianz über die Instrumente
- dann die Einzelteile selbt gewogen
	- die Frage ist, wo die größten Gewichtsvarianzen liegen
- davon könnten man zu den Honzelhändlern gehen, damit sie abschätzen können, wie viel Baummengen für die Instrumente/Teile benötigt sind



- Vor dem Anfragen jeglicher Datenbanken die Materialien gruppieren und darunter die Subparts auflisten
- Unterarten hole ich mir aus GBIF per /species/match/?genus=...
- Trade funktioniert auch nur mit dem Genus
    - ThreatSearch funktioniert genauso
    - SpeciesPlus ebenso
    - GBIF ebenso
- IUCN geht nicht mit Genus, deshalb fragen wir hier alle Unterarten und Synonyme an

Einzelarten:
wir suchen nur nach den SciNames, deshalb finden wir keine Doppelungen/Verwirrungen in den Synonymen der anderen Datenbanken

Wann nutzen wir die Synonyme?
    - für die Anfrage an IUCN, wenn wir nur einen Genus gegeben haben
    - und aus meiner zuvor erstellten Tabelle

Woher beziehen wir die Synonyme?
    - aus GBIF

Fragen:
Ist unser Vorgehen korrekt?
Wir suchen nach dem SciName, den wir haben, damit bekommen wir einen Key
Mit diesem Key suchen wir nach Synonymen und wir nehmen alle mit [["taxonomicStatus"] === "SYNONYM" || element["taxonomicStatus"] === "HOMOTYPIC_SYNONYM" && element["origin"] === "EX_AUTHOR_SYNONYM" oder
["taxonomicStatus"] === "HOMOTYPIC_SYNONYM" UND ["origin"] === "SOURCE"
Ist das so okay?
Worin liegt der Unterschied zwischen "SOURCE" und 

IUCN vllt mal anmailen






Species: 
    - Wir suchen bei GBIF nach dem Genus, lassen uns den Key geben
    - Fragen damit dann die Children an, filtern diese nach "taxonomicStatus" === "ACCEPTED", nehmen diese also als Children an
Listings: 
    - Außerdem schauen wir nach Genus in der SpeciesPlaus Datenbank und bekommen damit die Listings
Synonyme:
    


Wie schaffen wir ein Maß an Bedrohung für die Instrumenten und Instrumentengruppen zu definieren?
Die Menge der Instrumente sollte eine Rolle spielen, um eine relative Bedrohung auszudrücken.
Wir vereinfachen es, also betrachten nur eine Geige und ein Kontrabass in der Gruppe der Streicher
Wir ignorieren vielleicht auch die Gewichte und Relationen 
