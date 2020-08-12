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


Unterschied zwsichen legalem und illegalem Handel
wir sollten Filtern
Source -> "I"
Purpose und Source sollte nach "Commercial Use" gefiltert werden "T"
Kategorie "W" ist wild und bedroht deshalb vermutlich am ehesten die Art
Kategorie "A" ist künstlich angebaut und deshalb fast irrelevant
Kategorie "D" ist künstlich angebaut und deshalb fast irrelevant
Kategorie "O" ist vor der Listung, deshalb ist es auch 
Kategorie "Y" ähnlich wie "A"

Tiere:
D ist A für Tiere
C kommen für Tiere hinzu


- Farben zusammenfassen nach bedrohungen in 4 Kategorien
    + welche Farbskalen? 
- Cites als extra Zeile
- Lokale Assesements zusammenfassen?
    - verschiedene Modi für das Aggregieren anbieten -> Duchschnitt, Maximum, Minimum, maximale Abweichung

Stiffness / Modulus of Elsticity / Young's Modulus, Specific Gravity, Density sind die wichtigsten Holzeigenschaften



Die nomentklatur sagt uns, welche Hölzer eigentlich wirklich im Holzmarkt verfügbar sind, das sagt uns mehr über die tatsächlichen Alternativen zu Hölzern (was ist praktisch möglich oder nur theoretisch)
 -> wir könnten die Alternativen filtern, nach theoretischen oder praktischen Alternativen


Karte neben den lokalen Threats, um zu sehen welche Länder die regionalen Assesments gemacht haben
Die Bäume sollten noch leicht saturiert hinterlegt werden, um eine Einschätzung unserer Bedrohung darzustellen
Die Cites Leiste muss noch versteckt werden, wenn sie keine Einträge enthält
Schwarze Kästchen, um die Elemente der Legende herum einzeichnen
Die Farben und Bedrohungen sollten im besten Fall nicht gleichgesetzt werden mit der Einschätzung zu den Alternativen, da dies ein weiterer ausgelagerter Schritt ist



Projektgespräch mit Daniel:
Prozesse und Projekte der mitarbeitenden Firmen, werden digitalisiert
Interesse der Wirtschaft, an solch einem System?
Auch Partner außerhalb von Sachsen könnten teilnehmen
Silke hat schon gute Kontakte an der Hand, jedoch geht es dann um einen speziellen Fokus
Die Firmen haben bereits Kontakte zu Aufbauprojekten in Madagascar zum Schutz der Hölzer, jedoch haben diese auch riesige Holzlager, sodass die Nachfolgegenerationen eigentlich schon mit komplett gefüllten Lagern versorgt sind
Wir sollten vermutlich diesen Verein mit einbeziehen, welcher auch Mitglieder in Sachsen hat
Ein anderes Projekt mit Fokus auf BWL vom Fraunhofer, könnte Einblicke und Erkenntnisse aus dem Welthandel bieten
Ein Jahr könnte für mich als Finanzierung rumkommen, dies wäre dann Kostenneutral für die Partnerfirmen

Projektgespräch mit Focht, Daniel und Udo:
Politik?
Einfluss von Focht? Daniel scheint ein gutes Auge darauf zu haben
Zusammenarbeit mit Köln und Dänemark?
Der Hauptantragssteller sollte in Sachsen ansässig sein
Externe Projektpartner können auch von außen kommen            


Visualisierung:
Darstellung der Pies sollten eventuell als Stacked Bar Charts geändert werden
entweder Horizontal oder vertikal abtragen
Die Zeitleiste kann noch deutlich schmaler werden, dafür aber in der Höhe gewinnen, vielleicht tragen wir dort mehr ab
Sortierungen der Holzarten:
    Ranking anhand von Bedrohungsstati
Farbe oder Beginn des Balkens beim Highlighten hervorheben
Die Datenpunkte sind aktuell noch scheinbar zwischen den Jahren
Wie kommen wir an lokal regulierte Daten heran?
    lokale Holzeinschränkungen?



Horizontale Zentrierung der einzelnen Kästchen
Rand nur um das gesamte Konstrukt
Einschätzungen beim Zoomen anzeigen
Ermöglichen wir den Vergleich? 
    dieser ist in den Listungen und Assesments nicht so wichtig, wie beim Handel
Handel in einer Extra Darstellung
Sortierung anhand von Cites, dann IUCN
Logische Treenung von Listung und Handel

Bessere Darstellung der Handelsdaten?
    Vielleicht erlaubt man hier auch eine Art von Zoom

Verschiedene Zommstufen könnten auch verschiedene Farbskalen auslösen
    auch dies könnte bei der IUCN umgesetzt werden


Eventuell die verschiedenen Handelsarten getrennt nebeneinander aufzeigen
Karte für alles
und die Karte für die lokalen Assesments

Verknüpfung eines Instruments zu den Ursprungsorten und verwendeten Materialien


#Meeting mit Silke
Zusammenfassung der Species im Genus => HeatMap (in Zeitleiste UND Karte) und Icicle Plot (erstmal eine Sortierung)

Die Länder der lokalen Threats sollten wieder aufgeschlüsselt werden

Länder  Kategorie   Comment ("Reginal Status")  Criteria Used   Kürzel Interpretiert

HeatMap kann nciht nur für die Zusammenfassung in der Zeitleiste verwendet werden, sondenr auch auf einer Karte für einen ganzen Genus (auch die globalen Threats, da die Unterarten, ja nicht überall auf der Welt vorkommen)

#Meeting mit Daniel und Silke (30.07.)
Verschneiden der Geolocations eventuell in der Datenbank machen
=> Auf jeden Fall Vorberechnung

Species in der Zeitleist vielleicht nach Gegrafie aggregieren (6 Kontinente)