/*
 * Context menu plugin for jQuery
 *
 * Copyright (c) 2025, Edoardo Monti
 * Licensed under the MIT License
 * https://github.com/EdoardoDevelop/JqContextmenu
 */

(function ($) {
  const pluginNamespace = 'contextMenuPlugin';

  $.fn.contextMenuPlugin = function (optionsOrCommand) {
    // Gestione comando "destroy"
    if (typeof optionsOrCommand === 'string' && optionsOrCommand === 'destroy') {
      return this.each(function () {
        const $context = $(this);
        $context.off(`.${pluginNamespace}`);
        $(document).off(`.${pluginNamespace}`);
        $(window).off(`.${pluginNamespace}`);
        $('#contextMenuPlugin').remove();
      });
    }

    const settings = $.extend({
      delegate: null,
      getMenu: function ($element) { return []; },
      longPressDuration: 600,
      onShow: function ($target, items) {},
      onHide: function () {},
      onItemClick: function ($target, item) {}
    }, optionsOrCommand);

    let $menu = $('#contextMenuPlugin');
    if ($menu.length === 0) {
      $('body').append('<div id="contextMenuPlugin" style="position:absolute;display:none;z-index:9999"><ul></ul></div>');
      $menu = $('#contextMenuPlugin');
    }
    const $menuList = $menu.find('ul');
    let longPressTimer;

    function hideMenu() {
      $menu.fadeOut(100, settings.onHide);
    }

    function renderMenuItems(items, $target) {
      const currentItemsHTML = $menuList.data('lastRender');
      const newItemsHTML = items.map(item => JSON.stringify(item)).join('');

      if (currentItemsHTML === newItemsHTML) return;
      $menuList.empty();

      items.forEach(item => {
        if (item.separator) {
          $menuList.append('<li class="separator" style="border-top:1px solid #ccc; margin:5px 0;"></li>');
          return;
        }

        const $li = $('<li style="cursor:pointer; padding:5px 10px;"></li>');

        if (item.type === 'checkbox') {
          const checkboxId = `checkbox_${Math.random().toString(36).substr(2, 9)}`;
          const $checkbox = $(`\
            <label for="${checkboxId}" style="cursor:pointer; display:flex; align-items:center;">\
              <input type="checkbox" id="${checkboxId}" ${item.checked ? 'checked' : ''} style="margin-right:8px;" />\
              ${item.label}\
            </label>`);

          $checkbox.find('input').on('change', function (e) {
            e.stopPropagation();
            const checked = $(this).is(':checked');
            item.onChange?.($target, checked);

            if (item.actionToServer) {
              const req = item.actionToServer;
              const dataPayload = typeof req.data === 'function'
                ? req.data($target, checked)
                : { ...req.data, checked };

              $.ajax({
                url: req.url,
                method: req.method || 'POST',
                data: dataPayload,
                success: res => req.onSuccess?.(res, $target, checked),
                error: (xhr, status, err) => req.onError?.(err, $target, checked)
              });
            }
          });

          $li.append($checkbox);
        } else {
          $li.append(`<span class="icon">${item.icon || ''}</span> `)
             .append(`<span class="label">${item.label}</span>`);

          $li.on('click', function (ev) {
            ev.stopPropagation();

            if (item.confirm && !window.confirm(item.confirm)) return;

            item.action?.($target);

            if (item.actionToServer) {
              const req = item.actionToServer;
              const dataPayload = typeof req.data === 'function'
                ? req.data($target)
                : req.data;

              $.ajax({
                url: req.url,
                method: req.method || 'GET',
                data: dataPayload,
                success: res => req.onSuccess?.(res, $target),
                error: (xhr, status, err) => req.onError?.(err, $target)
              });
            }

            settings.onItemClick?.($target, item);
            hideMenu();
          });
        }

        $menuList.append($li);
      });

      $menuList.data('lastRender', newItemsHTML);
    }

    function showMenu(e, $target) {
      e.preventDefault();

      const items = settings.getMenu($target);
      if (!items || !items.length) return;

      renderMenuItems(items, $target);

      const menuWidth = $menu.outerWidth();
      const menuHeight = $menu.outerHeight();
      const winWidth = $(window).width();
      const winHeight = $(window).height();
      let x = e.pageX, y = e.pageY;

      if (x + menuWidth > winWidth) x = winWidth - menuWidth - 10;
      if (y + menuHeight > winHeight) y = winHeight - menuHeight - 10;

      $menu.css({ top: y, left: x }).fadeIn(150);
      settings.onShow?.($target, items);
    }

    $(document).off(`click.${pluginNamespace} touchstart.${pluginNamespace}`)
               .on(`click.${pluginNamespace} touchstart.${pluginNamespace}`, hideMenu);

    $menu.off(`click.${pluginNamespace} touchstart.${pluginNamespace}`)
         .on(`click.${pluginNamespace} touchstart.${pluginNamespace}`, e => e.stopPropagation());

    $(window).off(`scroll.${pluginNamespace} resize.${pluginNamespace}`)
             .on(`scroll.${pluginNamespace} resize.${pluginNamespace}`, hideMenu);

    return this.each(function () {
      const $context = $(this);

      if (settings.delegate) {
        $context.off(`contextmenu.${pluginNamespace}`)
                .on(`contextmenu.${pluginNamespace}`, settings.delegate, function (e) {
                  showMenu(e, $(this));
                });

        $context.off(`touchstart.${pluginNamespace}`)
                .on(`touchstart.${pluginNamespace}`, settings.delegate, function (e) {
                  const $el = $(this);
                  longPressTimer = setTimeout(() => {
                    showMenu(e.originalEvent.touches[0], $el);
                  }, settings.longPressDuration);
                });

        $context.off(`touchend.${pluginNamespace} touchmove.${pluginNamespace}`)
                .on(`touchend.${pluginNamespace} touchmove.${pluginNamespace}`, settings.delegate, () => {
                  clearTimeout(longPressTimer);
                });
      }
    });
  };
})(jQuery);
