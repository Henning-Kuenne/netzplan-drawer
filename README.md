# Netzplan Drawer

## Features
- Bewegbare Knoten
- Automatisches berechnen von FAZ, FEZ, SAZ, SEZ, GP, FP
- Markieren des kritischen Pfads in rot

## Beispiel
![](screenshot.png?raw=True)

```
Schulungskonzept erstellen||2,10|5
Seminarplan erstellen|1|3,5|2
Seminarraum buchen|2|4|1
Seminarraum herrichten|3|8|1
Referenten auswählen|2|6|3
Schulungsunterlagen erstellen|5|7|7
Schulungsunterlagen drucken|6|8|2
Schulung durchführen|4,7,11|9|5
Schulung evaluieren|8||1
Teilnehmer auswählen|1|11|1
Teilnehmer einladen|10|8|10
```

Aufbau der Zeilen ist wie folgt:
|Vorgangsbeschreibung|Vorgänger|Nachfolger|Zeit|
|--|--|--|--|
|Eine Beschreibung des Vorgangs|Vorgänger getrennt mit einem `,`. Leer wenn keine vorhanden|Nachfolger getrennt mit einem `,`. Leer wenn keine vorhanden.|Benötigte Zeit für den Vorgang.

Die verschiedenen Punkte sind jeweils mit `|` voneinander getrennt. Pro Zeile in dem Textfeld kommt ein weiterer Knoten.

## Lizenz
[MIT License](https://opensource.org/licenses/MIT)
