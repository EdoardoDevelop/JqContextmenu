# Context Menu Plugin

Un plugin jQuery per creare menu contestuali personalizzabili che appaiono al click destro o al lungo tocco su un elemento.

## Funzionalità

* Crea un menu contestuale personalizzabile con elementi definiti dall'utente
* Supporta click destro e lungo tocco su dispositivi touch
* Opzioni per personalizzare la durata del lungo tocco e il contenuto del menu
* Richiede jQuery

## Utilizzo

1. Includi il plugin nel tuo progetto
2. Seleziona gli elementi che dovrebbero attivare il menu contestuale
3. Inizializza il plugin chiamando `$(selector).contextMenuPlugin(options)`

## Opzioni

* `getMenu`: funzione che restituisce gli elementi del menu
* `longPressDuration`: durata del lungo tocco in millisecondi

## Esempio

```javascript
$('#myElement').contextMenuPlugin({
  getMenu: function ($element) {
    return [
      { icon: '', label: 'Azioni', action: () => console.log('Azioni') },
      { icon: '', label: 'Proprietà', action: () => console.log('Proprietà') }
    ];
  },
  longPressDuration: 800
});
