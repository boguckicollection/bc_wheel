# bc_wheel

Prosty overlay HTML/CSS/JS przedstawiający koło z 5 polami do użycia na streamie.

## Użycie
1. Otwórz `index.html` w obsługiwanym przez OBS przeglądarce.
2. Za pomocą przycisku **Kręć!** lub wywołując funkcję `onChatCommand('!spin')` rozpocznij losowanie.
3. Pola koła można edytować w panelu w lewym dolnym rogu.
4. Jeżeli wylosowane zostanie pole `booste`, pojawi się konfetti.
5. Do pliku `spin.mp3` dodaj własny efekt dźwiękowy.

Integrację z czatem YouTube należy zrealizować po stronie bota wywołującego funkcję `onChatCommand` po wykryciu komendy na czacie.
