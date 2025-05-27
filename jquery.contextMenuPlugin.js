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

    // Crea il menu solo se non esiste già
    let $menu = $('#contextMenuPlugin');
    if ($menu.length === 0) {
      $('body').append('<div id="contextMenuPlugin" style="position:absolute;display:none;z-index:9999"><ul></ul></div>');
      $menu = $('#contextMenuPlugin');
    }
    const $menuList = $menu.find('ul');
    let longPressTimer;

    function showMenu(e, $target) {
      e.preventDefault();

      const items = settings.getMenu($target);
      if (!items || !items.length) return;

      $menuList.empty();

      items.forEach(item => {
        if (item.separator) {
          $menuList.append('<li class="separator" style="border-top:1px solid #ccc; margin: 5px 0;"></li>');
        } else {
          const $li = $('<li style="cursor:pointer; padding:5px 10px;"></li>');
          $li.append(`<span class="icon">${item.icon || ''}</span> `);
          $li.append(`<span class="label">${item.label}</span>`);
          $li.on('click', function (ev) {
            ev.stopPropagation();
            item.action?.($target);
            settings.onItemClick?.($target, item);
            hideMenu();
          });
          $menuList.append($li);
        }
      });

      const menuWidth = $menu.outerWidth();
      const menuHeight = $menu.outerHeight();
      const pageWidth = $(window).width();
      const pageHeight = $(window).height();
      let x = e.pageX;
      let y = e.pageY;

      // Controllo overflow viewport
      if (x + menuWidth > pageWidth) x = pageWidth - menuWidth - 10;
      if (y + menuHeight > pageHeight) y = pageHeight - menuHeight - 10;

      $menu.css({ top: y, left: x }).fadeIn(150);
      settings.onShow?.($target, items);
    }

    function hideMenu() {
      $menu.fadeOut(100, settings.onHide);
    }

    $(document).on('click touchstart', hideMenu);
    $menu.on('click touchstart', function (e) { e.stopPropagation(); });
    $(window).on('scroll resize', hideMenu);

    return this.each(function () {
      const $el = $(this);

      $el.off('contextmenu.contextMenuPlugin')
        .on('contextmenu.contextMenuPlugin', function (e) {
          showMenu(e, $el);
        });

      $el.off('touchstart.contextMenuPlugin')
        .on('touchstart.contextMenuPlugin', function (e) {
          longPressTimer = setTimeout(() => {
            showMenu(e.originalEvent.touches[0], $el);
          }, settings.longPressDuration);
        });

      $el.off('touchend.contextMenuPlugin touchmove.contextMenuPlugin')
        .on('touchend.contextMenuPlugin touchmove.contextMenuPlugin', function () {
          clearTimeout(longPressTimer);
        });
    });
  };
})(jQuery);
