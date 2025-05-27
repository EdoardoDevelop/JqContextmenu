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
* `onShow`: evento che viene eseguito quando il menu viene mostrato
* `onHide`: evento che viene eseguito quando il menu viene nascosto
* `onItemClick`: evento che viene eseguito quando un elemento del menu viene cliccato

## Esempio

```javascript
$('#myElement').contextMenuPlugin({
  getMenu: function ($element) {
    return [
      //elemento semplice
      { icon: '📝', label: 'Azioni', action: ($target) => console.log('Azioni') },
      //action ajax al click
      {
        label: 'Elimina',
        icon: '🗑️',
        confirm: 'Sei sicuro di voler eliminare questo elemento?',
        actionToServer: {
          url: '/api/delete',
          method: 'POST',
          data: el => ({ id: el.data('id') }),
          onSuccess: () => alert('Eliminato con successo!'),
          onError:   () => alert('Errore durante l\'eliminazione')
        }
      },
      //checkbox e action ajax al cambio di stato
      {
        label: 'Attiva notifica',
        type: 'checkbox',
        checked: $element.data('notify-enabled') === true,
        onChange: function ($el, checked) {
          console.log('Notifica attiva:', checked);
          $el.data('notify-enabled', checked); // aggiorna stato locale
        },
        actionToServer: {
          url: '/api/toggle-notifica',
          method: 'POST',
          data: function ($el, checked) {
            return {
              id: $el.data('id'),
              enabled: checked
            };
          },
          onSuccess: function (res, $el, checked) {
            console.log('Salvato sul server:', res);
          }
        }
      },
      //separatore
      { separator: true },
    ];
  },
  longPressDuration: 800,
  onShow: function ($target, items) {
    console.log('Menu mostrato su:', $target);
  },
  onHide: function () {
    console.log('Menu nascosto');
  },
  onItemClick: function ($target, item) {
    console.log('Cliccato:', item.label);
  }
});
