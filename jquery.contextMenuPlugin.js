(function ($) {
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
