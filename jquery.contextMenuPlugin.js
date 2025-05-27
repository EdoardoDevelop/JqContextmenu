/*
 * Context menu plugin for jQuery
 *
 * Copyright (c) 2025, Edoardo Monti
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
          $menuList.append('<li class="separator" style="border-top:1px solid #ccc; margin:5px 0;"></li>');
          return;
        }

        const $li = $('<li style="cursor:pointer; padding:5px 10px;"></li>');

        // Checkbox type
        if (item.type === 'checkbox') {
          const checkboxId = `checkbox_${Math.random().toString(36).substr(2, 9)}`;
          const $checkbox = $(`
            <label for="${checkboxId}" style="cursor:pointer; display:flex; align-items:center;">
              <input type="checkbox" id="${checkboxId}" ${item.checked ? 'checked' : ''} style="margin-right:8px;" />
              ${item.label}
            </label>
          `);

          $checkbox.find('input').on('change', function (e) {
            e.stopPropagation();
            const checked = $(this).is(':checked');

            if (typeof item.onChange === 'function') {
              item.onChange($target, checked);
            }

            if (item.actionToServer) {
              const req = item.actionToServer;
              const dataPayload = typeof req.data === 'function'
                ? req.data($target, checked)
                : { ...req.data, checked };

              $.ajax({
                url: req.url,
                method: req.method || 'POST',
                data: dataPayload,
                success: function (response) {
                  if (typeof req.onSuccess === 'function') req.onSuccess(response, $target, checked);
                },
                error: function (xhr, status, error) {
                  if (typeof req.onError === 'function') req.onError(error, $target, checked);
                }
              });
            }
          });

          $li.append($checkbox);
        } else {
          // Normal item
          $li.append(`<span class="icon">${item.icon || ''}</span> `)
             .append(`<span class="label">${item.label}</span>`);

          $li.on('click', function (ev) {
            ev.stopPropagation();

            if (item.confirm && !window.confirm(item.confirm)) return;

            if (typeof item.action === 'function') {
              item.action($target);
            }

            if (item.actionToServer) {
              const req = item.actionToServer;
              const dataPayload = typeof req.data === 'function'
                ? req.data($target)
                : req.data;

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

            settings.onItemClick?.($target, item);
            hideMenu();
          });
        }

        $menuList.append($li);
      });

      // Posizionamento intelligente
      const menuWidth  = $menu.outerWidth();
      const menuHeight = $menu.outerHeight();
      const winWidth   = $(window).width();
      const winHeight  = $(window).height();
      let x = e.pageX, y = e.pageY;

      if (x + menuWidth > winWidth) x = winWidth - menuWidth - 10;
      if (y + menuHeight > winHeight) y = winHeight - menuHeight - 10;

      $menu.css({ top: y, left: x }).fadeIn(150);
      settings.onShow?.($target, items);
    }

    function hideMenu() {
      $menu.fadeOut(100, settings.onHide);
    }

    // Global bindings
    $(document).on('click touchstart', hideMenu);
    $menu.on('click touchstart', e => e.stopPropagation());
    $(window).on('scroll resize', hideMenu);

    // Element bindings
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
