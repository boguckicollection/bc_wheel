# bc_wheel

Prosty overlay HTML/CSS/JS prezentujący koło losujące gratisy na streamie. Domyślne pola to: **BOOSTER**, **KARTA**, **KOSZULKI**, **PUSZKA**, **PRZYPINKA**.

## Użycie
1. Dodaj plik `index.html` jako **Browser Source** w OBS i uruchom go tam – ta instancja będzie widoczna na streamie.
2. Naciśnij **Kręć!** albo wywołaj funkcję `onChatCommand('!spin')`, aby obrócić koło.
3. Nazwy pól można modyfikować w panelu edycji w lewym dolnym rogu. Zmiany zapisywane są w `localStorage`.
4. Wylosowanie pola **BOOSTER** wywołuje konfetti i dźwięk `booster-fanfare.mp3`.
5. Dźwięk `tshirt-win.mp3` odtwarzany jest przy polu **KOSZULKI**. Plik `spin.mp3` służy jako odgłos samego kręcenia – możesz podmienić go na własny.
6. Interfejs pozbawiony jest teraz lampek dekoracyjnych, a przycisk **Kręć!** znajduje się na dole i ma większy rozmiar.

Bot czatowy powinien po wykryciu komendy na czacie wywołać funkcję `onChatCommand` z odpowiednim argumentem.
