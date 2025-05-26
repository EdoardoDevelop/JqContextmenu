/*
 * Context menu plugin for jQuery
 *
 * Copyright (c) 2019, Edoardo Monti
 * Licensed under the MIT License
 * https://github.com/EdoardoDevelop/JqContextmenu
 */

(function ($) {
  /**
   * Plugin per creare un menu contestuale su elementi jQuery.
   * Richiede che l'elemento abbia un evento di tipo "contextmenu" associato.
   * @param {Object} [options] opzioni per il plugin
   * @param {Function} [options.getMenu] funzione che ritorna l'elenco degli elementi del menu
   * @param {Number} [options.longPressDuration] durata in millisecondi della pressione lunga per attivare il menu
   * @returns {jQuery} l'elemento jQuery su cui è stato chiamato il plugin
   */
  $.fn.contextMenuPlugin = function (options) {
    const settings = $.extend({
      getMenu: function ($element) { return []; },
      longPressDuration: 600
    }, options);

    if ($('#contextMenuPlugin').length === 0) {
      $('body').append('<div id="contextMenuPlugin"><ul></ul></div>');
    }

    const $menu = $('#contextMenuPlugin');
    const $menuList = $menu.find('ul');
    let longPressTimer;

    /**
     * Mostra il menu contestuale in base all'evento e all'elemento target.
     * 
     * @param {Event} e - L'evento del mouse che ha attivato il menu contestuale.
     * @param {jQuery} $target - L'elemento jQuery su cui il menu viene attivato.
     * 
     * Prevenire l'azione predefinita e popolare il menu con gli elementi ottenuti
     * tramite la funzione getMenu dalle impostazioni. Selezionare e posizionare
     * il menu in base alla posizione del cursore.
     */
    function showMenu(e, $target) {
      e.preventDefault();
      const items = settings.getMenu($target);
      if (!items || !items.length) return;

      $menuList.empty();

      items.forEach(item => {
        const $li = $('<li></li>');
        $li.append(`<span class="icon">${item.icon || ''}</span>`);
        $li.append(`<span class="label">${item.label}</span>`);
        $li.on('click', function (ev) {
          ev.stopPropagation();
          item.action?.($target);
          hideMenu();
        });
        $menuList.append($li);
      });

      $menu.css({
        top: e.pageY,
        left: e.pageX
      }).fadeIn(150);
    }

    /**
     * Nasconde il menu contestuale.
     * 
     * Questo metodo è utilizzato per nascondere il menu contestuale in
     * seguito ad eventi come il click, il touchstart o il resize della
     * finestra.
     */
    function hideMenu() {
      $menu.fadeOut(100);
    }

    $(document).on('click touchstart', function () {
      hideMenu();
    });

    $menu.on('click touchstart', function (e) {
      e.stopPropagation();
    });

    $(window).on('scroll resize', hideMenu);

    return this.each(function () {
      const $el = $(this);

      $el.on('contextmenu', function (e) {
        showMenu(e, $el);
      });

      $el.on('touchstart', function (e) {
        longPressTimer = setTimeout(() => {
          showMenu(e.originalEvent.touches[0], $el);
        }, settings.longPressDuration);
      });

      $el.on('touchend touchmove', function () {
        clearTimeout(longPressTimer);
      });
    });
  };
})(jQuery);
