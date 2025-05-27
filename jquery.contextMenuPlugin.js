/*
 * Context menu plugin for jQuery
 *
 * Copyright (c) 2019, Edoardo Monti
 * Licensed under the MIT License
 * https://github.com/EdoardoDevelop/JqContextmenu
 */

(function ($) {
  $.fn.contextMenuPlugin = function (options) {
    const settings = $.extend({
      getMenu: function ($element) { return []; },
      longPressDuration: 600,
      onShow: function ($target, items) {},
      onHide: function () {},
      onItemClick: function ($target, item) {}
    }, options);

    /* ---- evita duplicati ---- */
    let $menu = $('#contextMenuPlugin');
    if ($menu.length === 0) {
      $('body').append('<div id="contextMenuPlugin" style="position:absolute;display:none;z-index:9999"><ul></ul></div>');
      $menu = $('#contextMenuPlugin');
    }
    const $menuList = $menu.find('ul');
    let longPressTimer;

    /* ---------- helpers ---------- */
    function showMenu (e, $target) {
      e.preventDefault();

      const items = settings.getMenu($target);
      if (!items || !items.length) return;

      $menuList.empty();

      items.forEach(item => {
        if (item.separator) {
          $menuList.append('<li class="separator" style="border-top:1px solid #ccc; margin:5px 0;"></li>');
          return;
        }

        const $li = $('<li style="cursor:pointer; padding:5px 10px;"></li>');
        $li.append(`<span class="icon">${item.icon || ''}</span> `)
           .append(`<span class="label">${item.label}</span>`);

        $li.on('click', function (ev) {
          ev.stopPropagation();

          /* --- conferma opzionale --- */
          if (item.confirm && !window.confirm(item.confirm)) return;

          /* --- azione locale --- */
          if (typeof item.action === 'function') {
            item.action($target);
          }

          /* --- azione server (AJAX) --- */
          if (item.actionToServer) {
            const req = item.actionToServer;
            const dataPayload = typeof req.data === 'function' ? req.data($target) : req.data;

            $.ajax({
              url: req.url,
              method: req.method || 'GET',
              data: dataPayload,
              success: function (response) {
                if (typeof req.onSuccess === 'function') req.onSuccess(response, $target);
              },
              error: function (xhr, status, error) {
                if (typeof req.onError === 'function') req.onError(error, $target);
              }
            });
          }

          /* --- callback globale e chiusura --- */
          settings.onItemClick?.($target, item);
          hideMenu();
        });

        $menuList.append($li);
      });

      /* ---- posizionamento con controllo overflow ---- */
      const menuWidth  = $menu.outerWidth();
      const menuHeight = $menu.outerHeight();
      const winWidth   = $(window).width();
      const winHeight  = $(window).height();
      let x = e.pageX,
          y = e.pageY;

      if (x + menuWidth  > winWidth)  x = winWidth  - menuWidth  - 10;
      if (y + menuHeight > winHeight) y = winHeight - menuHeight - 10;

      $menu.css({ top: y, left: x }).fadeIn(150);
      settings.onShow?.($target, items);
    }

    function hideMenu () {
      $menu.fadeOut(100, settings.onHide);
    }

    /* ---------- bindings globali ---------- */
    $(document).on('click touchstart', hideMenu);
    $menu.on('click touchstart', e => e.stopPropagation());
    $(window).on('scroll resize', hideMenu);

    /* ---------- binding per ogni elemento ---------- */
    return this.each(function () {
      const $el = $(this);

      $el.off('contextmenu.contextMenuPlugin')
         .on('contextmenu.contextMenuPlugin', e => showMenu(e, $el));

      $el.off('touchstart.contextMenuPlugin')
         .on('touchstart.contextMenuPlugin', e => {
           longPressTimer = setTimeout(() => {
             showMenu(e.originalEvent.touches[0], $el);
           }, settings.longPressDuration);
         });

      $el.off('touchend.contextMenuPlugin touchmove.contextMenuPlugin')
         .on('touchend.contextMenuPlugin touchmove.contextMenuPlugin', () => {
           clearTimeout(longPressTimer);
         });
    });
  };
})(jQuery);
