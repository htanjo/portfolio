(function () {
  'use strict';

  var $ = window.jQuery;
  var _ = window._;
  var App = window.App;

  var ACTIVITY_API = 'https://api.github.com/search/repositories?q=user:htanjo';
  var NULL_LANG_NAME = 'Other';
  var NULL_LANG_COLOR = '#ededed';

  $(function () {

    var $grid = $('#grid');

    function init() {
      loadItems(function (data) {
        var parsed = parse(data);
        var number = parsed['total_count'];
        var items = parsed.items;
        count(number);
        setTimeout(function () {
          showUtilities();
          appendItems(items);
          setTimeout (function () {
            initShuffle();
            initUtilities(items);
          }, 0);
        }, 1000);
      });
    }

    function loadItems(callback) {
      $.ajax(ACTIVITY_API)
        .done(function (data) {
          if (typeof callback === 'function') {
            callback(data);
          }
        });
    }

    function parse(data) {
      var parsed = data;
      if (!parsed.items) {
        parsed.items = [];
        return parsed;
      }
      parsed.items.forEach(function (item) {
        if (item.language) {
          item['language_color'] = App.languages[item.language].color || NULL_LANG_COLOR;
        }
        else {
          item['language'] = NULL_LANG_NAME;
          item['language_color'] = NULL_LANG_COLOR;
        }
      });
      return parsed;
    }

    function count(number) {
      $('.counter__value').animateNumber({
        number: number
      }, 800);
    }

    function showUtilities() {
      $('.utilities').addClass('in');
    }

    function appendItems(items) {
      var html = App.templates.items({items: items});
      $grid.append(html);
    }

    function initShuffle() {
      $grid.shuffle({
        itemSelector: '.item',
        gutterWidth: 50,
        columnWidth: 200,
        speed: 350
      });
      $grid.find('.item').each(function () {
        showItem(this);
      });
    }

    function showItem(item) {
      var delay = Math.floor(Math.random() * 500);
      setTimeout(function () {
        $(item).addClass('in');
      }, delay);
    }

    function initUtilities(items) {
      var langs = {
        langs: _.uniq(_.pluck(items, 'language')).sort().sort(function (language) {
          return language === NULL_LANG_NAME;
        })
      };
      var filters = App.templates.filters(langs);
      var $sort = $('.sort-options');
      var $filters = $('.filters').append(filters).find('input');

      $sort.on('change', function () {
        var $selected = $(this).find(':selected');
        var sort = $selected.data('sort');
        var reverse = $selected.data('reverse') || false;
        var opts = {
          reverse: reverse,
          by: function ($el) {
            return $el.data(sort).toLowerCase();
          }
        };
        $grid.shuffle('sort', opts);
      });
      $sort.trigger('change');

      $filters.on('change', function () {
        var $checked = $filters.filter(':checked');
        var langs = [];
        $checked.each(function () {
          langs.push($(this).data('lang'));
        });
        $grid.shuffle('shuffle', function ($el) {
          return langs.length === 0 || langs.indexOf($el.data('lang')) !== -1;
        });
      });
    }

    init();

  });

}());
